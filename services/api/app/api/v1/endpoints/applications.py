from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, or_

from app.api import deps
from app.core.config import settings
from app.models.user import User
from app.models.application import Application
from app.models.program import Program
from app.schemas.application import ApplicationRead, ApplicationCreate, ApplicationUpdate
from app.schemas.common import PaginatedResponse, ResponseModel
from app.services.application_service import application_service
from app.services.audit_service import audit_service
from app.utils.validators import validate_application_notes
from app.utils.formatters import format_date

router = APIRouter()


@router.get("/", response_model=PaginatedResponse[ApplicationRead])
def get_applications(
    *,
    db: Session = Depends(deps.get_db),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=100, description="Number of records to return"),
    status: str = Query(None, description="Filter by application status"),
    program_id: int = Query(None, description="Filter by program ID"),
    current_user: User = Depends(deps.get_current_staff_user),
) -> Any:
    """
    Retrieve applications with pagination and filtering (Staff only).
    """
    query = db.query(Application)
    
    # Apply filters
    if status:
        query = query.filter(Application.status == status)
    if program_id:
        query = query.filter(Application.program_id == program_id)
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    applications = query.offset(skip).limit(limit).all()
    
    return PaginatedResponse(
        items=applications,
        total=total,
        skip=skip,
        limit=limit
    )


@router.post("/", response_model=ApplicationRead)
def create_application(
    *,
    db: Session = Depends(deps.get_db),
    application_in: ApplicationCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new application.
    """
    # Validate program exists and is active
    program = db.query(Program).filter(Program.id == application_in.program_id).first()
    if not program:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Program not found"
        )
    
    if not program.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Program is not active"
        )
    
    # Check if user already applied
    existing_application = db.query(Application).filter(
        Application.user_id == current_user.id,
        Application.program_id == application_in.program_id
    ).first()
    
    if existing_application:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already applied to this program"
        )
    
    try:
        # Validate notes if provided
        if application_in.notes:
            validate_application_notes(application_in.notes)
        
        # Create application using service
        application = application_service.create_application(
            db=db,
            application_create=application_in,
            user_id=current_user.id
        )
        
        # Log audit trail
        audit_service.log_action(
            db=db,
            user_id=current_user.id,
            action="APPLICATION_CREATED",
            details=f"Application created for program {program.name}"
        )
        
        return application
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create application"
        )


@router.get("/{application_id}", response_model=ApplicationRead)
def get_application(
    *,
    db: Session = Depends(deps.get_db),
    application_id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get application by ID.
    """
    application = application_service.get_application(db, application_id)
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    # Check if user owns the application or is staff/admin
    if (
        application.user_id != current_user.id and
        current_user.role not in ["admin", "staff"]
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return application


@router.put("/{application_id}", response_model=ApplicationRead)
def update_application(
    *,
    db: Session = Depends(deps.get_db),
    application_id: int,
    application_in: ApplicationUpdate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update application.
    """
    application = application_service.get_application(db, application_id)
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    # Check permissions
    if current_user.role in ["admin", "staff"]:
        # Staff/Admin can update any application
        pass
    elif application.user_id == current_user.id:
        # Users can only update their own applications if status is pending
        if application.status != "pending":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot update application that is not pending"
            )
        # Users cannot change status or reviewer
        if application_in.status is not None or application_in.reviewed_by is not None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to change status or reviewer"
            )
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    try:
        # Validate notes if provided
        if application_in.notes:
            validate_application_notes(application_in.notes)
        
        # Update application using service
        updated_application = application_service.update_application(
            db=db,
            application_id=application_id,
            application_update=application_in,
            updated_by=current_user.id
        )
        
        # Log audit trail
        audit_service.log_action(
            db=db,
            user_id=current_user.id,
            action="APPLICATION_UPDATED",
            details=f"Application {application_id} updated"
        )
        
        return updated_application
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update application"
        )


@router.delete("/{application_id}", response_model=ResponseModel)
def delete_application(
    *,
    db: Session = Depends(deps.get_db),
    application_id: int,
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Delete application (Admin only).
    """
    application = application_service.get_application(db, application_id)
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    try:
        # Delete application using service
        success = application_service.delete_application(
            db=db,
            application_id=application_id,
            deleted_by=current_user.id
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to delete application"
            )
        
        # Log audit trail
        audit_service.log_action(
            db=db,
            user_id=current_user.id,
            action="APPLICATION_DELETED",
            details=f"Application {application_id} deleted"
        )
        
        return ResponseModel(message="Application deleted successfully")
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete application"
        )


@router.post("/{application_id}/approve", response_model=ResponseModel)
def approve_application(
    *,
    db: Session = Depends(deps.get_db),
    application_id: int,
    current_user: User = Depends(deps.get_current_staff_user),
) -> Any:
    """
    Approve application (Staff only).
    """
    application = application_service.get_application(db, application_id)
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    if application.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only pending applications can be approved"
        )
    
    try:
        # Approve application
        updated_application = application_service.approve_application(
            db=db,
            application_id=application_id,
            approved_by=current_user.id
        )
        
        # Log audit trail
        audit_service.log_action(
            db=db,
            user_id=current_user.id,
            action="APPLICATION_APPROVED",
            details=f"Application {application_id} approved"
        )
        
        return ResponseModel(message="Application approved successfully")
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to approve application"
        )


