# MSWD Livelihood Rizal Palawan Web Application

## 📋 Project Overview

**Name**: MSWD-Livelihood-Rizal-Palawan-Web-App  
**Version**: 1.0.0  
**Status**: Active Development  
**Repository**: https://github.com/KNIGHTPROJEKS-0/MSWD-Livelihood-Rizal-Palawan-Web-App

A comprehensive digital platform for the Municipal Social Welfare and Development Office (MSWD) of Rizal, Palawan, designed to modernize and streamline social welfare program management across 11 barangays.

## 🎯 Key Objectives

- **Digital Transformation**: Transition from manual to automated MSWD operations
- **Enhanced Service Delivery**: Faster processing and real-time updates for beneficiaries
- **Data-Driven Insights**: Analytics and reporting for informed decision-making
- **Accessibility**: Multi-platform support (web and mobile) with inclusive design

## 👥 User Ecosystem

| Role                   | Responsibilities                                                  |
| ---------------------- | ----------------------------------------------------------------- |
| **Superadmin**         | System configuration, user management, comprehensive analytics    |
| **Admin (MSWD Staff)** | Program oversight, application processing, beneficiary management |
| **Beneficiary**        | Self-service registration, program applications, status tracking  |

## 🏛️ Service Portfolio

### Core Services
- **Livelihood Programs**: Financial assistance, skills training, business development
- **Child & Youth Services**: Daycare, development programs, protection services
- **Family Support**: Counseling, solo parent assistance, victim support
- **Social Pension**: Senior citizen and PWD support programs
- **Emergency Response**: Crisis intervention and disaster relief coordination

## 🏗️ Technical Architecture

### Technology Stack
- **Frontend**: React 18 + Vite + TypeScript + Chakra UI (Web), Expo React Native (Mobile)
- **Backend**: FastAPI (Python 3.11+) + PostgreSQL 15+ + Redis 7+
- **Authentication**: Firebase Auth + JWT
- **Storage**: Firebase Storage
- **Deployment**: Railway, Render, Platform.sh
- **DevOps**: Docker, GitHub Actions, n8n Workflows

### Project Structure
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
│   │   │   │   ├── ui/                 # Base UI components
│   │   │   │   └── webflow/            # Webflow integration
│   │   │   ├── pages/                  # Route page components
│   │   │   │   ├── auth/               # Authentication pages
│   │   │   │   ├── dashboard/          # Dashboard pages
│   │   │   │   ├── programs/           # Program-specific pages
│   │   │   │   └── profile/            # User profile pages
│   │   │   ├── services/               # API clients & Firebase
│   │   │   │   ├── api/                # Backend API client
│   │   │   │   ├── firebase/           # Firebase services
│   │   │   │   ├── webflow/            # Webflow API integration
│   │   │   │   └── types/              # Service type definitions
│   │   │   ├── store/                  # State management (Zustand/Redux)
│   │   │   ├── hooks/                  # Custom React hooks
│   │   │   ├── lib/                    # Utility functions
│   │   │   ├── theme/                  # Chakra UI theme
│   │   │   ├── types/                  # TypeScript definitions
│   │   │   ├── App.tsx                 # Root component
│   │   │   └── main.tsx                # Application entry point
│   │   ├── vite.config.ts              # Vite configuration
│   │   ├── tsconfig.json               # TypeScript config
│   │   └── package.json                # Dependencies
│   │
│   ├── mobile/                         # React Native Mobile App
│   │   ├── src/
│   │   │   ├── components/             # Mobile UI components
│   │   │   ├── screens/                # Screen components
│   │   │   ├── navigation/             # Navigation configuration
│   │   │   ├── services/               # API & Firebase services
│   │   │   └── types/                  # Type definitions
│   │   ├── app.json                    # Expo configuration
│   │   └── package.json                # Dependencies
│   │
│   └── webflow-extension/              # Webflow Designer Extension
│       ├── src/index.ts                # Extension logic
│       ├── public/                     # Extension UI
│       ├── webflow.json                # Extension config
│       └── package.json                # Dependencies
│
├── services/                           # Backend Services
│   └── api/                            # FastAPI Backend
│       ├── app/
│       │   ├── api/v1/endpoints/       # API route handlers
│       │   │   ├── auth.py             # Authentication routes
│       │   │   ├── users.py            # User management
│       │   │   ├── programs.py         # Program management
│       │   │   ├── applications.py     # Application handling
│       │   │   ├── admin.py            # Admin operations
│       │   │   └── oauth.py            # OAuth integration
│       │   ├── core/                   # Core configuration
│       │   ├── db/                     # Database configuration
│       │   ├── models/                 # SQLAlchemy models
│       │   ├── schemas/                # Pydantic schemas
│       │   ├── services/               # Business logic
│       │   ├── utils/                  # Utility functions
│       │   ├── tests/                  # Test files
│       │   └── main.py                 # FastAPI application entry
│       ├── requirements.txt            # Python dependencies
│       ├── Dockerfile                  # Docker configuration
│       └── alembic.ini                 # Database migrations
│
├── packages/                           # Shared Packages
│   ├── shared-types/                   # Shared TypeScript types
│   └── utils/                          # Shared utilities
│
├── infra/                              # Infrastructure Configuration
│   ├── docker-compose.yml              # Development environment
│   ├── railway.json                    # Railway deployment config
│   └── render.yaml                     # Render deployment config
│
├── .env.template                       # Environment template
├── .env.railway                        # Railway environment template
├── start-dev.sh                        # Development startup script
├── deploy-railway.sh                   # Railway deployment script
└── package.json                        # Root package scripts
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose

