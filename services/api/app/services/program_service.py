"""Program Management Service - Complete Implementation"""
from typing import List, Optional, Dict, Any
from datetime import datetime, date
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, and_
from fastapi import HTTPException, status

from app.models.program import Program
from app.models.application import Application
from app.models.beneficiary import Beneficiary
from app.schemas.program import ProgramCreate, ProgramUpdate
from app.services.audit_service import audit_service
from app.services.notification_service import notification_service
from app.utils.validators import validate_program_title, validate_budget_amount
from app.utils.formatters import format_currency, format_program_code
from app.utils.helpers import generate_reference_number

class ProgramService:
    """Complete program management service"""
    
    def get_program(self, db: Session, program_id: int) -> Optional[Program]:
        """Get program by ID"""
        return db.query(Program).filter(Program.id == program_id).first()
    
    def get_program_by_code(self, db: Session, program_code: str) -> Optional[Program]:
        """Get program by code"""
        return db.query(Program).filter(Program.program_code == program_code).first()
    
    def get_programs(self, db: Session, skip: int = 0, limit: int = 100, search: str = None, 
                    status: str = None, category: str = None, is_active: bool = None) -> List[Program]:
        """Get programs with optional filters"""
        query = db.query(Program)
        
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    Program.name.ilike(search_term),
                    Program.description.ilike(search_term),
                    Program.program_code.ilike(search_term)
                )
            )
        
        if status:
            query = query.filter(Program.status == status)
        
        if category:
            query = query.filter(Program.category == category)
        
        if is_active is not None:
            query = query.filter(Program.is_active == is_active)
        
        return query.order_by(Program.created_at.desc()).offset(skip).limit(limit).all()
    
    def count_programs(self, db: Session, search: str = None, status: str = None, 
                      category: str = None, is_active: bool = None) -> int:
        """Count programs with optional filters"""
        query = db.query(func.count(Program.id))
        
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    Program.name.ilike(search_term),
                    Program.description.ilike(search_term),
                    Program.program_code.ilike(search_term)
                )
            )
        
        if status:
            query = query.filter(Program.status == status)
        
        if category:
            query = query.filter(Program.category == category)
        
        if is_active is not None:
            query = query.filter(Program.is_active == is_active)
        
        return query.scalar()
    
    def create_program(self, db: Session, program_create: ProgramCreate, created_by: int) -> Program:
        """Create new program"""
        # Validate program title
        if not validate_program_title(program_create.name):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid program title format"
            )
        
        # Validate budget amount
        if program_create.budget_amount and not validate_budget_amount(program_create.budget_amount):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid budget amount"
            )
        
        # Generate program code if not provided
        program_code = program_create.program_code
        if not program_code:
            program_code = format_program_code(program_create.name)
        
        # Check if program code already exists
        existing_program = self.get_program_by_code(db, program_code)
        if existing_program:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Program code already exists"
            )
        
        # Create program
        db_program = Program(
            name=program_create.name,
            description=program_create.description,
            program_code=program_code,
            category=program_create.category,
            target_beneficiaries=program_create.target_beneficiaries,
            budget_amount=program_create.budget_amount,
            start_date=program_create.start_date,
            end_date=program_create.end_date,
            application_deadline=program_create.application_deadline,
            requirements=program_create.requirements or [],
            benefits=program_create.benefits or [],
            eligibility_criteria=program_create.eligibility_criteria or [],
            status="draft",
            is_active=True,
            is_featured=False,
            created_at=datetime.utcnow(),
            created_by=created_by
        )
        
        db.add(db_program)
        db.commit()
        db.refresh(db_program)
        
        # Log audit
        audit_service.log_action(
            db=db,
            user_id=created_by,
            action="PROGRAM_CREATED",
            resource_type="Program",
            resource_id=db_program.id,
            description=f"Program created: {db_program.name}"
        )
        
        return db_program
    
    def update_program(self, db: Session, program_id: int, program_update: ProgramUpdate, updated_by: int) -> Optional[Program]:
        """Update program information"""
        program = self.get_program(db, program_id)
        if not program:
            return None
        
        update_data = program_update.dict(exclude_unset=True)
        
        # Validate program title if being updated
        if "name" in update_data and not validate_program_title(update_data["name"]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid program title format"
            )
        
        # Validate budget amount if being updated
        if "budget_amount" in update_data and update_data["budget_amount"] and not validate_budget_amount(update_data["budget_amount"]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid budget amount"
            )
        
        # Check if program code is being changed and already exists
        if "program_code" in update_data and update_data["program_code"] != program.program_code:
            existing_program = self.get_program_by_code(db, update_data["program_code"])
            if existing_program:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Program code already exists"
                )
        
        # Update program
        for field, value in update_data.items():
            setattr(program, field, value)
        
        program.updated_at = datetime.utcnow()
        program.updated_by = updated_by
        
        db.commit()
        db.refresh(program)
        
        # Log audit
        audit_service.log_action(
            db=db,
            user_id=updated_by,
            action="PROGRAM_UPDATED",
            resource_type="Program",
            resource_id=program_id,
            description=f"Program updated: {program.name}"
        )
        
        return program
    
    def delete_program(self, db: Session, program_id: int, deleted_by: int) -> bool:
        """Soft delete program"""
        program = self.get_program(db, program_id)
        if not program:
            return False
        
        # Check if program has active applications
        active_applications = db.query(Application).filter(
            Application.program_id == program_id,
            Application.status.in_(["pending", "approved"])
        ).count()
        
        if active_applications > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete program with active applications"
            )
        
        # Check if program has active beneficiaries
        active_beneficiaries = db.query(Beneficiary).filter(
            Beneficiary.program_id == program_id,
            Beneficiary.is_active == True
        ).count()
        
        if active_beneficiaries > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete program with active beneficiaries"
            )
        
        # Soft delete
        program.is_active = False
        program.is_deleted = True
        program.deleted_at = datetime.utcnow()
        program.deleted_by = deleted_by
        
        db.commit()
        
        # Log audit
        audit_service.log_action(
            db=db,
            user_id=deleted_by,
            action="PROGRAM_DELETED",
            resource_type="Program",
            resource_id=program_id,
            description=f"Program deleted: {program.name}"
        )
        
        return True
    
    def activate_program(self, db: Session, program_id: int, activated_by: int) -> bool:
        """Activate program"""
        program = self.get_program(db, program_id)
        if not program:
            return False
        
        program.status = "active"
        program.is_active = True
        program.updated_at = datetime.utcnow()
        program.updated_by = activated_by
        
        db.commit()
        
        # Send notifications to interested users
        notification_service.send_program_activation_notice(program)
        
        # Log audit
        audit_service.log_action(
            db=db,
            user_id=activated_by,
            action="PROGRAM_ACTIVATED",
            resource_type="Program",
            resource_id=program_id,
            description=f"Program activated: {program.name}"
        )
        
        return True
    
    def deactivate_program(self, db: Session, program_id: int, deactivated_by: int) -> bool:
        """Deactivate program"""
        program = self.get_program(db, program_id)
        if not program:
            return False
        
        program.status = "inactive"
        program.is_active = False
        program.updated_at = datetime.utcnow()
        program.updated_by = deactivated_by
        
        db.commit()
        
        # Log audit
        audit_service.log_action(
            db=db,
            user_id=deactivated_by,
            action="PROGRAM_DEACTIVATED",
            resource_type="Program",
            resource_id=program_id,
            description=f"Program deactivated: {program.name}"
        )
        
        return True
    
    def feature_program(self, db: Session, program_id: int, featured_by: int) -> bool:
        """Feature program"""
        program = self.get_program(db, program_id)
        if not program:
            return False
        
        program.is_featured = True
        program.updated_at = datetime.utcnow()
        program.updated_by = featured_by
        
        db.commit()
        
        # Log audit
        audit_service.log_action(
            db=db,
            user_id=featured_by,
            action="PROGRAM_FEATURED",
            resource_type="Program",
            resource_id=program_id,
            description=f"Program featured: {program.name}"
        )
        
        return True
    
    def unfeature_program(self, db: Session, program_id: int, unfeatured_by: int) -> bool:
        """Unfeature program"""
        program = self.get_program(db, program_id)
        if not program:
            return False
        
        program.is_featured = False
        program.updated_at = datetime.utcnow()
        program.updated_by = unfeatured_by
        
        db.commit()
        
        # Log audit
        audit_service.log_action(
            db=db,
            user_id=unfeatured_by,
            action="PROGRAM_UNFEATURED",
            resource_type="Program",
            resource_id=program_id,
            description=f"Program unfeatured: {program.name}"
        )
        
        return True
    
    def get_featured_programs(self, db: Session, limit: int = 10) -> List[Program]:
        """Get featured programs"""
        return db.query(Program).filter(
            Program.is_featured == True,
            Program.is_active == True,
            Program.status == "active"
        ).order_by(Program.updated_at.desc()).limit(limit).all()
    
    def get_active_programs(self, db: Session, skip: int = 0, limit: int = 100) -> List[Program]:
        """Get active programs"""
        return db.query(Program).filter(
            Program.is_active == True,
            Program.status == "active"
        ).order_by(Program.created_at.desc()).offset(skip).limit(limit).all()
    
    def get_program_applications(self, db: Session, program_id: int, skip: int = 0, limit: int = 100) -> List[Application]:
        """Get applications for a program"""
        return db.query(Application).filter(
            Application.program_id == program_id
        ).order_by(Application.applied_at.desc()).offset(skip).limit(limit).all()
    
    def get_program_beneficiaries(self, db: Session, program_id: int, skip: int = 0, limit: int = 100) -> List[Beneficiary]:
        """Get beneficiaries for a program"""
        return db.query(Beneficiary).filter(
            Beneficiary.program_id == program_id,
            Beneficiary.is_active == True
        ).order_by(Beneficiary.created_at.desc()).offset(skip).limit(limit).all()
    
    def get_program_statistics(self, db: Session, program_id: int) -> Dict[str, Any]:
        """Get program statistics"""
        program = self.get_program(db, program_id)
        if not program:
            return {}
        
        # Application statistics
        total_applications = db.query(func.count(Application.id)).filter(
            Application.program_id == program_id
        ).scalar()
        
        pending_applications = db.query(func.count(Application.id)).filter(
            Application.program_id == program_id,
            Application.status == "pending"
        ).scalar()
        
        approved_applications = db.query(func.count(Application.id)).filter(
            Application.program_id == program_id,
            Application.status == "approved"
        ).scalar()
        
        rejected_applications = db.query(func.count(Application.id)).filter(
            Application.program_id == program_id,
            Application.status == "rejected"
        ).scalar()
        
        # Beneficiary statistics
        total_beneficiaries = db.query(func.count(Beneficiary.id)).filter(
            Beneficiary.program_id == program_id,
            Beneficiary.is_active == True
        ).scalar()
        
        # Budget utilization
        budget_utilized = db.query(func.sum(Beneficiary.amount_received)).filter(
            Beneficiary.program_id == program_id,
            Beneficiary.is_active == True
        ).scalar() or 0
        
        budget_utilization_percentage = 0
        if program.budget_amount and program.budget_amount > 0:
            budget_utilization_percentage = (budget_utilized / program.budget_amount) * 100
        
        return {
            "program_id": program_id,
            "program_name": program.name,
            "total_applications": total_applications,
            "pending_applications": pending_applications,
            "approved_applications": approved_applications,
            "rejected_applications": rejected_applications,
            "total_beneficiaries": total_beneficiaries,
            "budget_amount": program.budget_amount,
            "budget_utilized": budget_utilized,
            "budget_utilization_percentage": round(budget_utilization_percentage, 2),
            "remaining_budget": (program.budget_amount or 0) - budget_utilized
        }
    
    def get_all_programs_statistics(self, db: Session) -> Dict[str, Any]:
        """Get overall program statistics"""
        total_programs = db.query(func.count(Program.id)).scalar()
        active_programs = db.query(func.count(Program.id)).filter(Program.status == "active").scalar()
        featured_programs = db.query(func.count(Program.id)).filter(Program.is_featured == True).scalar()
        
        # Programs by category
        category_stats = db.query(
            Program.category,
            func.count(Program.id).label('count')
        ).group_by(Program.category).all()
        
        # Total budget
        total_budget = db.query(func.sum(Program.budget_amount)).filter(
            Program.is_active == True
        ).scalar() or 0
        
        return {
            "total_programs": total_programs,
            "active_programs": active_programs,
            "featured_programs": featured_programs,
            "category_distribution": {category: count for category, count in category_stats},
            "total_budget": total_budget
        }

# Create service instance
program_service = ProgramService()