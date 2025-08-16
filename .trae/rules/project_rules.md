# PROJECT RULES & DEVELOPMENT STANDARDS

**PROJECT:** MSWD‑Livelihood‑Rizal‑Palawan‑Web‑App  
**VERSION:** 2.1.0  
**UPDATED:** 2024‑12‑19  
**ENFORCEMENT:** STRICT

## 🎯 CORE PRINCIPLES

1. **PRODUCTION READY** - All code must be deployable, tested, and documented
2. **NO PLACEHOLDERS** - Complete implementations only, no TODOs or stubs
3. **TYPE SAFETY** - Full TypeScript/Python typing with strict mode
4. **SECURITY FIRST** - Environment variables, input validation, RBAC
5. **MINIMAL CODE** - Write only essential code that directly solves requirements

## 🔐 AUTHENTICATION & SECURITY

### Firebase Authentication (PRIMARY)
- **Firebase Auth** is the ONLY authentication provider
- **NO GitLab OAuth** - Remove all GitLab auth references
- **JWT Tokens** from Firebase ID tokens only
- **Role-based Access Control** via Firebase custom claims
- **Multi-factor Authentication** enabled in production

### Security Requirements
- Environment variables for all secrets
- Firebase service account via `FIREBASE_SERVICE_ACCOUNT_JSON_BASE64`
- Input validation and sanitization
- File upload restrictions (10MB max, allowed extensions only)
- Rate limiting (60 req/min per IP)
- CORS restricted to known origins
- HTTPS enforcement in production

## 📦 TECH STACK

**Frontend:** React 18 + Vite 5 + TypeScript 5 + Chakra UI 3 + Zustand 4  
**Backend:** FastAPI + SQLAlchemy 2 + Pydantic 2 + PostgreSQL 15  
**Auth:** Firebase Auth + JWT (NO GitLab OAuth)  
**CMS:** Webflow API + Designer Extension  
**Cache:** Redis 7  
**Deploy:** Docker + Railway/Render  
**Tools:** Node 20, Python 3.11, pnpm

## 🗂 PROJECT STRUCTURE

```
MSWD-Livelihood-Rizal-Palawan-Web-App/
├─ apps/
│  ├─ web/                     # React frontend
│  │  ├─ src/
│  │  │  ├─ components/
│  │  │  │  └─ webflow/        # Webflow integration components
│  │  │  ├─ services/
│  │  │  │  ├─ firebase/       # Firebase Auth & services
│  │  │  │  ├─ webflow/        # Webflow API integration
│  │  │  │  └─ api/            # Backend API client
│  │  │  ├─ pages/             # Route components
│  │  │  ├─ hooks/             # Custom React hooks
│  │  │  └─ store/             # Zustand state management
│  │  └─ package.json
│  └─ webflow-extension/       # Webflow Designer Extension
│     ├─ src/index.ts          # Extension logic
│     ├─ public/               # Extension UI
│     └─ webflow.json          # Extension config
├─ services/api/               # FastAPI backend
├─ packages/shared-types/      # Shared TypeScript types
├─ .github/workflows/          # CI/CD pipelines
├─ docker-compose.yml          # Development environment
└─ .env.example               # Environment template
```

## 🔥 FIREBASE INTEGRATION REQUIREMENTS

### Authentication Flow
1. **Frontend:** Firebase Web SDK for auth UI
2. **Backend:** Verify Firebase ID tokens via Admin SDK
3. **Custom Claims:** Store user roles (admin, superadmin, beneficiary)
4. **Protected Routes:** React Router guards based on auth state
5. **API Security:** All endpoints validate Firebase tokens

### Required Firebase Services
- **Authentication:** Email/password, phone verification
- **Firestore:** User profiles, audit logs
- **Storage:** File uploads with security rules
- **Cloud Messaging:** Push notifications
- **Functions:** Custom claims management (optional)

### Environment Variables
```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=project-id
VITE_FIREBASE_STORAGE_BUCKET=project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=sender-id
VITE_FIREBASE_APP_ID=app-id
FIREBASE_SERVICE_ACCOUNT_JSON_BASE64=base64-encoded-service-account
```

## 🌐 WEBFLOW INTEGRATION REQUIREMENTS

### API Integration
- **Webflow API Client:** Full TypeScript integration
- **React Hooks:** useWebflowSites, useWebflowCollections, useWebflowItems
- **CMS Management:** CRUD operations for beneficiary data
- **Site Publishing:** Automated deployment triggers

### Designer Extension
- **MSWD Components:** Custom UI for beneficiary management
- **Form Integration:** Direct data entry from Webflow Designer
- **Style Management:** Consistent MSWD branding
- **Permissions:** sites:read, sites:write, cms:read, cms:write

### Environment Variables
```bash
VITE_WEBFLOW_ACCESS_TOKEN=your-webflow-token
VITE_WEBFLOW_SITE_ID=your-site-id
```

## ✅ IMPLEMENTATION REQUIREMENTS

