# 🚀 MSWD Development Guide

## 📋 Prerequisites

### Required Software
- **Node.js 18+**: JavaScript runtime
- **Python 3.11+**: Backend development
- **PostgreSQL 15+**: Primary database
- **Redis 7+**: Caching and sessions
- **Docker & Docker Compose**: Containerization
- **Git**: Version control

### Package Managers
```bash
# Install pnpm (recommended)
npm install -g pnpm

# Verify installations
node --version
python --version
pnpm --version
git --version
docker --version
```

### Development Tools (Recommended)
- **VS Code** with extensions:
  - TypeScript and JavaScript Language Features
  - ES7+ React/Redux/React-Native snippets
  - Prettier - Code formatter
  - ESLint
  - Python
  - Docker

## 🛠️ Project Setup

### 1. Clone and Install
```bash
# Clone repository
git clone https://github.com/KNIGHTPROJEKS-0/MSWD-Livelihood-Rizal-Palawan-Web-App.git
cd MSWD-Livelihood-Rizal-Palawan-Web-App

# Install all dependencies
pnpm install

# Install web app dependencies
cd apps/web && pnpm install && cd ../..

# Install API dependencies
cd services/api && pip install -r requirements.txt && cd ../..
```

### 2. Environment Configuration
```bash
# Copy environment template
cp .env.template .env

# Edit .env file with your configuration
# Required variables:
# - DATABASE_URL
# - REDIS_URL
# - FIREBASE_* variables
# - SECRET_KEY
```

### 3. Database Setup
```bash
# Start PostgreSQL and Redis
docker compose up -d postgres redis

# Run database migrations
cd services/api
alembic upgrade head
cd ../..
```

### 4. Firebase Setup
```bash
# Firebase is already configured in:
# - apps/web/src/services/firebase/config.ts
# - apps/web/src/services/firebase/auth.ts

# Update .env with your Firebase credentials:
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

## 🏃‍♂️ Running the Application

### Quick Start (Recommended)
```bash
# Start all services with one command
./start-dev.sh
```

### Manual Start
```bash
# Terminal 1: Start databases
docker compose up -d postgres redis

# Terminal 2: Start API server
cd services/api
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 3: Start web application
cd apps/web
pnpm run dev
```

### Access Points
- **Web App**: http://localhost:3000
- **API Docs**: http://localhost:8000/docs
- **API Health**: http://localhost:8000/health

## 📁 Project Structure

### Frontend (apps/web/)
```
src/
├── components/          # Reusable UI components
│   ├── common/         # Shared components
│   ├── forms/          # Form components
│   ├── layout/         # Layout components
│   ├── ui/             # Base UI components
│   └── webflow/        # Webflow integration
├── pages/              # Route components
│   ├── auth/           # Authentication pages
│   ├── dashboard/      # Dashboard pages
│   ├── programs/       # Program pages
│   └── profile/        # Profile pages
├── services/           # API and external services
│   ├── api/            # Backend API client
│   ├── firebase/       # Firebase services
│   ├── webflow/        # Webflow integration
│   └── types/          # Type definitions
├── store/              # State management
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── theme/              # Chakra UI theme
└── types/              # TypeScript definitions
```

### Backend (services/api/)
```
app/
├── api/v1/endpoints/   # API route handlers
│   ├── auth.py         # Authentication
│   ├── users.py        # User management
│   ├── programs.py     # Program management
│   ├── applications.py # Applications
│   ├── admin.py        # Admin operations
│   └── oauth.py        # OAuth integration
├── core/               # Core configuration
├── db/                 # Database configuration
├── models/             # SQLAlchemy models
├── schemas/            # Pydantic schemas
├── services/           # Business logic
├── utils/              # Utility functions
├── tests/              # Test files
└── main.py             # FastAPI entry point
```

## 🔧 Development Commands

### Root Level Commands
```bash
pnpm install              # Install all dependencies
pnpm run dev:web          # Start web development server
pnpm run dev:api          # Start API development server
pnpm run build:web        # Build web application
pnpm run test             # Run all tests
pnpm run lint             # Run linting
pnpm run format           # Format code
pnpm run type-check       # TypeScript checking
```

### Web App Commands (apps/web/)
```bash
pnpm run dev              # Development server
pnpm run build            # Production build
pnpm run preview          # Preview build
pnpm run test             # Run tests
pnpm run test:watch       # Watch mode tests
pnpm run lint             # ESLint
pnpm run type-check       # TypeScript check
```

### API Commands (services/api/)
```bash
uvicorn app.main:app --reload    # Development server
pytest                           # Run tests
pytest --cov                     # Tests with coverage
alembic revision --autogenerate  # Create migration
alembic upgrade head             # Apply migrations
alembic downgrade -1             # Rollback migration
```

## 🧪 Testing

### Frontend Testing
```bash
cd apps/web

# Run all tests
pnpm run test

# Watch mode
pnpm run test:watch

# Coverage report
pnpm run test:coverage

# E2E tests
pnpm run test:e2e
```

### Backend Testing
```bash
cd services/api

# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_auth.py

