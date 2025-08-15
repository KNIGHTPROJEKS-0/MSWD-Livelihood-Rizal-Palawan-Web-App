# MSWD Livelihood Rizal Palawan Web Application

## Project Overview
**Name**: MSWD-Livelihood-Rizal-Palawan-Web-App  
**Version**: 1.0.0  
**Status**: Active Development  
**Last Updated**: 2024-01-01  

**Purpose**: A unified digital platform for the Municipal Social Welfare and Development Office (MSWD) of Rizal, Palawan to digitize, streamline, and track the delivery of livelihood and social welfare services across 11 barangays.

## Stakeholders & User Roles

### Primary Users
1. **Superadmin**
   - Full system control and configuration
   - Analytics and reporting dashboard
   - User management and system monitoring

2. **Admin (MSWD Staff)**
   - Program management and configuration
   - Application review and processing
   - Benefit distribution and tracking

3. **Beneficiaries**
   - Self-registration and profile management
   - Program application submission
   - Application status tracking
   - Notification and update reception

## Core Service Modules

### 1. Livelihood Programs Module
- Financial aid distribution
- Skills training programs
- Business development support
- Microfinance assistance

### 2. Child & Youth Welfare Module
- Day care center management
- Youth development programs
- Child protection services
- Educational assistance

### 3. Family & Community Welfare Module
- Family counseling services
- Solo parent assistance program
- Victim assistance and support
- Community development initiatives

### 4. Social Pension Module
- Senior citizen support programs
- PWD (Persons with Disabilities) assistance
- Monthly pension distribution
- Healthcare support services

### 5. Crisis Intervention Module
- Emergency response coordination
- Disaster relief distribution
- Crisis counseling services
- Emergency financial assistance

## Technology Stack

### Frontend Technologies
- **Web Application**: React 18 + Vite + TypeScript + Chakra UI
- **Mobile Application**: Expo React Native + TypeScript
- **State Management**: Zustand/Redux Toolkit
- **Form Handling**: React Hook Form + Zod validation
- **HTTP Client**: Axios/TanStack Query

### Backend Technologies
- **API Framework**: FastAPI (Python 3.11+)
- **Database**: PostgreSQL 15+
- **Caching**: Redis 7+
- **Authentication**: Firebase Auth
- **File Storage**: Firebase Storage
- **Push Notifications**: Firebase Cloud Messaging (FCM)

### DevOps & Infrastructure
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Infrastructure as Code**: Terraform
- **Deployment Platforms**: Render (API) + Platform.sh (Web)
- **Workflow Automation**: n8n
- **Development Environment**: Cursor, Kiro, TRAE, VS Code

## Project Architecture