### Frontend (React + Chakra UI 3)
- **Auth Pages:** Login/register with Firebase Auth UI
- **Protected Routes:** Role-based access control
- **Dashboards:** Admin, Superadmin, Beneficiary views
- **Webflow Integration:** Site management, content publishing
- **Real-time Updates:** Firebase listeners for live data
- **Offline Support:** Service worker for PWA capabilities

### Backend (FastAPI)
- **Firebase Admin SDK:** Token verification middleware
- **User Management:** Sync with Firebase Auth
- **CRUD APIs:** Programs, applications, beneficiaries
- **File Upload:** Firebase Storage integration
- **Notifications:** FCM push notifications
- **Audit Logging:** All user actions tracked

### Webflow Extension
- **Beneficiary Forms:** Data entry UI in Designer
- **Component Library:** Reusable MSWD components
- **Publishing Workflow:** Automated site updates
- **Data Sync:** Two-way sync with main application

## 🔧 QUALITY STANDARDS

- **Linting:** ESLint, Prettier, Ruff clean
- **Types:** Strict TypeScript/mypy
- **Tests:** ≥80% coverage (Vitest + pytest)
- **API:** OpenAPI docs at `/docs`
- **Health:** `/healthz` and `/readyz` endpoints
- **Security:** Rate limiting, RBAC, input validation

## 🚀 DEPLOYMENT PIPELINE

1. **Local:** `docker-compose up -d` → Firebase emulators → `npm run dev`
2. **GitHub:** Push triggers CI/CD
3. **Railway:** Auto-deploy from main branch
4. **Firebase:** Deploy rules and functions
5. **Webflow:** Publish extension to Webflow marketplace

## ❌ FORBIDDEN PATTERNS

- **GitLab OAuth** - Use Firebase Auth only
- **Hardcoded secrets** - Environment variables only
- **Placeholder code** - Complete implementations only
- **Mixed auth providers** - Firebase Auth exclusively
- **Committed .env files** - Use .env.example only

## 📋 REQUIRED FILES

### Firebase Integration
- `apps/web/src/services/firebase/config.ts` - Firebase client setup
- `apps/web/src/services/firebase/auth.ts` - Authentication methods
- `services/api/app/core/firebase.py` - Admin SDK initialization
- `firebase.json` - Firebase project configuration
- `firestore.rules` - Database security rules
- `storage.rules` - File storage security rules

### Webflow Integration
- `apps/web/src/services/webflow/client.ts` - API client
- `apps/web/src/services/webflow/hooks.ts` - React Query hooks
- `apps/webflow-extension/src/index.ts` - Extension logic
- `apps/webflow-extension/webflow.json` - Extension config

### Core Application
- `services/api/app/main.py` - FastAPI application
- `services/api/app/api/v1/` - API endpoints
- `.github/workflows/ci.yml` - CI pipeline
- `docker-compose.yml` - Development environment
- `.env.example` - Environment template

## ✅ ACCEPTANCE CRITERIA

- **Authentication:** Firebase Auth works end-to-end
- **Authorization:** Role-based access enforced
- **Webflow:** CMS integration functional
- **Real-time:** Firebase listeners active
- **Security:** All endpoints protected
- **Performance:** <2s page load times
- **Mobile:** Responsive design works
- **Offline:** Basic PWA functionality
- **Tests:** All critical paths covered
- **Documentation:** Complete setup guide

## 🔄 AUTHENTICATION FLOW VERIFICATION

### Frontend Flow
1. User visits protected route
2. Check Firebase auth state
3. Redirect to login if unauthenticated
4. Firebase Auth UI handles login
5. Store user token and custom claims
6. Redirect to intended route

### Backend Flow
1. Extract Bearer token from request
2. Verify token with Firebase Admin SDK
3. Extract user ID and custom claims
4. Authorize based on required permissions
5. Process request or return 403

### Custom Claims Structure
```json
{
  "role": "admin|superadmin|beneficiary",
  "barangay": "barangay-name",
  "permissions": ["read:programs", "write:applications"]
}
```

---

# CI/CD PIPELINE RULES

## Triggers
- All pushes and PRs run full CI
- Tags `v*` trigger release pipeline
- Manual runs allowed

## Required Jobs
1. **Setup:** Node 20.x, Python 3.11, pnpm 9
2. **Lint:** ESLint, Prettier, Ruff
3. **Type Check:** TypeScript strict mode, mypy
4. **Test:** Vitest (web ≥70%), pytest (api ≥80%)
5. **Build:** Vite build, Docker images
6. **Security:** npm audit, pip-audit
7. **Firebase:** Deploy rules and functions
8. **Webflow:** Build and validate extension

## Quality Gates
- All tests pass
- Coverage thresholds met
- No linting errors
- Security scans clean
- Firebase rules validate
- Webflow extension builds

## Deployment Gates
- All CI checks green
- Firebase emulator tests pass
- Health checks return 200
- Manual approval for production