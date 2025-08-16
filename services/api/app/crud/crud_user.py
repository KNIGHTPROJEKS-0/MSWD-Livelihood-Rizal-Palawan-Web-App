"""User CRUD Operations"""
from typing import Any, Dict, Optional, Union, List
from sqlalchemy.orm import Session
from sqlalchemy import or_
from fastapi import HTTPException, status

from app.core.security import get_password_hash, verify_password
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.crud.base import CRUDBase

class CRUDUser(CRUDBase[User, UserCreate, UserUpdate]):
    """CRUD operations for User model"""
    
    def get_by_email(self, db: Session, *, email: str) -> Optional[User]:
        """Get user by email"""
        return db.query(User).filter(User.email == email).first()
    
    def get_by_phone(self, db: Session, *, phone: str) -> Optional[User]:
        """Get user by phone number"""
        return db.query(User).filter(User.phone == phone).first()
    
    def create(self, db: Session, *, obj_in: UserCreate) -> User:
        """Create new user"""
        # Check if email already exists
        existing_user = self.get_by_email(db, email=obj_in.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        db_obj = User(
            email=obj_in.email,
            hashed_password=get_password_hash(obj_in.password),
            full_name=obj_in.full_name,
            phone=obj_in.phone,
            address=obj_in.address,
            date_of_birth=obj_in.date_of_birth,
            gender=obj_in.gender,
            role=obj_in.role or "user",
            is_active=True,
            is_verified=False
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def update(
        self, db: Session, *, db_obj: User, obj_in: Union[UserUpdate, Dict[str, Any]]
    ) -> User:
        """Update user"""
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.dict(exclude_unset=True)
        
        # Handle password update
        if "password" in update_data:
            hashed_password = get_password_hash(update_data["password"])
            del update_data["password"]
            update_data["hashed_password"] = hashed_password
        
        # Check email uniqueness if being updated
        if "email" in update_data and update_data["email"] != db_obj.email:
            existing_user = self.get_by_email(db, email=update_data["email"])
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered"
                )
        
        return super().update(db, db_obj=db_obj, obj_in=update_data)
    
    def authenticate(self, db: Session, *, email: str, password: str) -> Optional[User]:
        """Authenticate user with email and password"""
        user = self.get_by_email(db, email=email)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user
    
    def is_active(self, user: User) -> bool:
        """Check if user is active"""
        return user.is_active
    
    def is_superuser(self, user: User) -> bool:
        """Check if user is superuser"""
        return user.role == "super_admin"
    
    def is_admin(self, user: User) -> bool:
        """Check if user is admin"""
        return user.role in ["admin", "super_admin"]
    
    def is_staff(self, user: User) -> bool:
        """Check if user is staff"""
        return user.role in ["staff", "admin", "super_admin"]
    
    def get_multi_by_role(
        self, db: Session, *, role: str, skip: int = 0, limit: int = 100
    ) -> List[User]:
        """Get users by role"""
        return (
            db.query(self.model)
            .filter(User.role == role)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def search_users(
        self, db: Session, *, search_term: str, skip: int = 0, limit: int = 100
    ) -> List[User]:
        """Search users by name or email"""
        search_pattern = f"%{search_term}%"
        return (
            db.query(self.model)
            .filter(
                or_(
                    User.full_name.ilike(search_pattern),
                    User.email.ilike(search_pattern)
                )
            )
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def deactivate(self, db: Session, *, user_id: int) -> Optional[User]:
        """Deactivate user"""
        user = self.get(db, id=user_id)
        if user:
            user.is_active = False
            db.commit()
            db.refresh(user)
        return user
    
    def activate(self, db: Session, *, user_id: int) -> Optional[User]:
        """Activate user"""
        user = self.get(db, id=user_id)
        if user:
            user.is_active = True
            db.commit()
            db.refresh(user)
        return user
    
    def verify_email(self, db: Session, *, user_id: int) -> Optional[User]:
        """Verify user email"""
        user = self.get(db, id=user_id)
        if user:
            user.is_verified = True
            db.commit()
            db.refresh(user)
        return user
    
    def update_role(self, db: Session, *, user_id: int, new_role: str) -> Optional[User]:
        """Update user role"""
        valid_roles = ["user", "staff", "admin", "super_admin"]
        if new_role not in valid_roles:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid role. Must be one of: {', '.join(valid_roles)}"
            )
        
        user = self.get(db, id=user_id)
        if user:
            user.role = new_role
            db.commit()
            db.refresh(user)
        return user

# Create instance
user = CRUDUser(User)