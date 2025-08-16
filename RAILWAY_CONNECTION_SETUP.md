# Railway FastAPI Connection Setup

## ✅ Configuration Complete

Your MSWD Livelihood Web App has been configured to connect to your Railway-deployed FastAPI.

### 🔗 Railway FastAPI Domain
```
https://fastapi-production-9cc0.up.railway.app
```

### 📝 Changes Made

#### 1. Environment Configuration
- Updated `.env` file with Railway API URL
- Created `.env.production` for production deployment
- Added CORS configuration for Railway domain

#### 2. API Client Configuration
- Updated `apps/web/src/services/api/client.ts` to handle production/development environments
- Added automatic fallback to Railway URL in production

#### 3. FastAPI Endpoints Added
- Added `/health` endpoint for Railway health checks
- Added root `/` endpoint with API information
- Added `/api/v1/` endpoint with available routes

#### 4. Railway Configuration
- Updated `railway.toml` with correct environment variables
- Configured frontend service to use Railway FastAPI

### 🚀 Deployment Steps

1. **Deploy FastAPI Changes**:
   ```bash
   ./deploy-to-railway.sh
   ```

2. **Test Connection**:
   ```bash
   node test-railway-connection.js
   ```

3. **Start Development Server**:
   ```bash
   cd apps/web
   npm run dev
   ```

### 🧪 Test Endpoints

After deployment, test these endpoints:

- **Health Check**: https://fastapi-production-9cc0.up.railway.app/health
- **API Root**: https://fastapi-production-9cc0.up.railway.app/
- **API v1**: https://fastapi-production-9cc0.up.railway.app/api/v1/
- **Documentation**: https://fastapi-production-9cc0.up.railway.app/docs

### 🔧 Environment Variables

#### Development (.env)
```bash
VITE_API_BASE=https://fastapi-production-9cc0.up.railway.app/api/v1
```

#### Production (.env.production)
```bash
VITE_API_BASE=https://fastapi-production-9cc0.up.railway.app/api/v1
NODE_ENV=production
```

### 📊 Railway Variables

Make sure these are set in your Railway project:

```bash
RAILWAY_PUBLIC_DOMAIN=fastapi-production-9cc0.up.railway.app
RAILWAY_PRIVATE_DOMAIN=your-private-domain
RAILWAY_PROJECT_NAME=your-project-name
RAILWAY_ENVIRONMENT_NAME=production
RAILWAY_SERVICE_NAME=your-service-name
RAILWAY_PROJECT_ID=your-project-id
RAILWAY_ENVIRONMENT_ID=your-environment-id
RAILWAY_SERVICE_ID=your-service-id
```

### 🔄 Auto-Deployment

Your FastAPI will auto-deploy when you push to the main branch:

```bash
git add .
git commit -m "Update FastAPI configuration"
git push origin main
```

### 🐛 Troubleshooting

If you encounter issues:

1. **Check Railway Logs**:
   ```bash
   railway logs --service=your-fastapi-service
   ```

2. **Verify Environment Variables**:
   - Check Railway dashboard for correct environment variables
   - Ensure CORS origins include your frontend domain

3. **Test Local Connection**:
   ```bash
   curl https://fastapi-production-9cc0.up.railway.app/health
   ```

4. **Check Firebase Configuration**:
   - Verify Firebase credentials are correctly set
   - Ensure Firebase project is properly configured

### 📞 Support

If you need help:
- Check Railway dashboard for deployment status
- Review FastAPI logs for any errors
- Test endpoints individually to isolate issues

---

**Status**: ✅ Ready for deployment
**Last Updated**: January 2025