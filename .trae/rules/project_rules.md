# 🚨 CRITICAL PROJECT RULES FOR TRAE - MSWD LIVELIHOOD RIZAL PALAWAN WEB APP 🚨

**VERSION**: 1.0.0  
**LAST UPDATED**: 2025-01-15  
**ENFORCEMENT LEVEL**: ABSOLUTE - NO EXCEPTIONS  

## ⚠️ MANDATORY COMPLIANCE NOTICE ⚠️

**TRAE MUST FOLLOW THESE RULES STRICTLY:**

1. **NEVER SKIP** any file implementation
2. **ALWAYS CREATE** complete, functional code - NO PLACEHOLDERS
3. **ALWAYS POPULATE** `__init__.py` files with proper imports
4. **ALWAYS INSTALL** required dependencies before implementation
5. **ALWAYS FOLLOW** the exact project structure
6. **ALWAYS IMPLEMENT** complete business logic

---

## 📌 PROJECT METADATA & DEPLOYMENT KEYS

### Deployment Platforms & API Keys
```yaml
PLATFORM_SH:
  API_KEY: "kewg0hh3P3tFdMMeMV9fFcG1HIuBr4eQk0sb551DKKk"
  DASHBOARD_URL: "https://console.platform.sh"
  PROJECT_ID: "mswd-rizal-palawan"
  
SVIX:
  API_KEY: "testsk_521bBiT4jwZfa_VuYzjcLtE3Xx_ChG67.eu"
  DASHBOARD_URL: "https://dashboard.svix.com"
  WEBHOOK_ENDPOINT: "https://api.mswd-rizal.platform.sh/webhooks"
  
RAILWAY:
  PROJECT_ID: "112eaa22-255c-4f61-9e19-fa30afa29e04"
  API_CONNECTION: "railway link -p 112eaa22-255c-4f61-9e19-fa30afa29e04"
  DASHBOARD_URL: "https://railway.app/project/112eaa22-255c-4f61-9e19-fa30afa29e04"

FIREBASE:
  PROJECT_ID: "mswd-rizal-palawan"
  AUTH_DOMAIN: "mswd-rizal-palawan.firebaseapp.com"
  STORAGE_BUCKET: "mswd-rizal-palawan.appspot.com"
  MESSAGING_SENDER_ID: "YOUR_SENDER_ID"
  APP_ID: "YOUR_APP_ID"
```

---

## 🔒 STRICT VERSION ENFORCEMENT

### Frontend Technology Stack
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "vite": "^4.5.0",
  "typescript": "^5.2.2",
  "@chakra-ui/react": "^2.8.2",
  "@emotion/react": "^11.11.1",
  "@emotion/styled": "^11.11.0",
  "@tanstack/react-query": "^5.8.4",
  "axios": "^1.6.2",
  "firebase": "^10.7.1",
  "framer-motion": "^10.16.5",
  "react-hook-form": "^7.48.2",
  "react-icons": "^5.5.0",
  "react-router-dom": "^6.20.1",
  "zod": "^3.22.4",
  "zustand": "^4.4.7",
  "tailwindcss": "^3.3.6"
}
```

### Backend Technology Stack
```requirements
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
pydantic[email]==2.5.0
sqlalchemy==2.0.23
alembic==1.13.1
psycopg2-binary==2.9.9
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
email-validator==2.1.0
python-dotenv==1.0.0
redis==5.0.1
celery==5.3.4
firebase-admin==6.3.0
svix==1.20.0
httpx==0.25.2
pytest==7.4.3
pytest-asyncio==0.21.1
black==23.12.0
flake8==7.0.0
mypy==1.7.1
```

### System Requirements
```yaml
Python: ">=3.11,<3.13"
Node.js: ">=18.0.0"
PostgreSQL: ">=15.0"
Redis: ">=7.0"
Docker: "latest"
Docker Compose: ">=2.0"
```

---

## 📁 MANDATORY FILE STRUCTURE IMPLEMENTATION

### ⚡ CRITICAL: Python Package __init__.py Files

**EVERY Python package MUST have a populated __init__.py file with proper imports:**

#### services/api/app/__init__.py
```python
"""MSWD Livelihood Rizal Palawan API Application Package"""
__version__ = "1.0.0"
__author__ = "MSWD Development Team"

