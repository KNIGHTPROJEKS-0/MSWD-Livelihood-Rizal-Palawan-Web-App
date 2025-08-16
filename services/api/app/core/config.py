from pydantic_settings import BaseSettings
from typing import List, Optional
import os

class Settings(BaseSettings):
    # API Settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "MSWD Livelihood Program API"
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-this-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    ALGORITHM: str = "HS256"
    
    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost/mswd_livelihood"
    
    # CORS
    ALLOWED_HOSTS: List[str] = ["http://localhost:3000", "http://localhost:3001"]
    
    # Email (for notifications)
    SMTP_TLS: bool = True
    SMTP_PORT: Optional[int] = None
    SMTP_HOST: Optional[str] = None
    SMTP_SERVER: Optional[str] = None
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    EMAILS_FROM_EMAIL: Optional[str] = None
    EMAILS_FROM_NAME: Optional[str] = None
    
    # Firebase Configuration
    FIREBASE_PROJECT_ID: str = "mswd-rizal-palawan"
    GOOGLE_APPLICATION_CREDENTIALS: Optional[str] = None
    FIREBASE_SERVICE_ACCOUNT_JSON_BASE64: Optional[str] = None
    FIREBASE_SERVICE_ACCOUNT_FILE: Optional[str] = None
    
    # Superuser
    FIRST_SUPERUSER: str = "admin@mswd.gov.ph"
    FIRST_SUPERUSER_PASSWORD: str = "changethis"
    
    # GitLab OAuth Configuration
    GITLAB_CLIENT_ID: Optional[str] = None
    GITLAB_CLIENT_SECRET: Optional[str] = None
    GITLAB_REDIRECT_URI: Optional[str] = "http://localhost:3000/auth/gitlab/callback"
    GITLAB_BASE_URL: str = "https://gitlab.com"  # Change if using self-hosted GitLab
    GITLAB_OAUTH_SCOPES: str = "read_user openid profile email"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()