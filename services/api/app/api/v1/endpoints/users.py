from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.api import deps
from app.core.config import settings
from app.models.user import User
from app.schemas.user import UserRead, UserCreate, UserUpdate
from app.schemas.common import PaginatedResponse, ResponseModel
from app.services.user_service import user_service
from app.services.audit_service import audit_service
from app.utils.validators import validate_email, validate_phone
from app.utils.formatters import format_name, format_phone_number

router = APIRouter()

@router.get("/me", response_model=UserRead)
def read_user_me(
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get current user profile.
    """
    return current_user

@router.put("/me", response_model=UserRead)
def update_user_me(
    *,
    db: Session = Depends(deps.get_db),
    user_in: UserUpdate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update current user profile.
    """
    # Validate email if provided
    if user_in.email and not validate_email(user_in.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email format"
        )
    
    # Validate phone if provided
    if user_in.phone and not validate_phone(user_in.phone):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid phone number format"
        )
    
    # Format names if provided
    if user_in.first_name:
        user_in.first_name = format_name(user_in.first_name)
    if user_in.last_name:
        user_in.last_name = format_name(user_in.last_name)
    if user_in.middle_name:
        user_in.middle_name = format_name(user_in.middle_name)
    
    # Format phone if provided
    if user_in.phone:
        user_in.phone = format_phone_number(user_in.phone)
    
    # Check if email is already taken by another user
    if user_in.email and user_in.email != current_user.email:
        existing_user = user_service.get_user_by_email(db, user_in.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
    
    updated_user = user_service.update_user(db, current_user.id, user_in)
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return updated_user

@router.get("/", response_model=PaginatedResponse[UserRead])
def read_users(
    db: Session = Depends(deps.get_db),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=100, description="Number of records to return"),
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Retrieve users (Admin only).
    """
    users = user_service.get_users(db, skip=skip, limit=limit)
    total = db.query(User).count()
    
    return PaginatedResponse(
        items=users,
        total=total,
        page=skip // limit + 1,
        size=limit,
        pages=(total + limit - 1) // limit
    )

@router.post("/", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def create_user(
    *,
    db: Session = Depends(deps.get_db),
    user_in: UserCreate,
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Create new user (Admin only).
    """
    # Validate email
    if not validate_email(user_in.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email format"
        )
    
    # Validate phone if provided
    if user_in.phone and not validate_phone(user_in.phone):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid phone number format"
        )
    
    # Format names
    user_in.first_name = format_name(user_in.first_name)
    user_in.last_name = format_name(user_in.last_name)
    if user_in.middle_name:
        user_in.middle_name = format_name(user_in.middle_name)
    
    # Format phone if provided
    if user_in.phone:
        user_in.phone = format_phone_number(user_in.phone)
    
    # Check if user already exists
    existing_user = user_service.get_user_by_email(db, user_in.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    try:
        user = user_service.create_user(db, user_in)
        
        # Log audit
        audit_service.log_action(
            db=db,
            user_id=current_user.id,
            action="USER_CREATED_BY_ADMIN",
            details=f"Admin {current_user.email} created user {user.email}"
        )
        
        return user
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user"
        )


@router.delete("/{user_id}", response_model=ResponseModel)
def delete_user(
    *,
    db: Session = Depends(deps.get_db),
    user_id: int,
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Delete user (Admin only).
    """
    # Prevent self-deletion
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    user = user_service.get_user(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    success = user_service.delete_user(db, user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete user"
        )
    
    # Log audit
    audit_service.log_action(
        db=db,
        user_id=current_user.id,
        action="USER_DELETED",
        resource_type="user",
        resource_id=user_id,
        details={"deleted_user_email": user.email}
    )
    
    return ResponseModel(
        success=True,
        message="User deleted successfully"
    )


@router.patch("/{user_id}/activate", response_model=ResponseModel)
def activate_user(
    *,
    db: Session = Depends(deps.get_db),
    user_id: int,
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Activate user (Admin only).
    """
    user = user_service.get_user(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.is_active = True
    db.commit()
    
    # Log audit
    audit_service.log_action(
        db=db,
        user_id=current_user.id,
        action="USER_ACTIVATED",
        resource_type="user",
        resource_id=user_id,
        details={"activated_user_email": user.email}
    )
    
    return ResponseModel(
        success=True,
        message="User activated successfully"
    )


@router.patch("/{user_id}/deactivate", response_model=ResponseModel)
def deactivate_user(
    *,
    db: Session = Depends(deps.get_db),
    user_id: int,
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Deactivate user (Admin only).
    """
    # Prevent self-deactivation
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot deactivate your own account"
        )
    
    user = user_service.get_user(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.is_active = False
    db.commit()
    
    # Log audit
    audit_service.log_action(
        db=db,
        user_id=current_user.id,
        action="USER_DEACTIVATED",
        resource_type="user",
        resource_id=user_id,
        details={"deactivated_user_email": user.email}
    )
    
    return ResponseModel(
        success=True,
        message="User deactivated successfully"
    )


@router.get("/search/{query}", response_model=List[UserRead])
def search_users(
    *,
    db: Session = Depends(deps.get_db),
    query: str,
    limit: int = Query(default=20, le=100),
    current_user: User = Depends(deps.get_current_staff_user),
) -> Any:
    """
    Search users by name or email (Staff only).
    """
    from sqlalchemy import or_
    
    users = db.query(User).filter(
        or_(
            User.first_name.ilike(f"%{query}%"),
            User.last_name.ilike(f"%{query}%"),
            User.email.ilike(f"%{query}%")
        )
    ).limit(limit).all()
    
    return users

@router.put("/{user_id}", response_model=UserRead)
def update_user(
    *,
    db: Session = Depends(deps.get_db),
    user_id: int,
    user_in: UserUpdate,
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Update user (Admin only).
    """
    user = user_service.get_user(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Validate email if provided
    if user_in.email and not validate_email(user_in.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email format"
        )
    
    # Validate phone if provided
    if user_in.phone and not validate_phone(user_in.phone):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid phone number format"
        )
    
    # Format names if provided
    if user_in.first_name:
        user_in.first_name = format_name(user_in.first_name)
    if user_in.last_name:
        user_in.last_name = format_name(user_in.last_name)
    if user_in.middle_name:
        user_in.middle_name = format_name(user_in.middle_name)
    
    # Format phone if provided
    if user_in.phone:
        user_in.phone = format_phone_number(user_in.phone)
    
    # Check if email is already taken by another user
    if user_in.email and user_in.email != user.email:
        existing_user = user_service.get_user_by_email(db, user_in.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
    
    updated_user = user_service.update_user(db, user_id, user_in)
    
    # Log audit
    audit_service.log_action(
        db=db,
        user_id=current_user.id,
        action="USER_UPDATED_BY_ADMIN",
        details=f"Admin {current_user.email} updated user {updated_user.email}"
    )
    
    return updated_user

@router.get("/{user_id}", response_model=UserRead)
def read_user(
    *,
    db: Session = Depends(deps.get_db),
    user_id: int,
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Get user by ID (Admin only).
    """
    user = user_service.get_user(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user