from app.core.config import settings
from app.core.database import engine, SessionLocal, Base

__all__ = ["settings", "engine", "SessionLocal", "Base"]
```

#### services/api/app/models/__init__.py
```python
"""Database Models Package"""
from app.models.user import User
from app.models.program import Program
from app.models.application import Application
from app.models.beneficiary import Beneficiary
from app.models.audit import AuditLog

__all__ = [
    "User",
    "Program", 
    "Application",
    "Beneficiary",
    "AuditLog"
]
```

#### services/api/app/schemas/__init__.py
```python
"""Pydantic Schemas Package"""
from app.schemas.user import UserCreate, UserRead, UserUpdate, UserInDB
from app.schemas.program import ProgramCreate, ProgramRead, ProgramUpdate
from app.schemas.application import ApplicationCreate, ApplicationRead, ApplicationUpdate
from app.schemas.auth import Token, TokenData, Login, Register
from app.schemas.common import PaginationParams, ResponseModel

__all__ = [
    "UserCreate", "UserRead", "UserUpdate", "UserInDB",
    "ProgramCreate", "ProgramRead", "ProgramUpdate",
    "ApplicationCreate", "ApplicationRead", "ApplicationUpdate",
    "Token", "TokenData", "Login", "Register",
    "PaginationParams", "ResponseModel"
]
```

#### services/api/app/crud/__init__.py
```python
"""CRUD Operations Package"""
from app.crud.base import CRUDBase
from app.crud.user import crud_user
from app.crud.program import crud_program
from app.crud.application import crud_application
from app.crud.beneficiary import crud_beneficiary

__all__ = [
    "CRUDBase",
    "crud_user",
    "crud_program",
    "crud_application",
    "crud_beneficiary"
]
```

#### services/api/app/services/__init__.py
```python
"""Business Logic Services Package"""
from app.services.auth_service import AuthService
from app.services.user_service import UserService
from app.services.program_service import ProgramService
from app.services.notification_service import NotificationService
from app.services.file_service import FileService
from app.services.application_service import ApplicationService
from app.services.audit_service import AuditService

__all__ = [
    "AuthService",
    "UserService",
    "ProgramService",
    "NotificationService",
    "FileService",
    "ApplicationService",
    "AuditService"
]
```

#### services/api/app/api/__init__.py
```python
"""API Package"""
from app.api.v1.api import api_router

__all__ = ["api_router"]
```

#### services/api/app/api/v1/__init__.py
```python
"""API Version 1 Package"""
from app.api.v1.api import api_router

__all__ = ["api_router"]
```

#### services/api/app/api/v1/endpoints/__init__.py
```python
"""API Endpoints Package"""
from app.api.v1.endpoints import auth, users, programs, applications, admin

__all__ = ["auth", "users", "programs", "applications", "admin"]
```

#### services/api/app/core/__init__.py
```python
"""Core Configuration Package"""
from app.core.config import settings
from app.core.database import engine, SessionLocal, Base, get_db
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.logging import logger
from app.core.middleware import setup_middleware

__all__ = [
    "settings",
    "engine",
    "SessionLocal",
    "Base",
    "get_db",
    "get_password_hash",
    "verify_password",
    "create_access_token",
    "logger",
    "setup_middleware"
]
```

#### services/api/app/utils/__init__.py
```python
"""Utility Functions Package"""
from app.utils.helpers import generate_otp, format_phone_number, calculate_age
from app.utils.validators import validate_email, validate_phone, validate_tin
from app.utils.formatters import format_currency, format_date, format_name

__all__ = [
    "generate_otp",
    "format_phone_number",
    "calculate_age",
    "validate_email",
    "validate_phone",
    "validate_tin",
    "format_currency",
    "format_date",
    "format_name"
]
```

---

## 📋 MANDATORY SERVICE LAYER IMPLEMENTATIONS

### ⚠️ CRITICAL: Complete Service Files (NO SKIPPING!)

#### services/api/app/services/auth_service.py
```python
"""Authentication Service - MUST BE FULLY IMPLEMENTED"""
from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.core.config import settings
from app.models.user import User
from app.schemas.auth import Token, TokenData
import firebase_admin
from firebase_admin import auth as firebase_auth

