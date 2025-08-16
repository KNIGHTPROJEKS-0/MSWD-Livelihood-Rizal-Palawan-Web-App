"""OAuth Authentication Endpoints"""
from typing import Any, Dict
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.api import deps
from app.core.config import settings
from app.services.gitlab_oauth_service import gitlab_oauth_service
from app.services.auth_service import auth_service
from app.services.user_service import user_service
from app.schemas.auth import Token
from app.schemas.user import UserCreate
from app.models.user import User

router = APIRouter()

@router.get("/gitlab/authorize")
def gitlab_authorize(state: str = Query(None)) -> Dict[str, str]:
    """Get GitLab OAuth authorization URL"""
    auth_url = gitlab_oauth_service.get_authorization_url(state=state)
    return {"authorization_url": auth_url}

@router.post("/gitlab/callback", response_model=Token)
async def gitlab_callback(
    code: str,
    state: str = None,
    db: Session = Depends(deps.get_db)
) -> Any:
    """Handle GitLab OAuth callback"""
    try:
        # Exchange code for token
        token_data = await gitlab_oauth_service.exchange_code_for_token(code)
        access_token = token_data.get("access_token")
        
        if not access_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No access token received"
            )
        
        # Get user info from GitLab
        gitlab_user = await gitlab_oauth_service.get_user_info(access_token)
        
        # Check if user exists in our database
        existing_user = user_service.get_by_email(db, email=gitlab_user["email"])
        
        if existing_user:
            # Update GitLab info for existing user
            existing_user.gitlab_id = str(gitlab_user["id"])
            existing_user.gitlab_username = gitlab_user["username"]
            db.commit()
            user_obj = existing_user
        else:
            # Create new user from GitLab data
            user_create = UserCreate(
                email=gitlab_user["email"],
                first_name=gitlab_user.get("name", "").split()[0] if gitlab_user.get("name") else gitlab_user["username"],
                last_name=" ".join(gitlab_user.get("name", "").split()[1:]) if gitlab_user.get("name") else "",
                gitlab_id=str(gitlab_user["id"]),
                gitlab_username=gitlab_user["username"],
                is_active=True,
                role="beneficiary"  # Default role
            )
            user_obj = user_service.create_user(db, user_create=user_create)
        
        # Create JWT token for our application
        app_token = auth_service.create_access_token(
            data={"sub": str(user_obj.id)}
        )
        
        return {
            "access_token": app_token,
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            "user": {
                "id": user_obj.id,
                "email": user_obj.email,
                "first_name": user_obj.first_name,
                "last_name": user_obj.last_name,
                "role": user_obj.role,
                "gitlab_username": user_obj.gitlab_username
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"OAuth callback failed: {str(e)}"
        )

@router.get("/gitlab/projects")
async def get_gitlab_projects(
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """Get current user's GitLab projects"""
    if not current_user.gitlab_access_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User not connected to GitLab"
        )
    
    try:
        projects = await gitlab_oauth_service.get_user_projects(
            access_token=current_user.gitlab_access_token
        )
        return {"projects": projects}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to fetch GitLab projects: {str(e)}"
        )