from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, or_

from app.api import deps
from app.core.config import settings
from app.models.user import User
from app.models.beneficiary import Beneficiary
from app.models.program import Program
from app.models.application import Application
from app.schemas.beneficiary import Beneficiary as BeneficiaryRead, BeneficiaryCreate, BeneficiaryUpdate
from app.schemas.common import PaginatedResponse, ResponseModel
from app.services.audit_service import audit_service
from app.crud.beneficiary import beneficiary
from app.utils.validators import validate_phone
from app.utils.formatters import format_phone_number

router = APIRouter()


@router.get("/", response_model=List[BeneficiaryRead])
def get_beneficiaries(
    *,
    db: Session = Depends(deps.get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    program_id: int = Query(None),
    status: str = Query(None),
    current_user: User = Depends(deps.get_current_staff_user),
) -> Any:
    """
    Retrieve beneficiaries with pagination and filtering (Staff only).
    """
    if program_id:
        beneficiaries = beneficiary.get_by_program(db, program_id=program_id, skip=skip, limit=limit)
    elif status:
        beneficiaries = beneficiary.get_by_status(db, status=status, skip=skip, limit=limit)
    else:
        beneficiaries = beneficiary.get_multi(db, skip=skip, limit=limit)
    
    return beneficiaries


@router.post("/", response_model=BeneficiaryRead)
def create_beneficiary(
    *,
    db: Session = Depends(deps.get_db),
    beneficiary_in: BeneficiaryCreate,
    current_user: User = Depends(deps.get_current_staff_user),
) -> Any:
    """
    Create new beneficiary (Staff only).
    """
    # Validate program exists
    program = db.query(Program).filter(Program.id == beneficiary_in.program_id).first()
    if not program:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Program not found"
        )
    
    # Validate application exists and is approved
    application = db.query(Application).filter(
        Application.id == beneficiary_in.application_id,
        Application.status == "approved"
    ).first()
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Approved application not found"
        )
    
    # Check if beneficiary already exists for this application
    existing_beneficiary = db.query(Beneficiary).filter(
        Beneficiary.application_id == beneficiary_in.application_id
    ).first()
    if existing_beneficiary:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Beneficiary already exists for this application"
        )
    
    # Validate phone number if provided
    if beneficiary_in.emergency_contact_phone:
        if not validate_phone(beneficiary_in.emergency_contact_phone):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid emergency contact phone number"
            )
        beneficiary_in.emergency_contact_phone = format_phone_number(beneficiary_in.emergency_contact_phone)
    
    try:
        # Create beneficiary
        new_beneficiary = beneficiary.create(db=db, obj_in=beneficiary_in)
        
        # Log audit trail
        audit_service.log_action(
            db=db,
            user_id=current_user.id,
            action="BENEFICIARY_CREATED",
            details=f"Beneficiary created for application {beneficiary_in.application_id}"
        )
        
        return new_beneficiary
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create beneficiary"
        )


@router.get("/{beneficiary_id}", response_model=BeneficiaryRead)
def get_beneficiary(
    *,
    db: Session = Depends(deps.get_db),
    beneficiary_id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get beneficiary by ID.
    """
    beneficiary_obj = beneficiary.get(db=db, id=beneficiary_id)
    if not beneficiary_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Beneficiary not found"
        )
    
    # Check if user owns the beneficiary record or is staff/admin
    if (
        beneficiary_obj.user_id != current_user.id and
        current_user.role not in ["admin", "staff"]
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return beneficiary_obj


@router.put("/{beneficiary_id}", response_model=BeneficiaryRead)
def update_beneficiary(
    *,
    db: Session = Depends(deps.get_db),
    beneficiary_id: int,
    beneficiary_in: BeneficiaryUpdate,
    current_user: User = Depends(deps.get_current_staff_user),
) -> Any:
    """
    Update beneficiary (Staff only).
    """
    beneficiary_obj = beneficiary.get(db=db, id=beneficiary_id)
    if not beneficiary_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Beneficiary not found"
        )
    
    # Validate phone number if provided
    if beneficiary_in.emergency_contact_phone:
        if not validate_phone(beneficiary_in.emergency_contact_phone):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid emergency contact phone number"
            )
        beneficiary_in.emergency_contact_phone = format_phone_number(beneficiary_in.emergency_contact_phone)
    
    try:
        updated_beneficiary = beneficiary.update(db=db, db_obj=beneficiary_obj, obj_in=beneficiary_in)
        
        # Log audit trail
        audit_service.log_action(
            db=db,
            user_id=current_user.id,
            action="BENEFICIARY_UPDATED",
            details=f"Beneficiary {beneficiary_id} updated"
        )
        
        return updated_beneficiary
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update beneficiary"
        )


@router.delete("/{beneficiary_id}", response_model=ResponseModel)
def delete_beneficiary(
    *,
    db: Session = Depends(deps.get_db),
    beneficiary_id: int,
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Delete beneficiary (Admin only).
    """
    beneficiary_obj = beneficiary.get(db=db, id=beneficiary_id)
    if not beneficiary_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Beneficiary not found"
        )
    
    try:
        # Soft delete beneficiary
        beneficiary_obj.is_active = False
        db.commit()
        
        # Log audit trail
        audit_service.log_action(
            db=db,
            user_id=current_user.id,
            action="BENEFICIARY_DELETED",
            details=f"Beneficiary {beneficiary_id} deleted"
        )
        
        return ResponseModel(
            success=True,
            message="Beneficiary deleted successfully"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete beneficiary"
        )


