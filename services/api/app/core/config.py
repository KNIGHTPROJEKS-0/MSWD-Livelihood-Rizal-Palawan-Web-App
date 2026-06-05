from pydantic_settings import BaseSettings
from typing import List, Optional
import os


class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "MSWD Livelihood Program API"

    SECRET_KEY: str = "mswd-rizal-palawan-secret-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7
    ALGORITHM: str = "HS256"

    DATABASE_URL: str = "postgresql://localhost/mswd_livelihood"

    ALLOWED_HOSTS: List[str] = ["*"]

    FIRST_SUPERUSER_EMAIL: str = "admin@mswd.gov.ph"
    FIRST_SUPERUSER_PASSWORD: str = "Admin@MSWD2024"

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"


settings = Settings()