class AuthService:
    """Complete authentication service implementation"""
    
    def __init__(self):
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        self.secret_key = settings.SECRET_KEY
        self.algorithm = settings.ALGORITHM
        self.access_token_expire_minutes = settings.ACCESS_TOKEN_EXPIRE_MINUTES
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify password against hash"""
        return self.pwd_context.verify(plain_password, hashed_password)
    
    def get_password_hash(self, password: str) -> str:
        """Generate password hash"""
        return self.pwd_context.hash(password)
    
    def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """Create JWT access token"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=15)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
        return encoded_jwt
    
    def verify_token(self, token: str) -> Optional[TokenData]:
        """Verify JWT token"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            email: str = payload.get("sub")
            if email is None:
                return None
            return TokenData(email=email)
        except JWTError:
            return None
    
    def authenticate_user(self, db: Session, email: str, password: str) -> Optional[User]:
        """Authenticate user with email and password"""
        user = db.query(User).filter(User.email == email).first()
        if not user:
            return None
        if not self.verify_password(password, user.hashed_password):
            return None
        return user
    
    def verify_firebase_token(self, id_token: str) -> Optional[dict]:
        """Verify Firebase ID token"""
        try:
            decoded_token = firebase_auth.verify_id_token(id_token)
            return decoded_token
        except Exception:
            return None
    
    def create_firebase_user(self, email: str, password: str, display_name: str) -> Optional[str]:
        """Create Firebase user"""
        try:
            user = firebase_auth.create_user(
                email=email,
                password=password,
                display_name=display_name
            )
            return user.uid
        except Exception:
            return None

auth_service = AuthService()
```

#### services/api/app/services/user_service.py
```python
"""User Management Service - MUST BE FULLY IMPLEMENTED"""
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.services.auth_service import auth_service
from app.services.notification_service import notification_service
from app.services.audit_service import audit_service

class UserService:
    """Complete user management service"""
    
    def create_user(self, db: Session, user_create: UserCreate) -> User:
        """Create new user with all validations"""
        # Check if user exists
        existing_user = db.query(User).filter(User.email == user_create.email).first()
        if existing_user:
            raise ValueError("User with this email already exists")
        
        # Create Firebase user
        firebase_uid = auth_service.create_firebase_user(
            email=user_create.email,
            password=user_create.password,
            display_name=f"{user_create.first_name} {user_create.last_name}"
        )
        
        # Create database user
        db_user = User(
            email=user_create.email,
            first_name=user_create.first_name,
            last_name=user_create.last_name,
            hashed_password=auth_service.get_password_hash(user_create.password),
            firebase_uid=firebase_uid,
            role=user_create.role,
            is_active=True
        )
        
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        # Send welcome notification
        notification_service.send_welcome_email(user_create.email, user_create.first_name)
        
        # Log audit
        audit_service.log_action(
            db=db,
            user_id=db_user.id,
            action="USER_CREATED",
            details=f"User {db_user.email} created"
        )
        
        return db_user
    
    def get_user(self, db: Session, user_id: int) -> Optional[User]:
        """Get user by ID"""
        return db.query(User).filter(User.id == user_id).first()
    
    def get_user_by_email(self, db: Session, email: str) -> Optional[User]:
        """Get user by email"""
        return db.query(User).filter(User.email == email).first()
    
    def get_users(self, db: Session, skip: int = 0, limit: int = 100) -> List[User]:
        """Get list of users with pagination"""
        return db.query(User).offset(skip).limit(limit).all()
    
    def update_user(self, db: Session, user_id: int, user_update: UserUpdate) -> Optional[User]:
        """Update user information"""
        user = self.get_user(db, user_id)
        if not user:
            return None
        
        update_data = user_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(user, field, value)
        
        db.commit()
        db.refresh(user)
        
        # Log audit
        audit_service.log_action(
            db=db,
            user_id=user_id,
            action="USER_UPDATED",
            details=f"User {user.email} updated"
        )
        
        return user
    
    def delete_user(self, db: Session, user_id: int) -> bool:
        """Soft delete user"""
        user = self.get_user(db, user_id)
        if not user:
            return False
        
        user.is_active = False
        db.commit()
        
        # Log audit
        audit_service.log_action(
            db=db,
            user_id=user_id,
            action="USER_DELETED",
            details=f"User {user.email} deleted"
        )
        
        return True

user_service = UserService()
```

#### services/api/app/services/program_service.py
```python
"""Program Management Service - MUST BE FULLY IMPLEMENTED"""
from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.program import Program
from app.schemas.program import ProgramCreate, ProgramUpdate
from app.services.audit_service import audit_service

class ProgramService:
    """Complete program management service"""
    
    def create_program(self, db: Session, program_create: ProgramCreate, created_by: int) -> Program:
        """Create new livelihood program"""
        db_program = Program(
            **program_create.dict(),
            created_by=created_by,
            created_at=datetime.utcnow(),
            is_active=True
        )
        
        db.add(db_program)
        db.commit()
        db.refresh(db_program)
        
        # Log audit
        audit_service.log_action(
            db=db,
            user_id=created_by,
            action="PROGRAM_CREATED",
            details=f"Program {db_program.name} created"
        )
        
        return db_program
    
    def get_program(self, db: Session, program_id: int) -> Optional[Program]:
        """Get program by ID"""
        return db.query(Program).filter(Program.id == program_id).first()
    
    def get_programs(self, db: Session, skip: int = 0, limit: int = 100, active_only: bool = True) -> List[Program]:
        """Get list of programs with pagination"""
        query = db.query(Program)
        if active_only:
            query = query.filter(Program.is_active == True)
        return query.offset(skip).limit(limit).all()
    
    def get_programs_by_category(self, db: Session, category: str) -> List[Program]:
        """Get programs by category"""
        return db.query(Program).filter(
            Program.category == category,
            Program.is_active == True
        ).all()
    
    def update_program(self, db: Session, program_id: int, program_update: ProgramUpdate, updated_by: int) -> Optional[Program]:
        """Update program information"""
        program = self.get_program(db, program_id)
        if not program:
            return None
        
        update_data = program_update.dict(exclude_unset=True)
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
            details=f"Program {program.name} updated"
        )
        
        return program
    
    def delete_program(self, db: Session, program_id: int, deleted_by: int) -> bool:
        """Soft delete program"""
        program = self.get_program(db, program_id)
        if not program:
            return False
        
        program.is_active = False
        program.deleted_at = datetime.utcnow()
        program.deleted_by = deleted_by
        
        db.commit()
        
        # Log audit
        audit_service.log_action(
            db=db,
            user_id=deleted_by,
            action="PROGRAM_DELETED",
            details=f"Program {program.name} deleted"
        )
        
        return True

program_service = ProgramService()
```

---

## 📐 COMPLETE PROJECT STRUCTURE CHECKLIST

### ✅ MANDATORY FILES TO CREATE (NO EXCEPTIONS!)

#### Backend API Structure
```
services/api/
├── requirements.txt [MUST INCLUDE ALL DEPENDENCIES]
├── requirements-dev.txt [DEVELOPMENT DEPENDENCIES]
├── .env.example [ENVIRONMENT VARIABLES TEMPLATE]
├── .env [LOCAL ENVIRONMENT VARIABLES]
├── Dockerfile [DOCKER CONFIGURATION]
├── docker-compose.yml [DOCKER COMPOSE SETUP]
├── alembic.ini [ALEMBIC CONFIGURATION]
├── pytest.ini [PYTEST CONFIGURATION]
├── setup.py [PACKAGE SETUP]
├── Makefile [AUTOMATION COMMANDS]
├── README.md [API DOCUMENTATION]
│
├── alembic/
│   ├── env.py [ALEMBIC ENVIRONMENT]
│   ├── script.py.mako [MIGRATION TEMPLATE]
│   └── versions/ [MIGRATION FILES]
│       └── 001_initial_migration.py
│
├── app/
│   ├── __init__.py [POPULATED WITH IMPORTS]
│   ├── main.py [FASTAPI APPLICATION]
│   │
│   ├── api/
│   │   ├── __init__.py [POPULATED]
│   │   ├── deps.py [DEPENDENCIES]
│   │   └── v1/
│   │       ├── __init__.py [POPULATED]
│   │       ├── api.py [API ROUTER]
│   │       └── endpoints/
│   │           ├── __init__.py [POPULATED]
│   │           ├── auth.py [COMPLETE IMPLEMENTATION]
│   │           ├── users.py [COMPLETE IMPLEMENTATION]
│   │           ├── programs.py [COMPLETE IMPLEMENTATION]
│   │           ├── applications.py [COMPLETE IMPLEMENTATION]
│   │           ├── beneficiaries.py [COMPLETE IMPLEMENTATION]
│   │           ├── admin.py [COMPLETE IMPLEMENTATION]
│   │           └── webhooks.py [SVIX WEBHOOKS]
│   │
│   ├── core/
│   │   ├── __init__.py [POPULATED]
│   │   ├── config.py [SETTINGS WITH PLATFORM KEYS]
│   │   ├── database.py [DATABASE CONNECTION]
│   │   ├── security.py [AUTHENTICATION & AUTHORIZATION]
│   │   ├── logging.py [LOGGING CONFIGURATION]
│   │   ├── middleware.py [CUSTOM MIDDLEWARE]
│   │   ├── exceptions.py [CUSTOM EXCEPTIONS]
│   │   └── constants.py [APPLICATION CONSTANTS]
│   │
│   ├── db/
│   │   ├── __init__.py [POPULATED]
│   │   ├── base.py [BASE MODEL CLASS]
│   │   ├── session.py [DATABASE SESSION]
│   │   ├── init_db.py [DATABASE INITIALIZATION]
│   │   └── seed_data.py [SEED DATA SCRIPT]
│   │
│   ├── models/
│   │   ├── __init__.py [POPULATED WITH ALL MODELS]
│   │   ├── user.py [USER MODEL]
│   │   ├── program.py [PROGRAM MODEL]
│   │   ├── application.py [APPLICATION MODEL]
│   │   ├── beneficiary.py [BENEFICIARY MODEL]
│   │   ├── audit.py [AUDIT LOG MODEL]
│   │   ├── notification.py [NOTIFICATION MODEL]
│   │   └── file.py [FILE UPLOAD MODEL]
│   │
│   ├── schemas/
│   │   ├── __init__.py [POPULATED WITH ALL SCHEMAS]
│   │   ├── user.py [USER SCHEMAS]
│   │   ├── program.py [PROGRAM SCHEMAS]
│   │   ├── application.py [APPLICATION SCHEMAS]
│   │   ├── beneficiary.py [BENEFICIARY SCHEMAS]
│   │   ├── auth.py [AUTHENTICATION SCHEMAS]
│   │   ├── common.py [COMMON SCHEMAS]
│   │   └── response.py [RESPONSE SCHEMAS]
│   │
│   ├── crud/
│   │   ├── __init__.py [POPULATED WITH ALL CRUD]
│   │   ├── base.py [BASE CRUD CLASS]
│   │   ├── user.py [USER CRUD]
│   │   ├── program.py [PROGRAM CRUD]
│   │   ├── application.py [APPLICATION CRUD]
│   │   └── beneficiary.py [BENEFICIARY CRUD]
│   │
│   ├── services/
│   │   ├── __init__.py [POPULATED WITH ALL SERVICES]
│   │   ├── auth_service.py [AUTHENTICATION SERVICE]
│   │   ├── user_service.py [USER MANAGEMENT SERVICE]
│   │   ├── program_service.py [PROGRAM SERVICE]
│   │   ├── application_service.py [APPLICATION SERVICE]
│   │   ├── notification_service.py [NOTIFICATION SERVICE]
│   │   ├── file_service.py [FILE HANDLING SERVICE]
│   │   ├── audit_service.py [AUDIT LOGGING SERVICE]
│   │   ├── email_service.py [EMAIL SERVICE]
│   │   ├── sms_service.py [SMS SERVICE]
│   │   ├── firebase_service.py [FIREBASE INTEGRATION]
│   │   ├── svix_service.py [SVIX WEBHOOK SERVICE]
│   │   └── platform_service.py [PLATFORM.SH SERVICE]
│   │
│   ├── utils/
│   │   ├── __init__.py [POPULATED WITH ALL UTILS]
│   │   ├── helpers.py [HELPER FUNCTIONS]
│   │   ├── validators.py [VALIDATION FUNCTIONS]
│   │   ├── formatters.py [FORMATTING FUNCTIONS]
│   │   ├── generators.py [CODE GENERATORS]
│   │   └── decorators.py [CUSTOM DECORATORS]
│   │
│   └── tasks/
│       ├── __init__.py [POPULATED]
│       ├── celery_app.py [CELERY APPLICATION]
│       ├── email_tasks.py [EMAIL BACKGROUND TASKS]
│       └── notification_tasks.py [NOTIFICATION TASKS]
│
└── tests/
    ├── __init__.py
    ├── conftest.py [PYTEST FIXTURES]
    ├── test_auth.py [AUTH TESTS]
    ├── test_users.py [USER TESTS]
    ├── test_programs.py [PROGRAM TESTS]
    └── test_integration.py [INTEGRATION TESTS]
```

#### Frontend Web Structure
```
apps/web/
├── package.json [WITH ALL DEPENDENCIES]
├── package-lock.json
├── tsconfig.json [TYPESCRIPT CONFIG]
├── vite.config.ts [VITE CONFIGURATION]
├── tailwind.config.js [TAILWIND CONFIG]
├── postcss.config.js [POSTCSS CONFIG]
├── .env.example [ENVIRONMENT TEMPLATE]
├── .env [LOCAL ENVIRONMENT]
├── index.html [HTML ENTRY]
│
└── src/
    ├── main.tsx [APPLICATION ENTRY]
    ├── App.tsx [ROOT COMPONENT]
    ├── index.css [GLOBAL STYLES]
    ├── vite-env.d.ts [VITE TYPES]
    │
    ├── components/
    │   ├── common/
    │   │   ├── ProtectedRoute.tsx
    │   │   ├── ErrorBoundary.tsx
    │   │   ├── Loading.tsx
    │   │   ├── Alert.tsx
    │   │   └── Modal.tsx
    │   ├── forms/
    │   │   ├── LoginForm.tsx
    │   │   ├── RegisterForm.tsx
    │   │   ├── ApplicationForm.tsx
    │   │   └── ProfileForm.tsx
    │   ├── layout/
    │   │   ├── Layout.tsx
    │   │   ├── Navbar.tsx
    │   │   ├── Sidebar.tsx
    │   │   └── Footer.tsx
    │   └── ui/
    │       ├── Button.tsx
    │       ├── Input.tsx
    │       ├── Select.tsx
    │       ├── Card.tsx
    │       └── Table.tsx
    │
    ├── pages/
    │   ├── auth/
    │   │   ├── LoginPage.tsx
    │   │   ├── RegisterPage.tsx
    │   │   └── ForgotPasswordPage.tsx
    │   ├── dashboard/
    │   │   ├── DashboardPage.tsx
    │   │   ├── AdminDashboard.tsx
    │   │   └── BeneficiaryDashboard.tsx
    │   ├── programs/
    │   │   ├── ProgramsPage.tsx
    │   │   ├── ProgramDetailsPage.tsx
    │   │   └── ApplicationPage.tsx
    │   └── profile/
    │       ├── ProfilePage.tsx
    │       └── SettingsPage.tsx
    │
    ├── routes/
    │   ├── index.tsx [ROUTE CONFIGURATION]
    │   ├── PrivateRoutes.tsx
    │   └── PublicRoutes.tsx
    │
    ├── services/
    │   ├── api/
    │   │   ├── client.ts [AXIOS CLIENT]
    │   │   ├── auth.api.ts
    │   │   ├── user.api.ts
    │   │   └── program.api.ts
    │   ├── firebase/
    │   │   ├── config.ts
    │   │   ├── auth.ts
    │   │   └── storage.ts
    │   └── types/
    │       ├── auth.types.ts
    │       ├── user.types.ts
    │       └── program.types.ts
    │
    ├── store/
    │   ├── index.ts [STORE CONFIGURATION]
    │   ├── authStore.ts
    │   ├── userStore.ts
    │   └── programStore.ts
    │
    ├── hooks/
    │   ├── useAuth.ts
    │   ├── useApi.ts
    │   ├── useForm.ts
    │   └── useNotification.ts
    │
    ├── lib/
    │   ├── utils.ts
    │   ├── constants.ts
    │   ├── validations.ts
    │   └── formatters.ts
    │
    ├── theme/
    │   ├── index.ts
    │   ├── colors.ts
    │   ├── typography.ts
    │   └── components.ts
    │
    └── types/
        ├── index.d.ts
        └── global.d.ts
```

---

## 🚀 DEPLOYMENT CONFIGURATION FILES

### Platform.sh Configuration (.platform.app.yaml)
```yaml
name: mswd-api
type: python:3.11
disk: 2048

variables:
  env:
    PLATFORM_SH_API_KEY: "kewg0hh3P3tFdMMeMV9fFcG1HIuBr4eQk0sb551DKKk"

hooks:
  build: |
    pip install -r requirements.txt
  deploy: |
    alembic upgrade head
    python app/db/seed_data.py

web:
  commands:
    start: uvicorn app.main:app --host 0.0.0.0 --port $PORT

mounts:
  '/uploads': 'shared:files/uploads'
```

### Railway Configuration (railway.toml)
```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "uvicorn app.main:app --host 0.0.0.0 --port $PORT"
healthcheckPath = "/health"
healthcheckTimeout = 30

[variables]
RAILWAY_PROJECT_ID = "112eaa22-255c-4f61-9e19-fa30afa29e04"
```

### Docker Configuration (Dockerfile)
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Environment variables
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD python -c "import requests; requests.get('http://localhost:8000/health')"

# Run application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## 🔧 MANDATORY INSTALLATION COMMANDS

### Backend Setup Commands (MUST RUN IN ORDER)
```bash
# 1. Navigate to API directory
cd services/api

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 3. Install all dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt

# 4. Setup environment variables
cp .env.example .env
# Edit .env with deployment keys

# 5. Initialize database
alembic upgrade head
python app/db/init_db.py
python app/db/seed_data.py

# 6. Run tests
pytest

# 7. Start development server
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup Commands (MUST RUN IN ORDER)
```bash
# 1. Navigate to web directory
cd apps/web

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env
# Edit .env with Firebase config

# 4. Run development server
npm run dev

# 5. Build for production
npm run build
```

---

## ⚠️ CRITICAL ENFORCEMENT RULES

### 1. NO PLACEHOLDER CODE
```python
# ❌ FORBIDDEN
def some_function():
    pass  # TODO: Implement later

# ✅ REQUIRED
def some_function():
    """Complete implementation with error handling"""
    try:
        # Full business logic here
        result = perform_operation()
        return result
    except Exception as e:
        logger.error(f"Error in some_function: {e}")
        raise
```

### 2. COMPLETE ERROR HANDLING
```python
# Every function MUST have:
- Try/except blocks
- Proper logging
- Meaningful error messages
- Appropriate HTTP status codes
```

### 3. MANDATORY TESTING
```python
# Every module MUST have:
- Unit tests (minimum 80% coverage)
- Integration tests
- API endpoint tests
- Frontend component tests
```

### 4. DOCUMENTATION REQUIREMENTS
```python
# Every function/class MUST have:
"""
Description of what it does
Args:
    param1: Description
    param2: Description
