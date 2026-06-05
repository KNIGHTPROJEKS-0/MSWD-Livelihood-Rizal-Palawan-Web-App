# MSWD Livelihood Rizal Palawan Web App

A digital platform for the Municipal Social Welfare and Development Office (MSWD) of Rizal, Palawan to manage livelihood programs and beneficiaries.

## Architecture

- **Frontend**: React + Vite + TypeScript + Chakra UI (`apps/web/`, port 5000)
- **Backend**: FastAPI + SQLAlchemy + PostgreSQL (`services/api/`, port 8000)
- **Database**: Replit PostgreSQL (connection via `DATABASE_URL` env var)
- **Auth**: JWT tokens (no Firebase dependency)

## Running the App

Two workflows run simultaneously:
1. **Start application** — frontend at port 5000 (`cd apps/web && pnpm dev`)
2. **Backend API** — FastAPI at port 8000 (`cd services/api && python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload`)

The frontend proxies `/api` requests to port 8000 via Vite's proxy config.

## Default Accounts

| Role       | Email                  | Password        |
|------------|------------------------|-----------------|
| Superadmin | admin@mswd.gov.ph      | Admin@MSWD2024  |

New users register as **Beneficiary** by default. Superadmin can promote to Admin or Superadmin.

## User Roles

- **Superadmin**: Full access — manage users, programs, applications, view all reports
- **Admin**: Manage programs, review/approve/reject applications
- **Beneficiary**: Browse programs, submit applications, track status

## Key Pages

- `/` — Public homepage with programs overview
- `/login` — JWT-based login
- `/register` — Register as beneficiary (with barangay selection)
- `/dashboard` — Role-based dashboard (auto-detects role)
- `/dashboard/programs` — Programs management/browsing
- `/dashboard/applications` — Applications management
- `/dashboard/users` — User management (admin/superadmin only)

## User Preferences

- Keep Firebase removed — using JWT auth only
- Use pnpm for frontend package management
- Backend uses sync SQLAlchemy (not async) for simplicity