@router.post("/{application_id}/reject", response_model=ResponseModel)
def reject_application(
    *,
    db: Session = Depends(deps.get_db),
    application_id: int,
    current_user: User = Depends(deps.get_current_staff_user),
) -> Any:
    """
    Reject application (Staff only).
    """
    application = application_service.get_application(db, application_id)
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    if application.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only pending applications can be rejected"
        )
    
    try:
        # Reject application
        updated_application = application_service.reject_application(
            db=db,
            application_id=application_id,
            rejected_by=current_user.id
        )
        
        # Log audit trail
        audit_service.log_action(
            db=db,
            user_id=current_user.id,
            action="APPLICATION_REJECTED",
            details=f"Application {application_id} rejected"
        )
        
        return ResponseModel(message="Application rejected successfully")
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to reject application"
        )


@router.get("/program/{program_id}", response_model=List[ApplicationRead])
def get_program_applications(
    *,
    db: Session = Depends(deps.get_db),
    program_id: int,
    current_user: User = Depends(deps.get_current_staff_user),
) -> Any:
    """
    Get all applications for a specific program (Staff only).
    """
    # Verify program exists
    program = db.query(Program).filter(Program.id == program_id).first()
    if not program:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Program not found"
        )
    
    applications = db.query(Application).filter(
        Application.program_id == program_id
    ).all()
    
    return applications


@router.get("/user/{user_id}", response_model=List[ApplicationRead])
def get_user_applications(
    *,
    db: Session = Depends(deps.get_db),
    user_id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get all applications for a specific user.
    """
    # Check permissions
    if current_user.id != user_id and current_user.role not in ["admin", "staff"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    applications = db.query(Application).filter(
        Application.user_id == user_id
    ).all()
    
    return applications


@router.get("/statistics", response_model=dict)
def get_application_statistics(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_staff_user),
) -> Any:
    """
    Get application statistics (Staff only).
    """
    total_applications = db.query(Application).count()
    pending_applications = db.query(Application).filter(
        Application.status == "pending"
    ).count()
    approved_applications = db.query(Application).filter(
        Application.status == "approved"
    ).count()
    rejected_applications = db.query(Application).filter(
        Application.status == "rejected"
    ).count()
    
    # Applications by program
    program_stats = db.query(
        Program.name,
        func.count(Application.id).label("count")
    ).join(
        Application, Program.id == Application.program_id
    ).group_by(Program.name).all()
    
    # Applications by status over time (last 30 days)
    from datetime import datetime, timedelta
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    
    recent_applications = db.query(
        func.date(Application.applied_at).label("date"),
        func.count(Application.id).label("count")
    ).filter(
        Application.applied_at >= thirty_days_ago
    ).group_by(
        func.date(Application.applied_at)
    ).all()
    
    return {
        "total_applications": total_applications,
        "pending_applications": pending_applications,
        "approved_applications": approved_applications,
        "rejected_applications": rejected_applications,
        "applications_by_program": {
            name: count for name, count in program_stats
        },
        "recent_applications": {
            str(date): count for date, count in recent_applications
        }
    }