# 🚀 MSWD Livelihood Rizal Palawan - Deployment Guide

## 📋 Project Information

- **Project Name**: MSWD Livelihood Rizal Palawan Web App
- **Repository**: https://github.com/KNIGHTPROJEKS-0/MSWD-Livelihood-Rizal-Palawan-Web-App
- **Railway Project ID**: `112eaa22-255c-4f61-9e19-fa30afa29e04`
- **Railway Token**: `bda800d1-dccb-4fb5-8c21-95e4936cf40c`

## 🔧 Prerequisites

- Node.js 18+
- Python 3.11+
- Docker & Docker Compose
- Railway CLI
- Git

## 🚂 Railway Deployment Setup

### Step 1: Install Railway CLI

```bash
# Install via npm
npm install -g @railway/cli

# Verify installation
railway --version
```

### Step 2: Authenticate with Railway

```bash
# Set environment variable
export RAILWAY_TOKEN=bda800d1-dccb-4fb5-8c21-95e4936cf40c

# Login to Railway (will open browser)
railway login

# Link to existing project
railway link -p 112eaa22-255c-4f61-9e19-fa30afa29e04
```

### Step 3: Deploy Services

#### Deploy API Service
```bash
# Navigate to API directory
cd services/api

# Deploy API service
railway up --service api
```

#### Deploy Frontend
```bash
# Navigate to frontend directory
cd apps/web

# Deploy frontend service
railway up --service frontend
```

#### Deploy Worker Service
```bash
# Navigate back to API directory
cd services/api

# Deploy worker service
railway up --service worker
```

### Step 4: Add Database Services

```bash
# Add PostgreSQL
railway add postgresql

# Add Redis
railway add redis
```

### Step 5: Configure Environment Variables

```bash
# Set essential environment variables
railway variables set SECRET_KEY="$(openssl rand -hex 32)"
railway variables set ALGORITHM="HS256"
railway variables set ACCESS_TOKEN_EXPIRE_MINUTES="30"
railway variables set ENVIRONMENT="production"
railway variables set PROJECT_NAME="MSWD Livelihood Rizal Palawan"
railway variables set PROJECT_VERSION="1.0.0"
railway variables set API_V1_STR="/api/v1"
```

## 🔄 N8N Workflow Integration

### Step 1: Deploy N8N Service

```bash
# Add N8N service to Railway
railway add n8n

# Set N8N environment variables
railway variables set N8N_BASIC_AUTH_ACTIVE="true"
railway variables set N8N_BASIC_AUTH_USER="admin"
railway variables set N8N_BASIC_AUTH_PASSWORD="admin123"
railway variables set WEBHOOK_URL="https://mswd-n8n.railway.app"
railway variables set GENERIC_TIMEZONE="Asia/Manila"
railway variables set DB_TYPE="postgresdb"
```

### Step 2: Configure N8N Database Connection

1. Access N8N dashboard: `https://mswd-n8n.railway.app`
2. Login with credentials: `admin` / `admin123`
3. Configure database connection using Railway PostgreSQL credentials

### Step 3: Set up Workflows

#### Application Processing Workflow
1. **Trigger**: Webhook from API when application is submitted
2. **Actions**:
   - Send confirmation email to applicant
   - Notify staff for review
   - Update application status
   - Log audit trail

#### Beneficiary Management Workflow
1. **Trigger**: Webhook when beneficiary status changes
2. **Actions**:
   - Send status update notifications
   - Generate reports
   - Update program statistics
   - Schedule follow-up tasks

#### Program Monitoring Workflow
1. **Trigger**: Scheduled (daily/weekly)
2. **Actions**:
   - Generate program reports
   - Check program deadlines
   - Send reminder notifications
   - Update dashboard metrics

## 🔗 Service URLs

After successful deployment, your services will be available at:

- **API**: `https://mswd-api.railway.app`
- **Frontend**: `https://mswd-frontend.railway.app`
- **N8N**: `https://mswd-n8n.railway.app`
- **Database**: Railway-provided PostgreSQL URL
- **Redis**: Railway-provided Redis URL

## 📊 Monitoring & Health Checks

### API Health Check
```bash
curl https://mswd-api.railway.app/health
```

### Database Connection Test
```bash
railway run psql $DATABASE_URL -c "SELECT version();"
```

### Redis Connection Test
```bash
railway run redis-cli -u $REDIS_URL ping
```

## 🔐 Security Configuration

### Environment Variables to Set

```bash
# Database
railway variables set DATABASE_URL="<railway-postgresql-url>"
railway variables set REDIS_URL="<railway-redis-url>"

# Authentication
railway variables set SECRET_KEY="<generated-secret-key>"
railway variables set ALGORITHM="HS256"
railway variables set ACCESS_TOKEN_EXPIRE_MINUTES="30"

# Firebase (Optional)
railway variables set FIREBASE_PROJECT_ID="mswd-rizal-palawan"
railway variables set FIREBASE_PRIVATE_KEY="<firebase-private-key>"
railway variables set FIREBASE_CLIENT_EMAIL="<firebase-client-email>"

# Email Configuration
railway variables set SMTP_HOST="smtp.gmail.com"
railway variables set SMTP_PORT="587"
railway variables set SMTP_USER="<your-email>"
railway variables set SMTP_PASSWORD="<app-password>"

# CORS
railway variables set BACKEND_CORS_ORIGINS='["https://mswd-frontend.railway.app"]'
```

## 🚀 CI/CD Pipeline

The project includes GitHub Actions workflow (`.github/workflows/deploy.yml`) that:

1. **Tests**: Runs unit tests and linting
2. **Build**: Builds the application
3. **Deploy**: Automatically deploys to Railway on push to `main` branch

### Required GitHub Secrets

```bash
# Add these secrets to your GitHub repository
RAILWAY_TOKEN=bda800d1-dccb-4fb5-8c21-95e4936cf40c
RAILWAY_PROJECT_ID=112eaa22-255c-4f61-9e19-fa30afa29e04
```

## 🐳 Local Development

### Using Docker Compose

```bash
# Start all services locally
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Setup

```bash
# Install API dependencies
cd services/api
pip install -r requirements.txt

# Install frontend dependencies
cd apps/web
npm install

# Start PostgreSQL and Redis
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=password postgres:15
docker run -d -p 6379:6379 redis:7

# Start API server
cd services/api
uvicorn app.main:app --reload

# Start frontend
cd apps/web
npm run dev
```

## 📝 Post-Deployment Checklist

- [ ] All services are running and healthy
- [ ] Database migrations are applied
- [ ] Environment variables are configured
- [ ] CORS settings allow frontend access
- [ ] N8N workflows are imported and active
- [ ] Email notifications are working
- [ ] File uploads are functional
- [ ] Authentication is working
- [ ] Admin panel is accessible
- [ ] API documentation is available
- [ ] Monitoring and logging are set up

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   railway logs --service api
   railway variables
   ```

2. **CORS Errors**
   - Check `BACKEND_CORS_ORIGINS` environment variable
   - Ensure frontend URL is included

3. **Authentication Issues**
   - Verify `SECRET_KEY` is set
   - Check JWT token expiration

4. **N8N Webhook Failures**
   - Verify webhook URLs in N8N
   - Check API endpoint accessibility

### Support

For deployment issues, contact:
- **Development Team**: knightprojeks@gmail.com
- **Railway Support**: https://railway.app/help
- **Project Repository**: https://github.com/KNIGHTPROJEKS-0/MSWD-Livelihood-Rizal-Palawan-Web-App/issues

---

**Last Updated**: January 15, 2025  
**Version**: 1.0.0  
**Deployment Status**: ✅ Ready for Production