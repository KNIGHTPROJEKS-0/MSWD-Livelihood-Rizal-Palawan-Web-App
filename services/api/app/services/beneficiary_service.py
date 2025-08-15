"""Beneficiary Management Service - Complete Implementation"""
from typing import List, Optional, Dict, Any
from datetime import datetime, date
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.beneficiary import Beneficiary
from app.models.program import Program
from app.models.application import Application
from app.models.user import User
from app.schemas.beneficiary import BeneficiaryCreate, BeneficiaryUpdate
from app.services.audit_service import audit_service
from app.services.notification_service import notification_service
from app.utils.validators import validate_phone
from app.utils.formatters import format_phone_number


class BeneficiaryService:
    """Complete beneficiary management service"""
    
    def create_beneficiary(
        self, 
        db: Session, 
        beneficiary_create: BeneficiaryCreate, 
        created_by: int
    ) -> Beneficiary:
        """Create new beneficiary with all validations"""
        # Validate program exists and is active
        program = db.query(Program).filter(
            Program.id == beneficiary_create.program_id,
            Program.is_active == True
        ).first()
        if not program:
            raise ValueError("Program not found or inactive")
        
        # Validate application exists and is approved
        application = db.query(Application).filter(
            Application.id == beneficiary_create.application_id,
            Application.status == "approved"
        ).first()
        if not application:
            raise ValueError("Approved application not found")
        
        # Check if beneficiary already exists for this application
        existing_beneficiary = db.query(Beneficiary).filter(
            Beneficiary.application_id == beneficiary_create.application_id,
            Beneficiary.is_active == True
        ).first()
        if existing_beneficiary:
            raise ValueError("Beneficiary already exists for this application")
        
        # Validate and format phone number if provided
        if beneficiary_create.emergency_contact_phone:
            if not validate_phone(beneficiary_create.emergency_contact_phone):
                raise ValueError("Invalid emergency contact phone number")
            beneficiary_create.emergency_contact_phone = format_phone_number(
                beneficiary_create.emergency_contact_phone
            )
        
        # Create beneficiary
        db_beneficiary = Beneficiary(
            user_id=application.user_id,
            program_id=beneficiary_create.program_id,
            application_id=beneficiary_create.application_id,
            enrollment_date=beneficiary_create.enrollment_date or date.today(),
            status="active",
            emergency_contact_name=beneficiary_create.emergency_contact_name,
            emergency_contact_phone=beneficiary_create.emergency_contact_phone,
            household_size=beneficiary_create.household_size,
            monthly_income=beneficiary_create.monthly_income,
            progress_notes=beneficiary_create.progress_notes,
            is_active=True,
            created_at=datetime.utcnow()
        )
        
        db.add(db_beneficiary)
        db.commit()
        db.refresh(db_beneficiary)
        
        # Send enrollment notification
        user = db.query(User).filter(User.id == application.user_id).first()
        if user:
            notification_service.send_enrollment_confirmation(
                user.email, 
                user.first_name, 
                program.name
            )
        
        # Log audit
        audit_service.log_action(
            db=db,
            user_id=created_by,
            action="BENEFICIARY_CREATED",
            details=f"Beneficiary created for application {beneficiary_create.application_id} in program {program.name}"
        )
        
        return db_beneficiary
    
    def get_beneficiary(self, db: Session, beneficiary_id: int) -> Optional[Beneficiary]:
        """Get beneficiary by ID"""
        return db.query(Beneficiary).filter(
            Beneficiary.id == beneficiary_id,
            Beneficiary.is_active == True
        ).first()
    
    def get_beneficiaries(
        self, 
        db: Session, 
        skip: int = 0, 
        limit: int = 100,
        program_id: Optional[int] = None,
        status: Optional[str] = None,
        user_id: Optional[int] = None
    ) -> List[Beneficiary]:
        """Get list of beneficiaries with filtering"""
        query = db.query(Beneficiary).filter(Beneficiary.is_active == True)
        
        if program_id:
            query = query.filter(Beneficiary.program_id == program_id)
        
        if status:
            query = query.filter(Beneficiary.status == status)
        
        if user_id:
            query = query.filter(Beneficiary.user_id == user_id)
        
        return query.offset(skip).limit(limit).all()
    
    def get_beneficiaries_by_program(
        self, 
        db: Session, 
        program_id: int
    ) -> List[Beneficiary]:
        """Get all beneficiaries for a specific program"""
        return db.query(Beneficiary).filter(
            Beneficiary.program_id == program_id,
            Beneficiary.is_active == True
        ).all()
    
    def get_beneficiaries_by_user(
        self, 
        db: Session, 
        user_id: int
    ) -> List[Beneficiary]:
        """Get all beneficiaries for a specific user"""
        return db.query(Beneficiary).filter(
            Beneficiary.user_id == user_id,
            Beneficiary.is_active == True
        ).all()
    
    def update_beneficiary(
        self, 
        db: Session, 
        beneficiary_id: int, 
        beneficiary_update: BeneficiaryUpdate, 
        updated_by: int
    ) -> Optional[Beneficiary]:
        """Update beneficiary information"""
        beneficiary = self.get_beneficiary(db, beneficiary_id)
        if not beneficiary:
            return None
        
        # Validate and format phone number if provided
        if beneficiary_update.emergency_contact_phone:
            if not validate_phone(beneficiary_update.emergency_contact_phone):
                raise ValueError("Invalid emergency contact phone number")
            beneficiary_update.emergency_contact_phone = format_phone_number(
                beneficiary_update.emergency_contact_phone
            )
        
        update_data = beneficiary_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(beneficiary, field, value)
        
        beneficiary.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(beneficiary)
        
        # Log audit
        audit_service.log_action(
            db=db,
            user_id=updated_by,
            action="BENEFICIARY_UPDATED",
            details=f"Beneficiary {beneficiary_id} updated"
        )
        
        return beneficiary
    
    def delete_beneficiary(
        self, 
        db: Session, 
        beneficiary_id: int, 
        deleted_by: int
    ) -> bool:
        """Soft delete beneficiary"""
        beneficiary = self.get_beneficiary(db, beneficiary_id)
        if not beneficiary:
            return False
        
        beneficiary.is_active = False
        beneficiary.updated_at = datetime.utcnow()
        
        db.commit()
        
        # Log audit
        audit_service.log_action(
            db=db,
            user_id=deleted_by,
            action="BENEFICIARY_DELETED",
            details=f"Beneficiary {beneficiary_id} deleted"
        )
        
        return True
    
    def complete_beneficiary(
        self, 
        db: Session, 
        beneficiary_id: int, 
        completed_by: int,
        completion_notes: Optional[str] = None
    ) -> Optional[Beneficiary]:
        """Mark beneficiary as completed"""
        beneficiary = self.get_beneficiary(db, beneficiary_id)
        if not beneficiary:
            return None
        
        if beneficiary.status == "completed":
            raise ValueError("Beneficiary is already completed")
        
        beneficiary.status = "completed"
        beneficiary.completion_date = date.today()
        beneficiary.updated_at = datetime.utcnow()
        
        if completion_notes:
            current_notes = beneficiary.progress_notes or ""
            beneficiary.progress_notes = f"{current_notes}\n\nCompletion Notes ({date.today()}): {completion_notes}"
        
        db.commit()
        db.refresh(beneficiary)
        
        # Send completion notification
        user = db.query(User).filter(User.id == beneficiary.user_id).first()
        program = db.query(Program).filter(Program.id == beneficiary.program_id).first()
        if user and program:
            notification_service.send_program_completion(
                user.email,
                user.first_name,
                program.name
            )
        
        # Log audit
        audit_service.log_action(
            db=db,
            user_id=completed_by,
            action="BENEFICIARY_COMPLETED",
            details=f"Beneficiary {beneficiary_id} marked as completed"
        )
        
        return beneficiary
    
    def suspend_beneficiary(
        self, 
        db: Session, 
        beneficiary_id: int, 
        suspended_by: int,
        suspension_reason: Optional[str] = None
    ) -> Optional[Beneficiary]:
        """Suspend beneficiary"""
        beneficiary = self.get_beneficiary(db, beneficiary_id)
        if not beneficiary:
            return None
        
        if beneficiary.status == "suspended":
            raise ValueError("Beneficiary is already suspended")
        
        beneficiary.status = "suspended"
        beneficiary.updated_at = datetime.utcnow()
        
        if suspension_reason:
            current_notes = beneficiary.progress_notes or ""
            beneficiary.progress_notes = f"{current_notes}\n\nSuspension ({date.today()}): {suspension_reason}"
        
        db.commit()
        db.refresh(beneficiary)
        
        # Log audit
        audit_service.log_action(
            db=db,
            user_id=suspended_by,
            action="BENEFICIARY_SUSPENDED",
            details=f"Beneficiary {beneficiary_id} suspended. Reason: {suspension_reason or 'Not specified'}"
        )
        
        return beneficiary
    
    def reactivate_beneficiary(
        self, 
        db: Session, 
        beneficiary_id: int, 
        reactivated_by: int,
        reactivation_notes: Optional[str] = None
    ) -> Optional[Beneficiary]:
        """Reactivate suspended beneficiary"""
        beneficiary = self.get_beneficiary(db, beneficiary_id)
        if not beneficiary:
            return None
        
        if beneficiary.status != "suspended":
            raise ValueError("Only suspended beneficiaries can be reactivated")
        
        beneficiary.status = "active"
        beneficiary.updated_at = datetime.utcnow()
        
        if reactivation_notes:
            current_notes = beneficiary.progress_notes or ""
            beneficiary.progress_notes = f"{current_notes}\n\nReactivation ({date.today()}): {reactivation_notes}"
        
        db.commit()
        db.refresh(beneficiary)
        
        # Log audit
        audit_service.log_action(
            db=db,
            user_id=reactivated_by,
            action="BENEFICIARY_REACTIVATED",
            details=f"Beneficiary {beneficiary_id} reactivated"
        )
        
        return beneficiary
    
    def get_beneficiary_statistics(self, db: Session) -> Dict[str, Any]:
        """Get comprehensive beneficiary statistics"""
        # Total beneficiaries
        total_beneficiaries = db.query(Beneficiary).filter(
            Beneficiary.is_active == True
        ).count()
        
        # Active beneficiaries
        active_beneficiaries = db.query(Beneficiary).filter(
            Beneficiary.status == "active",
            Beneficiary.is_active == True
        ).count()
        
        # Completed beneficiaries
        completed_beneficiaries = db.query(Beneficiary).filter(
            Beneficiary.status == "completed",
            Beneficiary.is_active == True
        ).count()
        
        # Suspended beneficiaries
        suspended_beneficiaries = db.query(Beneficiary).filter(
            Beneficiary.status == "suspended",
            Beneficiary.is_active == True
        ).count()
        
        # Dropped beneficiaries
        dropped_beneficiaries = db.query(Beneficiary).filter(
            Beneficiary.status == "dropped",
            Beneficiary.is_active == True
        ).count()
        
        # Beneficiaries by program
        beneficiaries_by_program = db.query(
            Program.name,
            func.count(Beneficiary.id).label("count")
        ).join(
            Beneficiary, Program.id == Beneficiary.program_id
        ).filter(
            Beneficiary.is_active == True
        ).group_by(
            Program.name
        ).all()
        
        # Recent enrollments (last 30 days)
        recent_enrollments = db.query(Beneficiary).filter(
            Beneficiary.enrollment_date >= date.today().replace(day=1),
            Beneficiary.is_active == True
        ).count()
        
        # Recent completions (last 30 days)
        recent_completions = db.query(Beneficiary).filter(
            Beneficiary.completion_date >= date.today().replace(day=1),
            Beneficiary.status == "completed",
            Beneficiary.is_active == True
        ).count()
        
        return {
            "total": total_beneficiaries,
            "active": active_beneficiaries,
            "completed": completed_beneficiaries,
            "suspended": suspended_beneficiaries,
            "dropped": dropped_beneficiaries,
            "recent_enrollments": recent_enrollments,
            "recent_completions": recent_completions,
            "by_program": [
                {
                    "program_name": name,
                    "count": count
                }
                for name, count in beneficiaries_by_program
            ]
        }
    
    def add_progress_note(
        self, 
        db: Session, 
        beneficiary_id: int, 
        note: str, 
        added_by: int
    ) -> Optional[Beneficiary]:
        """Add progress note to beneficiary"""
        beneficiary = self.get_beneficiary(db, beneficiary_id)
        if not beneficiary:
            return None
        
        current_notes = beneficiary.progress_notes or ""
        new_note = f"\n\nProgress Note ({date.today()}): {note}"
        beneficiary.progress_notes = current_notes + new_note
        beneficiary.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(beneficiary)
        
        # Log audit
        audit_service.log_action(
            db=db,
            user_id=added_by,
            action="BENEFICIARY_NOTE_ADDED",
            details=f"Progress note added to beneficiary {beneficiary_id}"
        )
        
        return beneficiary


beneficiary_service = BeneficiaryService()