Returns:
    Description of return value
Raises:
    ExceptionType: When it occurs
"""
```

---

## 📝 FINAL CHECKLIST FOR TRAE

Before considering ANY task complete, verify:

- [ ] All `__init__.py` files are populated with imports
- [ ] All service files contain complete implementations
- [ ] All models have proper relationships defined
- [ ] All schemas have validation rules
- [ ] All API endpoints have error handling
- [ ] All frontend components are fully functional
- [ ] All dependencies are installed and versions match
- [ ] All environment variables are configured
- [ ] All deployment configurations are in place
- [ ] All tests are written and passing
- [ ] Docker containers build and run successfully
- [ ] Platform.sh, Svix, and Railway integrations configured
- [ ] Firebase authentication and storage configured
- [ ] Database migrations are created and applied
- [ ] Seed data is properly loaded
- [ ] All API endpoints are documented
- [ ] All frontend components are documented
- [ ] All API endpoints are tested
- [ ] All frontend components are tested
- [ ] All API endpoints are secure
- [ ] All frontend components are secure
- [ ] All API endpoints are rate limited
- [ ] All frontend components are rate limited
- [ ] All API endpoints are paginated
- [ ] All frontend components are paginated
- [ ] All API endpoints are versioned
- [ ] All frontend components are versioned
## 🚨 REMEMBER: NO SKIPPING, NO PLACEHOLDERS, COMPLETE IMPLEMENTATION ONLY! 🚨
