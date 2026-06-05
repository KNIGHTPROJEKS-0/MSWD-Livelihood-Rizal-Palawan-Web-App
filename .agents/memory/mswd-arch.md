---
name: MSWD App Architecture
description: Key decisions for the MSWD Livelihood Rizal Palawan web app
---

# MSWD App Architecture Decisions

## Auth
- Firebase was removed (blocked by Replit package firewall — protobufjs dependency)
- JWT-based auth implemented in `services/api/app/routers/auth.py`
- Tokens stored in Zustand persist store (`mswd-auth` key in localStorage)
- Default superadmin: `admin@mswd.gov.ph` / `Admin@MSWD2024`

## Backend
- FastAPI with **sync** SQLAlchemy (not async) — simpler, avoids asyncpg issues
- Entry point: `services/api/main.py` (not `services/api/app/main.py`)
- Models in `services/api/app/models/` — simplified from original (removed Firebase/Enum types)
- Routers in `services/api/app/routers/` (new clean directory, not `app/api/v1/endpoints/`)
- Run: `cd services/api && python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload`

**Why:** The original app used async SQLAlchemy + Firebase Auth — both had dependency issues in Replit.

## Frontend
- Uses `pnpm` (npm install fails silently in this environment)
- Firebase and webflow-api removed from package.json (blocked packages)
- API calls go to `/api` path, proxied by Vite to `http://localhost:8000`
- Run: `cd apps/web && pnpm dev` (port 5000)

**Why:** firebase package pulls in protobufjs which is 403-blocked by Replit's package firewall.

## Database
- Replit PostgreSQL (DATABASE_URL env var auto-set)
- Schema defined via SQLAlchemy models + `Base.metadata.create_all()` at startup
- Programs table needed `is_active` column added manually after initial schema creation
- bcrypt pinned to 4.0.1 (`pip install "bcrypt==4.0.1"`) for passlib 1.7.4 compatibility

**Why:** bcrypt 5.x changed API breaking passlib 1.7.4.

## User Roles
- superadmin: full access (users, programs, applications, stats)
- admin: manage programs, review applications
- beneficiary: browse programs, apply, track applications
