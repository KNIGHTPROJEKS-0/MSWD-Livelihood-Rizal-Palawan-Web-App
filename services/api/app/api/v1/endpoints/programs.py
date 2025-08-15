from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, or_

from app.api import deps
from app.core.config import settings
from app.models.user import User
from app.models.program import Program
from app.schemas.program import ProgramRead, ProgramCreate, ProgramUpdate
from app.schemas.common import PaginatedResponse, ResponseModel
from app.services.program_service import program_service
from app.services.audit_service import audit_service
from app.utils.validators import validate_program_title, validate_budget_amount
from app.utils.formatters import format_currency, format_program_code

router = APIRouter()

@router.get("/", response_model=PaginatedResponse[ProgramRead])
def read_programs(
    db: Session = Depends(deps.get_db),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=100, description="Number of records to return"),
    active_only: bool = Query(True, description="Filter active programs only"),
    category: str = Query(None, description="Filter by program category"),
    current_user: User = Depends(deps.get_optional_current_user),
) -> Any:
    """
    Retrieve programs with pagination and filtering.
    """
    if category:
        programs = program_service.get_programs_by_category(db, category)
        total = len(programs)
        # Apply pagination manually for category filter
        programs = programs[skip:skip + limit]
    else:
        programs = program_service.get_programs(db, skip=skip, limit=limit, active_only=active_only)
        query = db.query(Program)
        if active_only:
            query = query.filter(Program.is_active == True)
        total = query.count()
    
    return PaginatedResponse(
        items=programs,
        total=total,
        page=skip // limit + 1,
        size=limit,
        pages=(total + limit - 1) // limit
    )

@router.post("/", response_model=ProgramRead, status_code=status.HTTP_201_CREATED)
def create_program(
    *,
    db: Session = Depends(deps.get_db),
    program_in: ProgramCreate,
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Create new program (Admin only).
    """
    # Validate program title
    if not validate_program_title(program_in.name):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid program title format"
        )
    
    # Validate budget amount
    if program_in.budget_amount and not validate_budget_amount(program_in.budget_amount):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid budget amount"
        )
    
    # Generate program code if not provided
    if not program_in.program_code:
        program_in.program_code = format_program_code(program_in.name, program_in.category)
    
    # Check if program code already exists
    existing_program = db.query(Program).filter(
        Program.program_code == program_in.program_code
    ).first()
    if existing_program:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Program code already exists"
        )
    
    try:
        program = program_service.create_program(db, program_in, current_user.id)
        return program
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create program"
        )

@router.put("/{program_id}", response_model=ProgramRead)
def update_program(
    *,
    db: Session = Depends(deps.get_db),
    program_id: int,
    program_in: ProgramUpdate,
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Update program (Admin only).
    """
    program = program_service.get_program(db, program_id)
    if not program:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Program not found"
        )
    
    # Validate program title if provided
    if program_in.name and not validate_program_title(program_in.name):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid program title format"
        )
    
    # Validate budget amount if provided
    if program_in.budget_amount and not validate_budget_amount(program_in.budget_amount):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid budget amount"
        )
    
    # Check if program code is being changed and already exists
    if program_in.program_code and program_in.program_code != program.program_code:
        existing_program = db.query(Program).filter(
            Program.program_code == program_in.program_code,
            Program.id != program_id
        ).first()
        if existing_program:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Program code already exists"
            )
    
    updated_program = program_service.update_program(db, program_id, program_in, current_user.id)
    if not updated_program:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update program"
        )
    
    return updated_program

@router.get("/{program_id}", response_model=ProgramRead)
def read_program(
    *,
    db: Session = Depends(deps.get_db),
    program_id: int,
    current_user: User = Depends(deps.get_optional_current_user),
) -> Any:
    """
    Get program by ID.
    """
    program = program_service.get_program(db, program_id)
    if not program:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Program not found"
        )
    
    # Only show active programs to non-admin users
    if not program.is_active and (not current_user or current_user.role not in ["admin", "super_admin", "staff"]):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Program not found"
        )
    
    return program

@router.delete("/{program_id}", response_model=ResponseModel)
def delete_program(
    *,
    db: Session = Depends(deps.get_db),
    program_id: int,
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Delete program (Admin only).
    """
    program = program_service.get_program(db, program_id)
    if not program:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Program not found"
        )
    
    # Check if program has active applications
    from app.models.application import Application
    active_applications = db.query(Application).filter(
        Application.program_id == program_id,
        Application.status.in_(["pending", "approved"])
    ).count()
    
    if active_applications > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete program with active applications"
        )
    
    success = program_service.delete_program(db, program_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete program"
        )
    
    return ResponseModel(
        success=True,
        message="Program deleted successfully"
    )

@router.post("/{program_id}/apply", response_model=ResponseModel)
def apply_to_program(
    *,
    db: Session = Depends(deps.get_db),
    program_id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Apply to a program.
    """
    program = program_service.get_program(db, program_id)
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
    from app.models.application import Application
    existing_application = db.query(Application).filter(
        Application.user_id == current_user.id,
        Application.program_id == program_id
    ).first()
    
    if existing_application:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already applied to this program"
        )
    
    # Create application
    application_data = {
        "user_id": current_user.id,
        "program_id": program_id,
        "status": "pending"
    }
    
    application = Application(**application_data)
    db.add(application)
    db.commit()
    db.refresh(application)
    
    # Log audit trail
    audit_service.log_action(
        db=db,
        user_id=current_user.id,
        action="apply_to_program",
        resource_type="application",
        resource_id=application.id,
        details={"program_id": program_id}
    )
    
    return ResponseModel(
        success=True,
        message="Application submitted successfully",
        data={"application_id": application.id}
    )

