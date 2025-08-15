from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status, Body
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api import deps
from app.core import security
from app.core.config import settings
from app.core.security import get_password_hash
from app.crud.crud_user import user
from app.models.user import User
from app.schemas.auth import Token, Login, Register, PasswordReset, PasswordResetConfirm
from app.schemas.user import UserCreate, UserRead
from app.schemas.common import MessageResponse
from app.services.auth_service import auth_service
from app.services.user_service import user_service
from app.services.notification_service import notification_service
from app.services.audit_service import audit_service
from app.utils.validators import validate_email, validate_password_strength
from app.utils.helpers import generate_otp

router = APIRouter()

@router.post("/login", response_model=Token)
def login_access_token(
    db: Session = Depends(deps.get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    user_obj = auth_service.authenticate_user(
        db, email=form_data.username, password=form_data.password
    )
    if not user_obj:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    elif not user_obj.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Inactive user"
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth_service.create_access_token(
        data={"sub": user_obj.email}, expires_delta=access_token_expires
    )
    
    # Log successful login
    audit_service.log_user_login(
        db=db,
        user_id=user_obj.id,
        ip_address="",  # TODO: Get from request
        user_agent=""   # TODO: Get from request
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "user": {
            "id": user_obj.id,
            "email": user_obj.email,
            "first_name": user_obj.first_name,
            "last_name": user_obj.last_name,
            "role": user_obj.role,
            "is_active": user_obj.is_active
        }
    }

@router.post("/login/json", response_model=Token)
def login_json(
    db: Session = Depends(deps.get_db),
    login_data: Login = Body(...)
) -> Any:
    """
    JSON login endpoint
    """
    if not validate_email(login_data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email format"
        )
    
    user_obj = auth_service.authenticate_user(
        db, email=login_data.email, password=login_data.password
    )
    if not user_obj:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    elif not user_obj.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Inactive user"
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth_service.create_access_token(
        data={"sub": user_obj.email}, expires_delta=access_token_expires
    )
    
    # Log successful login
    audit_service.log_user_login(
        db=db,
        user_id=user_obj.id,
        ip_address="",  # TODO: Get from request
        user_agent=""   # TODO: Get from request
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "user": {
            "id": user_obj.id,
            "email": user_obj.email,
            "first_name": user_obj.first_name,
            "last_name": user_obj.last_name,
            "role": user_obj.role,
            "is_active": user_obj.is_active
        }
    }

@router.post("/register", response_model=UserRead)
def register(
    *,
    db: Session = Depends(deps.get_db),
    user_in: Register
) -> Any:
    """
    Create new user account
    """
    # Validate email format
    if not validate_email(user_in.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email format"
        )
    
    # Validate password strength
    password_validation = validate_password_strength(user_in.password)
    if not password_validation["is_valid"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "message": "Password does not meet requirements",
                "feedback": password_validation["feedback"]
            }
        )
    
    # Check if user already exists
    existing_user = user.get_by_email(db, email=user_in.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The user with this email already exists in the system"
        )
    
    # Create user
    user_create = UserCreate(
        email=user_in.email,
        password=user_in.password,
        first_name=user_in.first_name,
        last_name=user_in.last_name,
        middle_name=user_in.middle_name,
        phone=user_in.phone,
        role="beneficiary"  # Default role for registration
    )
    
    try:
        created_user = user_service.create_user(db=db, user_create=user_create)
        return created_user
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/logout", response_model=MessageResponse)
def logout(
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    Logout current user
    """
    # Log logout action
    audit_service.log_user_logout(
        db=db,
        user_id=current_user.id,
        ip_address="",  # TODO: Get from request
        user_agent=""   # TODO: Get from request
    )
    
    return {"message": "Successfully logged out"}

@router.post("/test-token", response_model=UserRead)
def test_token(current_user: User = Depends(deps.get_current_user)) -> Any:
    """
    Test access token
    """
    return current_user

@router.post("/password-reset", response_model=MessageResponse)
def password_reset(
    *,
    db: Session = Depends(deps.get_db),
    password_reset_data: PasswordReset
) -> Any:
    """
    Password reset request
    """
    if not validate_email(password_reset_data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email format"
        )
    
    user_obj = user.get_by_email(db, email=password_reset_data.email)
    if not user_obj:
        # Don't reveal if email exists or not for security
        return {"message": "If the email exists, a password reset link has been sent"}
    
    # Generate reset token
    reset_token = generate_otp(length=32)
    
    # Store reset token (in production, store in Redis with expiration)
    # For now, we'll use a simple approach
    user_obj.password_reset_token = reset_token
    db.commit()
    
    # Send password reset email
    try:
        notification_service.send_password_reset_email(
            email=user_obj.email,
            name=user_obj.first_name,
            reset_token=reset_token
        )
    except Exception:
        # Log error but don't reveal to user
        pass
    
    # Log password reset request
    audit_service.log_action(
        db=db,
        user_id=user_obj.id,
        action="PASSWORD_RESET_REQUESTED",
        details=f"Password reset requested for {user_obj.email}"
    )
    
    return {"message": "If the email exists, a password reset link has been sent"}

@router.post("/password-reset/confirm", response_model=MessageResponse)
def password_reset_confirm(
    *,
    db: Session = Depends(deps.get_db),
    password_reset_confirm_data: PasswordResetConfirm
) -> Any:
    """
    Confirm password reset with token
    """
    # Validate new password strength
    password_validation = validate_password_strength(password_reset_confirm_data.new_password)
    if not password_validation["is_valid"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "message": "Password does not meet requirements",
                "feedback": password_validation["feedback"]
            }
        )
    
    # Find user by reset token
    user_obj = db.query(User).filter(
        User.password_reset_token == password_reset_confirm_data.token
    ).first()
    
    if not user_obj:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    # Update password
    user_obj.hashed_password = get_password_hash(password_reset_confirm_data.new_password)
    user_obj.password_reset_token = None  # Clear reset token
    db.commit()
    
    # Log password change
    audit_service.log_password_change(
        db=db,
        user_id=user_obj.id,
        ip_address="",  # TODO: Get from request
        user_agent=""   # TODO: Get from request
    )
    
    # Send confirmation email
    try:
        notification_service.send_password_changed_email(
            email=user_obj.email,
            name=user_obj.first_name
        )
    except Exception:
        # Log error but don't fail the request
        pass
    
    return {"message": "Password has been successfully reset"}

@router.post("/change-password", response_model=MessageResponse)
def change_password(
    *,
    db: Session = Depends(deps.get_db),
    current_password: str = Body(...),
    new_password: str = Body(...),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Change password for authenticated user
    """
    # Verify current password
    if not auth_service.verify_password(current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect current password"
        )
    
    # Validate new password strength
    password_validation = validate_password_strength(new_password)
    if not password_validation["is_valid"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "message": "Password does not meet requirements",
                "feedback": password_validation["feedback"]
            }
        )
    
    # Update password
    current_user.hashed_password = get_password_hash(new_password)
    db.commit()
    
    # Log password change
    audit_service.log_password_change(
        db=db,
        user_id=current_user.id,
        ip_address="",  # TODO: Get from request
        user_agent=""   # TODO: Get from request
    )
    
    # Send confirmation email
    try:
        notification_service.send_password_changed_email(
            email=current_user.email,
            name=current_user.first_name
        )
    except Exception:
        # Log error but don't fail the request
        pass
    
    return {"message": "Password has been successfully changed"}

@router.post("/firebase-login", response_model=Token)
def firebase_login(
    *,
    db: Session = Depends(deps.get_db),
    id_token: str = Body(..., embed=True)
) -> Any:
    """
    Login with Firebase ID token
    """
    # Verify Firebase token
    decoded_token = auth_service.verify_firebase_token(id_token)
    if not decoded_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Firebase token"
        )
    
    email = decoded_token.get("email")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email not found in Firebase token"
        )
    
    # Get or create user
    user_obj = user.get_by_email(db, email=email)
    if not user_obj:
        # Create user from Firebase data
        user_create = UserCreate(
            email=email,
            first_name=decoded_token.get("name", "").split()[0] if decoded_token.get("name") else "",
            last_name=" ".join(decoded_token.get("name", "").split()[1:]) if decoded_token.get("name") else "",
            firebase_uid=decoded_token.get("uid"),
            is_active=True,
            role="beneficiary"
        )
        user_obj = user.create(db, obj_in=user_create)
    
    if not user_obj.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Inactive user"
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth_service.create_access_token(
        data={"sub": user_obj.email}, expires_delta=access_token_expires
    )
    
    # Log successful login
    audit_service.log_user_login(
        db=db,
        user_id=user_obj.id,
        ip_address="",  # TODO: Get from request
        user_agent=""   # TODO: Get from request
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "user": {
            "id": user_obj.id,
            "email": user_obj.email,
            "first_name": user_obj.first_name,
            "last_name": user_obj.last_name,
            "role": user_obj.role,
            "is_active": user_obj.is_active
        }
    }