# Run with verbose output
pytest -v
```

### Test Structure
- **Unit Tests**: Individual components/functions
- **Integration Tests**: API endpoints and database
- **E2E Tests**: Complete user workflows
- **Performance Tests**: Load and stress testing

## 🔍 Debugging

### Frontend Debugging
```bash
# Browser DevTools
# - F12 or right-click → Inspect
# - React DevTools extension
# - Redux DevTools extension

# VS Code debugging
# - Set breakpoints in .tsx/.ts files
# - Use "Debug: Start Debugging" (F5)
```

### Backend Debugging
```bash
# Python debugger
import pdb; pdb.set_trace()

# VS Code debugging
# - Set breakpoints in .py files
# - Use "Python: FastAPI" debug configuration

# Logging
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Common Issues
1. **Port conflicts**: Check if ports 3000, 8000, 5432, 6379 are available
2. **Database connection**: Ensure PostgreSQL is running
3. **Environment variables**: Verify .env file configuration
4. **Node modules**: Clear cache with `pnpm store prune`
5. **Python dependencies**: Recreate virtual environment

## 📊 Code Quality

### Linting and Formatting
```bash
# Frontend
cd apps/web
pnpm run lint          # ESLint
pnpm run lint:fix      # Auto-fix issues
pnpm run format        # Prettier

# Backend
cd services/api
black .                # Format Python code
isort .                # Sort imports
flake8 .               # Linting
mypy .                 # Type checking
```

### Pre-commit Hooks
```bash
# Install pre-commit
pip install pre-commit

# Install hooks
pre-commit install

# Run on all files
pre-commit run --all-files
```

### Code Standards
- **TypeScript**: Strict mode enabled
- **Python**: PEP 8 compliance
- **React**: Functional components with hooks
- **API**: RESTful design principles
- **Database**: Normalized schema design

## 🔄 Git Workflow

### Branch Strategy
```bash
# Main branches
main                    # Production-ready code
develop                 # Integration branch

# Feature branches
feature/user-auth       # New features
bugfix/login-issue      # Bug fixes
hotfix/security-patch   # Critical fixes
```

### Commit Convention
```bash
# Format: type(scope): description
feat(auth): add Google OAuth integration
fix(api): resolve database connection issue
docs(readme): update installation instructions
test(auth): add unit tests for login
refactor(ui): improve component structure
```

### Development Workflow
```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Make changes and commit
git add .
git commit -m "feat(feature): add new functionality"

# 3. Push and create PR
git push origin feature/new-feature

# 4. Create Pull Request on GitHub
# 5. Code review and merge
```

## 🚀 Performance Optimization

### Frontend Optimization
- **Code Splitting**: Lazy loading with React.lazy()
- **Bundle Analysis**: `pnpm run build:analyze`
- **Image Optimization**: WebP format, lazy loading
- **Caching**: Service workers, browser caching
- **Tree Shaking**: Remove unused code

### Backend Optimization
- **Database Indexing**: Optimize query performance
- **Caching**: Redis for frequently accessed data
- **Connection Pooling**: Efficient database connections
- **Async Operations**: Non-blocking I/O
- **Query Optimization**: Efficient SQL queries

### Monitoring
```bash
# Frontend performance
# - Lighthouse audits
# - Web Vitals monitoring
# - Bundle size tracking

# Backend performance
# - API response times
# - Database query performance
# - Memory usage monitoring
# - Error rate tracking
```

## 🔐 Security Best Practices

### Frontend Security
- **Input Validation**: Client-side validation
- **XSS Prevention**: Sanitize user input
- **CSRF Protection**: Token-based protection
- **Secure Storage**: Encrypted local storage
- **HTTPS Only**: Force secure connections

### Backend Security
- **Authentication**: JWT with refresh tokens
- **Authorization**: Role-based access control
- **Input Validation**: Pydantic schemas
- **SQL Injection**: Parameterized queries
- **Rate Limiting**: API throttling
- **CORS**: Proper origin configuration

### Environment Security
```bash
# Never commit sensitive data
# Use .env files for secrets
# Rotate API keys regularly
# Use strong passwords
# Enable 2FA on accounts
```

## 📚 Learning Resources

### React & TypeScript
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Chakra UI Components](https://chakra-ui.com/)

### Python & FastAPI
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy Tutorial](https://docs.sqlalchemy.org/en/20/tutorial/)
- [Pydantic Documentation](https://docs.pydantic.dev/)

### Database & DevOps
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/documentation)
- [Docker Documentation](https://docs.docker.com/)

## 🆘 Getting Help

### Internal Resources
- **Code Reviews**: Create PR for feedback
- **Team Chat**: Development team discussions
- **Documentation**: Check existing docs first

### External Resources
- **GitHub Issues**: Report bugs and feature requests
- **Stack Overflow**: Technical questions
- **Community Forums**: Framework-specific help

### Contact
- **Email**: knightprojeks@gmail.com
- **GitHub**: [KNIGHTPROJEKS-0](https://github.com/KNIGHTPROJEKS-0)
- **Issues**: [Project Issues](https://github.com/KNIGHTPROJEKS-0/MSWD-Livelihood-Rizal-Palawan-Web-App/issues)

---

**Last Updated**: January 2025  
**Version**: 1.0.0