### Development Setup
```bash
# Clone repository
git clone https://github.com/KNIGHTPROJEKS-0/MSWD-Livelihood-Rizal-Palawan-Web-App.git
cd MSWD-Livelihood-Rizal-Palawan-Web-App

# Install dependencies
pnpm install

# Configure environment
cp .env.template .env
# Edit .env with your configuration

# Start development environment
./start-dev.sh

# Or manually:
docker compose up -d  # Start PostgreSQL & Redis
cd apps/web && pnpm run dev  # Start web app
```

### Access Points
- **Web Application**: http://localhost:3000
- **API Documentation**: http://localhost:8000/docs
- **API Health Check**: http://localhost:8000/health

## 🔧 Development Scripts

```bash
# Root level commands
pnpm install              # Install all dependencies
pnpm run dev:web          # Start web development server
pnpm run dev:api          # Start API development server
pnpm run build:web        # Build web application
pnpm run test             # Run all tests
pnpm run lint             # Run linting
pnpm run format           # Format code

# Web app specific (apps/web/)
pnpm run dev              # Start development server
pnpm run build            # Build for production
pnpm run preview          # Preview production build
pnpm run type-check       # TypeScript type checking

# API specific (services/api/)
uvicorn app.main:app --reload  # Start API server
pytest                    # Run API tests
alembic upgrade head      # Run database migrations
```

## 🔐 Security & Authentication

### Firebase Configuration
- **Authentication**: Email/Password, Google Sign-in
- **Database**: Firestore for real-time data
- **Storage**: Firebase Storage for file uploads
- **Messaging**: FCM for push notifications

### Security Features
- JWT token-based authentication
- Role-based access control (RBAC)
- API rate limiting
- CORS protection
- Input validation and sanitization
- Audit logging for all operations

## 🚢 Deployment

### Railway Deployment (Recommended)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy to Railway
./deploy-railway.sh
```

### Alternative Deployments
- **Render**: Automated via `infra/render.yaml`
- **Platform.sh**: Configuration in `infra/platform.app.yaml`
- **Docker**: Use provided Dockerfiles

### Environment Variables
Key environment variables needed:
```bash
# Database
DATABASE_URL=postgresql://user:pass@host:port/db
REDIS_URL=redis://host:port

# Firebase
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-domain
VITE_FIREBASE_PROJECT_ID=your-project-id

# API
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

## 🧪 Testing

### Running Tests
```bash
# Frontend tests
cd apps/web
pnpm run test

# Backend tests
cd services/api
pytest

# E2E tests
pnpm run test:e2e
```

### Test Coverage
- Unit tests for components and services
- Integration tests for API endpoints
- E2E tests for critical user flows
- Performance testing for scalability

## 📊 Monitoring & Analytics

### Health Monitoring
- API health checks at `/health`
- Database connection monitoring
- Redis cache performance tracking
- Error logging and alerting

### Analytics Dashboard
- User engagement metrics
- Program application statistics
- System performance monitoring
- Audit trail reporting

## 🔄 Workflow Automation (n8n)

### Automated Workflows
- **Application Processing**: Auto-notifications and status updates
- **Beneficiary Management**: Status change notifications and reporting
- **Program Monitoring**: Scheduled reports and deadline reminders
- **Data Synchronization**: Cross-system data consistency

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Use conventional commit messages
- Update documentation as needed

## 📚 Documentation

- **Development Guide**: [DEVELOPMENT.md](DEVELOPMENT.md)
- **Deployment Guide**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **Production Guide**: [PRODUCTION.md](PRODUCTION.md)
- **API Documentation**: Available at `/docs` endpoint
- **Railway Setup**: [RAILWAY_SETUP.md](RAILWAY_SETUP.md)

## 🐛 Troubleshooting

### Common Issues
1. **Database Connection**: Check DATABASE_URL and ensure PostgreSQL is running
2. **Firebase Auth**: Verify Firebase configuration and API keys
3. **CORS Errors**: Check BACKEND_CORS_ORIGINS environment variable
4. **Build Failures**: Clear node_modules and reinstall dependencies

### Getting Help
- Check existing [GitHub Issues](https://github.com/KNIGHTPROJEKS-0/MSWD-Livelihood-Rizal-Palawan-Web-App/issues)
- Create new issue with detailed description
- Contact development team: knightprojeks@gmail.com

## 📈 Roadmap

### Phase 1: Foundation (Completed)
- ✅ Project setup and architecture
- ✅ Authentication system
- ✅ Basic CRUD operations
- ✅ Database schema design

### Phase 2: Core Features (In Progress)
- 🔄 Program management system
- 🔄 Application processing workflow
- 🔄 Beneficiary dashboard
- 🔄 Admin panel

### Phase 3: Advanced Features (Planned)
- 📱 Mobile application
- 🤖 AI-powered analytics
- 🔗 Blockchain integration
- 📊 Advanced reporting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact & Support

- **Email**: knightprojeks@gmail.com
- **GitHub**: [KNIGHTPROJEKS-0](https://github.com/KNIGHTPROJEKS-0)
- **Project Issues**: [GitHub Issues](https://github.com/KNIGHTPROJEKS-0/MSWD-Livelihood-Rizal-Palawan-Web-App/issues)

---

*This platform represents a significant step toward modernizing social welfare services in Rizal, Palawan, ensuring efficient, transparent, and accessible support for community members.*

**Last Updated**: January 2025  
**Deployment Status**: ✅ Ready for Production