@router.get("/program/{program_id}", response_model=List[BeneficiaryRead])
def get_program_beneficiaries(
    *,
    db: Session = Depends(deps.get_db),
    program_id: int,
    current_user: User = Depends(deps.get_current_staff_user),
) -> Any:
    """
    Get all beneficiaries for a specific program (Staff only).
    """
    # Verify program exists
    program = db.query(Program).filter(Program.id == program_id).first()
    if not program:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Program not found"
        )
    
    beneficiaries = beneficiary.get_by_program(db, program_id=program_id)
    
    return beneficiaries


@router.get("/user/{user_id}", response_model=List[BeneficiaryRead])
def get_user_beneficiaries(
    *,
    db: Session = Depends(deps.get_db),
    user_id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get all beneficiaries for a specific user.
    """
    # Check if user is accessing their own records or is staff/admin
    if (
        user_id != current_user.id and
        current_user.role not in ["admin", "staff"]
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Verify user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    beneficiaries = beneficiary.get_by_user(db, user_id=user_id)
    
    return beneficiaries


@router.patch("/{beneficiary_id}/complete", response_model=ResponseModel)
def complete_beneficiary(
    *,
    db: Session = Depends(deps.get_db),
    beneficiary_id: int,
    current_user: User = Depends(deps.get_current_staff_user),
) -> Any:
    """
    Mark beneficiary as completed (Staff only).
    """
    beneficiary_obj = beneficiary.get(db=db, id=beneficiary_id)
    if not beneficiary_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Beneficiary not found"
        )
    
    if beneficiary_obj.status == "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Beneficiary is already completed"
        )
    
    try:
        # Update beneficiary status
        beneficiary_obj.status = "completed"
        beneficiary_obj.completion_date = func.now()
        db.commit()
        
        # Log audit trail
        audit_service.log_action(
            db=db,
            user_id=current_user.id,
            action="BENEFICIARY_COMPLETED",
            details=f"Beneficiary {beneficiary_id} marked as completed"
        )
        
        return ResponseModel(
            success=True,
            message="Beneficiary marked as completed successfully"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to complete beneficiary"
        )


@router.patch("/{beneficiary_id}/suspend", response_model=ResponseModel)
def suspend_beneficiary(
    *,
    db: Session = Depends(deps.get_db),
    beneficiary_id: int,
    current_user: User = Depends(deps.get_current_staff_user),
) -> Any:
    """
    Suspend beneficiary (Staff only).
    """
    beneficiary_obj = beneficiary.get(db=db, id=beneficiary_id)
    if not beneficiary_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Beneficiary not found"
        )
    
    if beneficiary_obj.status == "suspended":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Beneficiary is already suspended"
        )
    
    try:
        # Update beneficiary status
        beneficiary_obj.status = "suspended"
        db.commit()
        
        # Log audit trail
        audit_service.log_action(
            db=db,
            user_id=current_user.id,
            action="BENEFICIARY_SUSPENDED",
            details=f"Beneficiary {beneficiary_id} suspended"
        )
        
        return ResponseModel(
            success=True,
            message="Beneficiary suspended successfully"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to suspend beneficiary"
        )


@router.patch("/{beneficiary_id}/reactivate", response_model=ResponseModel)
def reactivate_beneficiary(
    *,
    db: Session = Depends(deps.get_db),
    beneficiary_id: int,
    current_user: User = Depends(deps.get_current_staff_user),
) -> Any:
    """
    Reactivate suspended beneficiary (Staff only).
    """
    beneficiary_obj = beneficiary.get(db=db, id=beneficiary_id)
    if not beneficiary_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Beneficiary not found"
        )
    
    if beneficiary_obj.status != "suspended":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only suspended beneficiaries can be reactivated"
        )
    
    try:
        # Update beneficiary status
        beneficiary_obj.status = "active"
        db.commit()
        
        # Log audit trail
        audit_service.log_action(
            db=db,
            user_id=current_user.id,
            action="BENEFICIARY_REACTIVATED",
            details=f"Beneficiary {beneficiary_id} reactivated"
        )
        
        return ResponseModel(
            success=True,
            message="Beneficiary reactivated successfully"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to reactivate beneficiary"
        )


@router.get("/statistics", response_model=dict)
def get_beneficiary_statistics(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_staff_user),
) -> Any:
    """
    Get beneficiary statistics (Staff only).
    """
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
    
    return {
        "total": total_beneficiaries,
        "active": active_beneficiaries,
        "completed": completed_beneficiaries,
        "suspended": suspended_beneficiaries,
        "dropped": dropped_beneficiaries,
        "by_program": [
            {
                "program_name": name,
                "count": count
            }
            for name, count in beneficiaries_by_program
        ]
    }