@router.get("/my/applications")
def get_my_applications(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get current user's program applications.
    """
    from app.models.application import Application
    applications = db.query(Application).filter(
        Application.user_id == current_user.id
    ).all()
    
    return applications


@router.get("/categories", response_model=List[str])
def get_program_categories(
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Get all program categories.
    """
    categories = db.query(Program.category).distinct().filter(
        Program.is_active == True
    ).all()
    return [category[0] for category in categories if category[0]]


@router.get("/featured", response_model=List[ProgramRead])
def get_featured_programs(
    db: Session = Depends(deps.get_db),
    limit: int = Query(default=6, le=20),
) -> Any:
    """
    Get featured programs.
    """
    programs = db.query(Program).filter(
        Program.is_active == True,
        Program.is_featured == True
    ).limit(limit).all()
    return programs


@router.get("/search/{query}", response_model=List[ProgramRead])
def search_programs(
    *,
    db: Session = Depends(deps.get_db),
    query: str,
    limit: int = Query(default=20, le=100),
) -> Any:
    """
    Search programs by name or description.
    """
    programs = db.query(Program).filter(
        Program.is_active == True,
        or_(
            Program.name.ilike(f"%{query}%"),
            Program.description.ilike(f"%{query}%")
        )
    ).limit(limit).all()
    return programs


@router.patch("/{program_id}/activate", response_model=ResponseModel)
def activate_program(
    *,
    db: Session = Depends(deps.get_db),
    program_id: int,
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Activate program (Admin only).
    """
    program = program_service.get_program(db, program_id)
    if not program:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Program not found"
        )
    
    program.is_active = True
    db.commit()
    
    # Log audit trail
    audit_service.log_action(
        db=db,
        user_id=current_user.id,
        action="activate_program",
        resource_type="program",
        resource_id=program_id,
        details={"program_name": program.name}
    )
    
    return ResponseModel(
        success=True,
        message="Program activated successfully"
    )


@router.patch("/{program_id}/deactivate", response_model=ResponseModel)
def deactivate_program(
    *,
    db: Session = Depends(deps.get_db),
    program_id: int,
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Deactivate program (Admin only).
    """
    program = program_service.get_program(db, program_id)
    if not program:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Program not found"
        )
    
    program.is_active = False
    db.commit()
    
    # Log audit trail
    audit_service.log_action(
        db=db,
        user_id=current_user.id,
        action="deactivate_program",
        resource_type="program",
        resource_id=program_id,
        details={"program_name": program.name}
    )
    
    return ResponseModel(
        success=True,
        message="Program deactivated successfully"
    )


@router.patch("/{program_id}/feature", response_model=ResponseModel)
def feature_program(
    *,
    db: Session = Depends(deps.get_db),
    program_id: int,
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Feature program (Admin only).
    """
    program = program_service.get_program(db, program_id)
    if not program:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Program not found"
        )
    
    program.is_featured = True
    db.commit()
    
    # Log audit trail
    audit_service.log_action(
        db=db,
        user_id=current_user.id,
        action="feature_program",
        resource_type="program",
        resource_id=program_id,
        details={"program_name": program.name}
    )
    
    return ResponseModel(
        success=True,
        message="Program featured successfully"
    )


@router.patch("/{program_id}/unfeature", response_model=ResponseModel)
def unfeature_program(
    *,
    db: Session = Depends(deps.get_db),
    program_id: int,
    current_user: User = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Unfeature program (Admin only).
    """
    program = program_service.get_program(db, program_id)
    if not program:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Program not found"
        )
    
    program.is_featured = False
    db.commit()
    
    # Log audit trail
    audit_service.log_action(
        db=db,
        user_id=current_user.id,
        action="unfeature_program",
        resource_type="program",
        resource_id=program_id,
        details={"program_name": program.name}
    )
    
    return ResponseModel(
        success=True,
        message="Program unfeatured successfully"
    )


@router.get("/statistics", response_model=dict)
def get_program_statistics(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_staff_user),
) -> Any:
    """
    Get program statistics (Staff only).
    """
    from app.models.application import Application
    
    total_programs = db.query(Program).count()
    active_programs = db.query(Program).filter(Program.is_active == True).count()
    featured_programs = db.query(Program).filter(
        Program.is_active == True,
        Program.is_featured == True
    ).count()
    
    total_applications = db.query(Application).count()
    pending_applications = db.query(Application).filter(
        Application.status == "pending"
    ).count()
    approved_applications = db.query(Application).filter(
        Application.status == "approved"
    ).count()
    
    # Programs by category
    category_stats = db.query(
        Program.category,
        func.count(Program.id).label("count")
    ).filter(
        Program.is_active == True
    ).group_by(Program.category).all()
    
    return {
        "total_programs": total_programs,
        "active_programs": active_programs,
        "featured_programs": featured_programs,
        "total_applications": total_applications,
        "pending_applications": pending_applications,
        "approved_applications": approved_applications,
        "programs_by_category": {
            category: count for category, count in category_stats
        }
    }