"""User Management Service - Complete Implementation"""
from typing import List, Optional, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from fastapi import HTTPException, status

from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.services.audit_service import audit_service
from app.services.notification_service import notification_service
from app.core.security import get_password_hash
from app.utils.validators import validate_email, validate_phone, validate_name
from app.utils.formatters import format_name, format_phone_number

class UserService:
    """Complete user management service"""
    
    def get_user(self, db: Session, user_id: int) -> Optional[User]:
        """Get user by ID"""
        return db.query(User).filter(User.id == user_id).first()
    
    def get_user_by_email(self, db: Session, email: str) -> Optional[User]:
        """Get user by email"""
        return db.query(User).filter(User.email == email).first()
    
    def get_users(self, db: Session, skip: int = 0, limit: int = 100, search: str = None, role: str = None) -> List[User]:
        """Get users with optional search and role filter"""
        query = db.query(User)
        
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    User.full_name.ilike(search_term),
                    User.email.ilike(search_term)
                )
            )
        
        if role:
            query = query.filter(User.role == role)
        
        return query.offset(skip).limit(limit).all()
    
    def count_users(self, db: Session, search: str = None, role: str = None) -> int:
        """Count users with optional filters"""
        query = db.query(func.count(User.id))
        
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    User.full_name.ilike(search_term),
                    User.email.ilike(search_term)
                )
            )
        
        if role:
            query = query.filter(User.role == role)
        
        return query.scalar()
    
    def create_user(self, db: Session, user_create: UserCreate, created_by: int = None) -> User:
        """Create new user"""
        # Validate email
        if not validate_email(user_create.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid email format"
            )
        
        # Validate name
        if not validate_name(user_create.full_name):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid name format"
            )
        
        # Validate phone if provided
        if user_create.phone and not validate_phone(user_create.phone):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid phone number format"
            )
        
        # Check if email already exists
        existing_user = self.get_user_by_email(db, user_create.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create user
        hashed_password = get_password_hash(user_create.password)
        db_user = User(
            email=user_create.email,
            hashed_password=hashed_password,
            full_name=format_name(user_create.full_name),
            phone=format_phone_number(user_create.phone) if user_create.phone else None,
            address=user_create.address,
            date_of_birth=user_create.date_of_birth,
            gender=user_create.gender,
            role=user_create.role or "user",
            is_active=True,
            is_verified=False,
            created_at=datetime.utcnow(),
            created_by=created_by
        )
        
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        # Send welcome notification
        notification_service.send_welcome_email(db_user.email, db_user.full_name)
        
        # Log audit
        audit_service.log_action(
            db=db,
            user_id=created_by or db_user.id,
            action="USER_CREATED",
            resource_type="User",
            resource_id=db_user.id,
            description=f"User created: {db_user.email}"
        )
        
        return db_user
    
    def update_user(self, db: Session, user_id: int, user_update: UserUpdate, updated_by: int) -> Optional[User]:
        """Update user information"""
        user = self.get_user(db, user_id)
        if not user:
            return None
        
        update_data = user_update.dict(exclude_unset=True)
        
        # Validate email if being updated
        if "email" in update_data and not validate_email(update_data["email"]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid email format"
            )
        
        # Check if new email already exists
        if "email" in update_data and update_data["email"] != user.email:
            existing_user = self.get_user_by_email(db, update_data["email"])
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered"
                )
        
        # Validate name if being updated
        if "full_name" in update_data and not validate_name(update_data["full_name"]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid name format"
            )
        
        # Validate phone if being updated
        if "phone" in update_data and update_data["phone"] and not validate_phone(update_data["phone"]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid phone number format"
            )
        
        # Format fields
        if "full_name" in update_data:
            update_data["full_name"] = format_name(update_data["full_name"])
        
        if "phone" in update_data and update_data["phone"]:
            update_data["phone"] = format_phone_number(update_data["phone"])
        
        # Update user
        for field, value in update_data.items():
            if field != "password":  # Handle password separately
                setattr(user, field, value)
        
        user.updated_at = datetime.utcnow()
        user.updated_by = updated_by
        
        db.commit()
        db.refresh(user)
        
        # Log audit
        audit_service.log_action(
            db=db,
            user_id=updated_by,
            action="USER_UPDATED",
            resource_type="User",
            resource_id=user_id,
            description=f"User updated: {user.email}"
        )
        
        return user
    
    def deactivate_user(self, db: Session, user_id: int, deactivated_by: int) -> bool:
        """Deactivate user account"""
        user = self.get_user(db, user_id)
        if not user:
            return False
        
        user.is_active = False
        user.updated_at = datetime.utcnow()
        user.updated_by = deactivated_by
        
        db.commit()
        
        # Send notification
        notification_service.send_account_deactivation_notice(user.email, user.full_name)
        
        # Log audit
        audit_service.log_action(
            db=db,
            user_id=deactivated_by,
            action="USER_DEACTIVATED",
            resource_type="User",
            resource_id=user_id,
            description=f"User deactivated: {user.email}"
        )
        
        return True
    
    def activate_user(self, db: Session, user_id: int, activated_by: int) -> bool:
        """Activate user account"""
        user = self.get_user(db, user_id)
        if not user:
            return False
        
        user.is_active = True
        user.updated_at = datetime.utcnow()
        user.updated_by = activated_by
        
        db.commit()
        
        # Send notification
        notification_service.send_account_activation_notice(user.email, user.full_name)
        
        # Log audit
        audit_service.log_action(
            db=db,
            user_id=activated_by,
            action="USER_ACTIVATED",
            resource_type="User",
            resource_id=user_id,
            description=f"User activated: {user.email}"
        )
        
        return True
    
    def delete_user(self, db: Session, user_id: int, deleted_by: int) -> bool:
        """Soft delete user account"""
        user = self.get_user(db, user_id)
        if not user:
            return False
        
        # Check if user has active applications or is a beneficiary
        from app.models.application import Application
        from app.models.beneficiary import Beneficiary
        
        active_applications = db.query(Application).filter(
            Application.user_id == user_id,
            Application.status.in_(["pending", "approved"])
        ).count()
        
        if active_applications > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete user with active applications"
            )
        
        active_beneficiary = db.query(Beneficiary).filter(
            Beneficiary.user_id == user_id,
            Beneficiary.is_active == True
        ).first()
        
        if active_beneficiary:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete user who is an active beneficiary"
            )
        
        # Soft delete
        user.is_active = False
        user.is_deleted = True
        user.deleted_at = datetime.utcnow()
        user.deleted_by = deleted_by
        
        db.commit()
        
        # Log audit
        audit_service.log_action(
            db=db,
            user_id=deleted_by,
            action="USER_DELETED",
            resource_type="User",
            resource_id=user_id,
            description=f"User deleted: {user.email}"
        )
        
        return True
    
    def update_user_role(self, db: Session, user_id: int, new_role: str, updated_by: int) -> bool:
        """Update user role"""
        user = self.get_user(db, user_id)
        if not user:
            return False
        
        valid_roles = ["user", "staff", "admin", "super_admin"]
        if new_role not in valid_roles:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid role. Must be one of: {', '.join(valid_roles)}"
            )
        
        old_role = user.role
        user.role = new_role
        user.updated_at = datetime.utcnow()
        user.updated_by = updated_by
        
        db.commit()
        
        # Send notification
        notification_service.send_role_change_notice(user.email, user.full_name, old_role, new_role)
        
        # Log audit
        audit_service.log_action(
            db=db,
            user_id=updated_by,
            action="USER_ROLE_UPDATED",
            resource_type="User",
            resource_id=user_id,
            description=f"User role changed from {old_role} to {new_role}: {user.email}"
        )
        
        return True
    
    def get_user_statistics(self, db: Session) -> Dict[str, Any]:
        """Get user statistics"""
        total_users = db.query(func.count(User.id)).scalar()
        active_users = db.query(func.count(User.id)).filter(User.is_active == True).scalar()
        verified_users = db.query(func.count(User.id)).filter(User.is_verified == True).scalar()
        
        # Users by role
        role_stats = db.query(
            User.role,
            func.count(User.id).label('count')
        ).group_by(User.role).all()
        
        # Recent registrations (last 30 days)
        from datetime import timedelta
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        recent_registrations = db.query(func.count(User.id)).filter(
            User.created_at >= thirty_days_ago
        ).scalar()
        
        return {
            "total_users": total_users,
            "active_users": active_users,
            "verified_users": verified_users,
            "role_distribution": {role: count for role, count in role_stats},
            "recent_registrations": recent_registrations
        }

# Create service instance
user_service = UserService()