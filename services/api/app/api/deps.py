from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.core import security
from app.core.config import settings
from app.core.database import SessionLocal
from app.crud.crud_user import user
from app.models.user import User
from app.schemas.auth import TokenData

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login"
)

def get_db() -> Generator:
    """Get database session"""
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()

def get_current_user(
    db: Session = Depends(get_db), 
    token: str = Depends(reusable_oauth2)
) -> User:
    """Get current authenticated user"""
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        token_data = TokenData(email=payload.get("sub"))
    except (JWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
    
    if not token_data.email:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
    
    user_obj = user.get_by_email(db, email=token_data.email)
    if not user_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="User not found"
        )
    
    if not user_obj.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Inactive user"
        )
    
    return user_obj

def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """Get current active user"""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Inactive user"
        )
    return current_user

def get_current_active_superuser(
    current_user: User = Depends(get_current_user),
) -> User:
    """Get current active superuser"""
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The user doesn't have enough privileges"
        )
    return current_user

def get_current_admin_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """Get current admin user"""
    if current_user.role not in ["admin", "super_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user

def get_current_staff_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """Get current staff user (admin or staff)"""
    if current_user.role not in ["admin", "super_admin", "staff"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user

def get_optional_current_user(
    db: Session = Depends(get_db),
    token: Optional[str] = Depends(reusable_oauth2)
) -> Optional[User]:
    """Get current user if token is provided, otherwise return None"""
    if not token:
        return None
    
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        token_data = TokenData(email=payload.get("sub"))
    except (JWTError, ValidationError):
        return None
    
    if not token_data.email:
        return None
    
    user_obj = user.get_by_email(db, email=token_data.email)
    if not user_obj or not user_obj.is_active:
        return None
    
    return user_obj

def verify_token(token: str) -> Optional[TokenData]:
    """Verify JWT token and return token data"""
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        email: str = payload.get("sub")
        if email is None:
            return None
        return TokenData(email=email)
    except JWTError:
        return None

def get_user_from_token(db: Session, token: str) -> Optional[User]:
    """Get user from JWT token"""
    token_data = verify_token(token)
    if not token_data or not token_data.email:
        return None
    
    user_obj = user.get_by_email(db, email=token_data.email)
    if not user_obj or not user_obj.is_active:
        return None
    
    return user_obj

def check_user_permissions(current_user: User, required_roles: list) -> bool:
    """Check if user has required permissions"""
    if not current_user.is_active:
        return False
    
    if current_user.role in required_roles:
        return True
    
    # Super admin has all permissions
    if current_user.role == "super_admin":
        return True
    
    return False

def require_permissions(required_roles: list):
    """Decorator to require specific permissions"""
    def permission_checker(current_user: User = Depends(get_current_user)) -> User:
        if not check_user_permissions(current_user, required_roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )
        return current_user
    return permission_checker

# Common permission dependencies
require_admin = require_permissions(["admin", "super_admin"])
require_staff = require_permissions(["admin", "super_admin", "staff"])
require_beneficiary = require_permissions(["beneficiary", "admin", "super_admin", "staff"])