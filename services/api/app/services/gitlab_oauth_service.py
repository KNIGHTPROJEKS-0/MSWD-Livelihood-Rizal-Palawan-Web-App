"""GitLab OAuth Service Implementation"""
import httpx
from typing import Optional, Dict, Any
from urllib.parse import urlencode
from fastapi import HTTPException, status

from app.core.config import settings

class GitLabOAuthService:
    """GitLab OAuth integration service"""
    
    def __init__(self):
        self.client_id = settings.GITLAB_CLIENT_ID
        self.client_secret = settings.GITLAB_CLIENT_SECRET
        self.redirect_uri = settings.GITLAB_REDIRECT_URI
        self.base_url = settings.GITLAB_BASE_URL
        self.scopes = settings.GITLAB_OAUTH_SCOPES
    
    def get_authorization_url(self, state: Optional[str] = None) -> str:
        """Generate GitLab OAuth authorization URL"""
        params = {
            "client_id": self.client_id,
            "redirect_uri": self.redirect_uri,
            "response_type": "code",
            "scope": self.scopes,
        }
        
        if state:
            params["state"] = state
        
        auth_url = f"{self.base_url}/oauth/authorize?{urlencode(params)}"
        return auth_url
    
    async def exchange_code_for_token(self, code: str) -> Dict[str, Any]:
        """Exchange authorization code for access token"""
        token_url = f"{self.base_url}/oauth/token"
        
        data = {
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": self.redirect_uri,
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(token_url, data=data)
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Failed to exchange code for token"
                )
            
            return response.json()
    
    async def get_user_info(self, access_token: str) -> Dict[str, Any]:
        """Get user information from GitLab API"""
        user_url = f"{self.base_url}/api/v4/user"
        
        headers = {
            "Authorization": f"Bearer {access_token}"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(user_url, headers=headers)
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Failed to get user information"
                )
            
            return response.json()
    
    async def get_user_projects(self, access_token: str, per_page: int = 20) -> list[Dict[str, Any]]:
        """Get user's GitLab projects"""
        projects_url = f"{self.base_url}/api/v4/projects"
        
        headers = {
            "Authorization": f"Bearer {access_token}"
        }
        
        params = {
            "membership": "true",
            "per_page": per_page,
            "order_by": "updated_at",
            "sort": "desc"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(projects_url, headers=headers, params=params)
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Failed to get user projects"
                )
            
            return response.json()

gitlab_oauth_service = GitLabOAuthService()