# Railway Deployment Guide

## Current Railway Services
- **Project**: MSWD-Livelihood-Web-App
- **Services Deployed**: Redis, PostgreSQL, FastAPI, N8N

## Setup Steps

### 1. Install Railway CLI
```bash
npm install -g @railway/cli
```

### 2. Login and Link Project
```bash
railway login
railway link
```

### 3. Get Service Connection URLs
```bash
# Get all service variables
railway variables

# Get specific service URLs
railway variables --service postgres
railway variables --service redis
railway variables --service n8n
```

### 4. Update Environment Variables

#### In Railway Dashboard:
1. Go to your FastAPI service
2. Add these environment variables:
   - `DATABASE_URL` → Copy from PostgreSQL service
   - `REDIS_URL` → Copy from Redis service
   - `SECRET_KEY` → Generate secure key
   - `FIREBASE_PRIVATE_KEY` → Your Firebase private key
   - `FIREBASE_CLIENT_EMAIL` → Your Firebase client email

#### For Frontend Service:
   - `VITE_API_BASE` → Your FastAPI service URL + `/api/v1`
   - `VITE_FIREBASE_API_KEY` → Your Firebase API key
   - `VITE_FIREBASE_PROJECT_ID` → Your Firebase project ID

### 5. Deploy Services

#### Option A: Use Deployment Script
```bash
./deploy-railway.sh
```

#### Option B: Manual Deployment
```bash
# Deploy Backend
cd services/api
railway up --service backend

# Deploy Frontend  
cd ../../apps/web
railway up --service frontend
```

### 6. Connect Services

#### Get Service URLs:
```bash
# List all services and their URLs
railway status
```

#### Update CORS Origins:
Add your Railway frontend URL to `BACKEND_CORS_ORIGINS` in your FastAPI service environment variables.

## Environment Variables Mapping

| Local | Railway Variable | Source |
|-------|------------------|---------|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` | PostgreSQL service |
| `REDIS_URL` | `${{Redis.REDIS_URL}}` | Redis service |
| `N8N_WEBHOOK_URL` | `${{N8N.RAILWAY_PUBLIC_DOMAIN}}` | N8N service |
| `PORT` | `${{PORT}}` | Railway auto-assigned |

## Post-Deployment Checklist

- [ ] Verify all services are running
- [ ] Test database connection
- [ ] Test Redis connection  
- [ ] Test API endpoints
- [ ] Test frontend-backend communication
- [ ] Configure custom domains (optional)
- [ ] Set up monitoring and logging

## Troubleshooting

### Common Issues:
1. **Database Connection Failed**: Check `DATABASE_URL` format
2. **CORS Errors**: Update `BACKEND_CORS_ORIGINS` with Railway URLs
3. **Build Failures**: Check service logs in Railway dashboard
4. **Environment Variables**: Ensure all required vars are set

### Useful Commands:
```bash
# View logs
railway logs --service backend
railway logs --service frontend

# Check service status
railway status

# Open Railway dashboard
railway open
```