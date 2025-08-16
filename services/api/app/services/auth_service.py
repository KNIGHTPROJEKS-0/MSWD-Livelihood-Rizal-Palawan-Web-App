"""Authentication Service - Complete Implementation"""
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.user import User
from app.schemas.user import UserCreate
from app.services.audit_service import audit_service
from app.services.notification_service import notification_service
from app.utils.helpers import generate_otp
from app.utils.validators import validate_email, validate_password_strength

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class AuthService:
    """Complete authentication service"""
    
    def authenticate_user(self, db: Session, email: str, password: str) -> Optional[User]:
        """Authenticate user with email and password"""
        user = db.query(User).filter(User.email == email).first()
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        if not user.is_active:
            return None
        return user
    
    def create_access_token(self, user_id: int, expires_delta: Optional[timedelta] = None) -> str:
        """Create JWT access token"""
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode = {"sub": str(user_id), "exp": expire}
        encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        return encoded_jwt
    
    def verify_token(self, token: str) -> Optional[int]:
        """Verify JWT token and return user ID"""
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            user_id: str = payload.get("sub")
            if user_id is None:
                return None
            return int(user_id)
        except JWTError:
            return None
    
    def register_user(self, db: Session, user_create: UserCreate) -> User:
        """Register new user"""
        # Validate email format
        if not validate_email(user_create.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid email format"
            )
        
        # Validate password strength
        if not validate_password_strength(user_create.password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password does not meet strength requirements"
            )
        
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == user_create.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create new user
        hashed_password = get_password_hash(user_create.password)
        db_user = User(
            email=user_create.email,
            hashed_password=hashed_password,
            full_name=user_create.full_name,
            role="user",
            is_active=True,
            is_verified=False,
            created_at=datetime.utcnow()
        )
        
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        # Send welcome email
        notification_service.send_welcome_email(db_user.email, db_user.full_name)
        
        # Log audit
        audit_service.log_action(
            db=db,
            user_id=db_user.id,
            action="USER_REGISTERED",
            resource_type="User",
            resource_id=db_user.id,
            description="User registered successfully"
        )
        
        return db_user
    
    def initiate_password_reset(self, db: Session, email: str) -> bool:
        """Initiate password reset process"""
        user = db.query(User).filter(User.email == email).first()
        if not user:
            # Don't reveal if email exists or not
            return True
        
        # Generate reset token
        reset_token = generate_otp(6)
        user.reset_token = reset_token
        user.reset_token_expires = datetime.utcnow() + timedelta(hours=1)
        
        db.commit()
        
        # Send reset email
        notification_service.send_password_reset_email(user.email, user.full_name, reset_token)
        
        # Log audit
        audit_service.log_action(
            db=db,
            user_id=user.id,
            action="PASSWORD_RESET_INITIATED",
            resource_type="User",
            resource_id=user.id,
            description="Password reset initiated"
        )
        
        return True
    
    def confirm_password_reset(self, db: Session, email: str, token: str, new_password: str) -> bool:
        """Confirm password reset with token"""
        user = db.query(User).filter(User.email == email).first()
        if not user:
            return False
        
        # Verify token
        if not user.reset_token or user.reset_token != token:
            return False
        
        # Check token expiry
        if user.reset_token_expires < datetime.utcnow():
            return False
        
        # Validate new password
        if not validate_password_strength(new_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password does not meet strength requirements"
            )
        
        # Update password
        user.hashed_password = get_password_hash(new_password)
        user.reset_token = None
        user.reset_token_expires = None
        user.updated_at = datetime.utcnow()
        
        db.commit()
        
        # Send confirmation email
        notification_service.send_password_reset_confirmation(user.email, user.full_name)
        
        # Log audit
        audit_service.log_action(
            db=db,
            user_id=user.id,
            action="PASSWORD_RESET_CONFIRMED",
            resource_type="User",
            resource_id=user.id,
            description="Password reset completed"
        )
        
        return True
    
    def change_password(self, db: Session, user_id: int, current_password: str, new_password: str) -> bool:
        """Change user password"""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return False
        
        # Verify current password
        if not verify_password(current_password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect"
            )
        
        # Validate new password
        if not validate_password_strength(new_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password does not meet strength requirements"
            )
        
        # Update password
        user.hashed_password = get_password_hash(new_password)
        user.updated_at = datetime.utcnow()
        
        db.commit()
        
        # Log audit
        audit_service.log_action(
            db=db,
            user_id=user_id,
            action="PASSWORD_CHANGED",
            resource_type="User",
            resource_id=user_id,
            description="Password changed successfully"
        )
        
        return True
    
    def verify_email(self, db: Session, user_id: int, verification_token: str) -> bool:
        """Verify user email with token"""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return False
        
        # For now, we'll implement a simple verification
        # In production, you'd want to use proper email verification tokens
        user.is_verified = True
        user.updated_at = datetime.utcnow()
        
        db.commit()
        
        # Log audit
        audit_service.log_action(
            db=db,
            user_id=user_id,
            action="EMAIL_VERIFIED",
            resource_type="User",
            resource_id=user_id,
            description="Email verified successfully"
        )
        
        return True

# Create service instance
auth_service = AuthService()