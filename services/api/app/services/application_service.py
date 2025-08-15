from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.application import Application
from app.models.program import Program
from app.models.user import User
from app.schemas.application import ApplicationCreate, ApplicationUpdate
from app.services.audit_service import audit_service
from app.services.notification_service import notification_service

class ApplicationService:
    """Complete application management service"""
    
    def create_application(self, db: Session, application_create: ApplicationCreate, user_id: int) -> Application:
        """Create new program application"""
        # Check if user already applied to this program
        existing_application = db.query(Application).filter(
            Application.user_id == user_id,
            Application.program_id == application_create.program_id,
            Application.is_active == True
        ).first()
        
        if existing_application:
            raise ValueError("User has already applied to this program")
        
        # Check if program exists and is accepting applications
        program = db.query(Program).filter(Program.id == application_create.program_id).first()
        if not program:
            raise ValueError("Program not found")
        
        if program.status != "active":
            raise ValueError("Program is not accepting applications")
        
        # Create application
        db_application = Application(
            user_id=user_id,
            program_id=application_create.program_id,
            notes=application_create.notes,
            status="pending",
            applied_at=datetime.utcnow(),
            is_active=True
        )
        
        db.add(db_application)
        db.commit()
        db.refresh(db_application)
        
        # Send notification
        user = db.query(User).filter(User.id == user_id).first()
        notification_service.send_application_confirmation(
            user.email, user.name, program.title
        )
        
        # Log audit
        audit_service.log_action(
            db=db,
            user_id=user_id,
            action="APPLICATION_CREATED",
            resource_type="Application",
            resource_id=db_application.id,
            description=f"Applied to program {program.title}"
        )
        
        return db_application
    
    def get_application(self, db: Session, application_id: int) -> Optional[Application]:
        """Get application by ID"""
        return db.query(Application).filter(Application.id == application_id).first()
    
    def get_user_applications(self, db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[Application]:
        """Get user's applications"""
        return db.query(Application).filter(
            Application.user_id == user_id,
            Application.is_active == True
        ).offset(skip).limit(limit).all()
    
    def get_program_applications(self, db: Session, program_id: int, skip: int = 0, limit: int = 100) -> List[Application]:
        """Get program applications"""
        return db.query(Application).filter(
            Application.program_id == program_id,
            Application.is_active == True
        ).offset(skip).limit(limit).all()
    
    def update_application_status(self, db: Session, application_id: int, status: str, reviewed_by: int, notes: Optional[str] = None) -> Optional[Application]:
        """Update application status (approve/reject)"""
        application = self.get_application(db, application_id)
        if not application:
            return None
        
        old_status = application.status
        application.status = status
        application.reviewed_by = reviewed_by
        application.reviewed_at = datetime.utcnow()
        
        if notes:
            application.notes = notes
        
        db.commit()
        db.refresh(application)
        
        # Send notification
        user = db.query(User).filter(User.id == application.user_id).first()
        program = db.query(Program).filter(Program.id == application.program_id).first()
        
        if status == "approved":
            notification_service.send_application_approved(
                user.email, user.name, program.title
            )
        elif status == "rejected":
            notification_service.send_application_rejected(
                user.email, user.name, program.title, notes
            )
        
        # Log audit
        audit_service.log_action(
            db=db,
            user_id=reviewed_by,
            action="APPLICATION_STATUS_UPDATED",
            resource_type="Application",
            resource_id=application_id,
            old_values={"status": old_status},
            new_values={"status": status},
            description=f"Application status changed from {old_status} to {status}"
        )
        
        return application
    
    def withdraw_application(self, db: Session, application_id: int, user_id: int) -> bool:
        """Withdraw application"""
        application = db.query(Application).filter(
            Application.id == application_id,
            Application.user_id == user_id
        ).first()
        
        if not application:
            return False
        
        if application.status in ["approved", "rejected"]:
            raise ValueError("Cannot withdraw processed application")
        
        application.status = "withdrawn"
        application.is_active = False
        
        db.commit()
        
        # Log audit
        audit_service.log_action(
            db=db,
            user_id=user_id,
            action="APPLICATION_WITHDRAWN",
            resource_type="Application",
            resource_id=application_id,
            description="Application withdrawn by user"
        )
        
        return True
    
    def update_application(self, db: Session, application_id: int, application_update: ApplicationUpdate, updated_by: int) -> Optional[Application]:
        """Update application information"""
        application = self.get_application(db, application_id)
        if not application:
            return None
        
        # Only allow updates to pending applications
        if application.status != "pending":
            raise ValueError("Can only update pending applications")
        
        update_data = application_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            if field not in ["status", "reviewed_by", "reviewed_at"]:  # Prevent status changes
                setattr(application, field, value)
        
        application.updated_at = datetime.utcnow()
        application.updated_by = updated_by
        
        db.commit()
        db.refresh(application)
        
        # Log audit
        audit_service.log_action(
            db=db,
            user_id=updated_by,
            action="APPLICATION_UPDATED",
            resource_type="Application",
            resource_id=application_id,
            description="Application updated"
        )
        
        return application
    
    def delete_application(self, db: Session, application_id: int, deleted_by: int) -> bool:
        """Soft delete application"""
        application = self.get_application(db, application_id)
        if not application:
            return False
        
        application.is_active = False
        application.deleted_at = datetime.utcnow()
        application.deleted_by = deleted_by
        
        db.commit()
        
        # Log audit
        audit_service.log_action(
            db=db,
            user_id=deleted_by,
            action="APPLICATION_DELETED",
            resource_type="Application",
            resource_id=application_id,
            description="Application deleted"
        )
        
        return True

application_service = ApplicationService()