```
MSWD-Livelihood-Rizal-Palawan-Web-App/
├── apps/                               # Frontend Applications
│   ├── web/                            # React Web Application
│   │   ├── public/                     # Static assets
│   │   ├── src/
│   │   │   ├── components/             # Reusable UI components
│   │   │   │   ├── common/             # Shared components
│   │   │   │   ├── forms/              # Form components
│   │   │   │   ├── layout/             # Layout components
│   │   │   │   └── ui/                 # Base UI components
│   │   │   ├── pages/                  # Route page components
│   │   │   │   ├── auth/               # Authentication pages
│   │   │   │   ├── dashboard/          # Dashboard pages
│   │   │   │   ├── programs/           # Program-specific pages
│   │   │   │   └── profile/            # User profile pages
│   │   │   ├── routes/                 # Router configuration
│   │   │   ├── services/               # API clients & Firebase
│   │   │   │   ├── api/                # Backend API client
│   │   │   │   ├── firebase/           # Firebase services
│   │   │   │   └── types/              # Service type definitions
│   │   │   ├── store/                  # State management
│   │   │   │   ├── slices/             # Redux slices/Zustand stores
│   │   │   │   └── index.ts            # Store configuration
│   │   │   ├── hooks/                  # Custom React hooks
│   │   │   ├── lib/                    # Utility functions
│   │   │   │   ├── utils.ts            # General utilities
│   │   │   │   ├── constants.ts        # App constants
│   │   │   │   └── validations.ts      # Form validations
│   │   │   ├── theme/                  # Chakra UI theme
│   │   │   │   ├── index.ts            # Theme configuration
│   │   │   │   ├── colors.ts           # Color palette
│   │   │   │   └── components.ts       # Component styles
│   │   │   ├── types/                  # TypeScript definitions
│   │   │   ├── App.tsx                 # Root component
│   │   │   └── main.tsx                # Application entry point
│   │   ├── index.html                  # HTML template
│   │   ├── vite.config.ts              # Vite configuration
│   │   ├── tsconfig.json               # TypeScript config
│   │   ├── tailwind.config.js          # Tailwind CSS config
│   │   └── package.json                # Dependencies
│   │
│   └── mobile/                         # React Native Mobile App
│       ├── src/
│       │   ├── components/             # Mobile UI components
│       │   ├── screens/                # Screen components
│       │   │   ├── auth/               # Authentication screens
│       │   │   ├── dashboard/          # Dashboard screens
│       │   │   ├── programs/           # Program screens
│       │   │   └── profile/            # Profile screens
│       │   ├── navigation/             # Navigation configuration
│       │   ├── services/               # API & Firebase services
│       │   ├── store/                  # State management
│       │   ├── hooks/                  # Custom hooks
│       │   ├── lib/                    # Utilities
│       │   ├── types/                  # Type definitions
│       │   └── App.tsx                 # Root component
│       ├── app.json                    # Expo configuration
│       ├── babel.config.js             # Babel configuration
│       ├── metro.config.js             # Metro bundler config
│       └── package.json                # Dependencies
│
├── services/                           # Backend Services
│   └── api/                            # FastAPI Backend
│       ├── app/
│       │   ├── api/                    # API route handlers
│       │   │   ├── v1/                 # API version 1
│       │   │   │   ├── endpoints/      # Route endpoints
│       │   │   │   │   ├── auth.py     # Authentication routes
│       │   │   │   │   ├── users.py    # User management
│       │   │   │   │   ├── programs.py # Program management
│       │   │   │   │   ├── applications.py # Application handling
│       │   │   │   │   └── admin.py    # Admin operations
│       │   │   │   └── api.py          # API router
│       │   │   └── deps.py             # Route dependencies
│       │   ├── core/                   # Core configuration
│       │   │   ├── config.py           # App configuration
│       │   │   ├── security.py         # Security utilities
│       │   │   ├── logging.py          # Logging configuration
│       │   │   └── middleware.py       # Custom middleware
│       │   ├── db/                     # Database configuration
│       │   │   ├── base.py             # Base model class
│       │   │   ├── base.py             # Base model class
│       │   │   ├── session.py          # Database session
│       │   │   ├── init_db.py          # Database initialization
│       │   │   └── migrations/         # Alembic migrations
│       │   ├── models/                 # SQLAlchemy models
│       │   │   ├── __init__.py         # Models package
│       │   │   ├── user.py             # User model
│       │   │   ├── program.py          # Program model
│       │   │   ├── application.py      # Application model
│       │   │   ├── beneficiary.py      # Beneficiary model
│       │   │   └── audit.py            # Audit trail model
│       │   ├── schemas/                # Pydantic schemas
│       │   │   ├── __init__.py         # Schemas package
│       │   │   ├── user.py             # User schemas
│       │   │   ├── program.py          # Program schemas
│       │   │   ├── application.py      # Application schemas
│       │   │   └── common.py           # Common schemas
│       │   ├── services/               # Business logic
│       │   │   ├── __init__.py         # Services package
│       │   │   ├── auth_service.py     # Authentication service
│       │   │   ├── user_service.py     # User management service
│       │   │   ├── program_service.py  # Program management service
│       │   │   ├── notification_service.py # Notification service
│       │   │   └── file_service.py     # File handling service
│       │   ├── utils/                  # Utility functions
│       │   │   ├── __init__.py         # Utils package
│       │   │   ├── helpers.py          # Helper functions
│       │   │   ├── validators.py       # Data validators
│       │   │   └── formatters.py       # Data formatters
│       │   ├── tests/                  # Test files
│       │   │   ├── __init__.py         # Tests package
│       │   │   ├── conftest.py         # Test configuration
│       │   │   ├── test_auth.py        # Authentication tests
│       │   │   ├── test_users.py       # User tests
│       │   │   └── test_programs.py    # Program tests
│       │   └── main.py                 # FastAPI application entry
│       ├── requirements.txt            # Python dependencies
│       ├── Dockerfile                  # Docker configuration
│       ├── alembic.ini                 # Alembic configuration
│       └── pytest.ini                  # Pytest configuration

## Development Phases

### Phase 1: Foundation Setup (Weeks 1-2)
- Project initialization and repository setup
- Development environment configuration
- Database schema design and implementation
- Basic authentication system setup

### Phase 2: Core Backend Development (Weeks 3-6)
- API endpoints implementation
- Database models and relationships
- Authentication and authorization
- Basic CRUD operations for all modules

### Phase 3: Frontend Development (Weeks 7-10)
- Web application UI/UX implementation
- Mobile application development
- State management integration
- Form handling and validation

### Phase 4: Integration & Testing (Weeks 11-12)
- Frontend-backend integration
- End-to-end testing
- Performance optimization
- Security testing and hardening

### Phase 5: Deployment & Launch (Weeks 13-14)
- Production environment setup
- CI/CD pipeline implementation
- User acceptance testing
- Go-live and monitoring setup

## Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Python 3.11+
- PostgreSQL 15+
- Redis 7+
- Docker and Docker Compose

### Quick Start
1. Clone the repository
2. Set up environment variables
3. Run `docker-compose up -d` for local development
4. Access the web application at `http://localhost:3000`
5. Access the API documentation at `http://localhost:8000/docs`

---

*This documentation is maintained by the MSWD Rizal Palawan development team. Last updated: 2024-01-01*