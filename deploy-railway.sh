#!/bin/bash

# Railway Deployment Script for MSWD Livelihood Web App
set -e

echo "🚀 Deploying MSWD Livelihood Web App to Railway..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Login to Railway (if not already logged in)
echo "🔐 Checking Railway authentication..."
railway login

# Link to existing Railway project
echo "🔗 Linking to Railway project..."
railway link

# Deploy FastAPI Backend
echo "📦 Deploying FastAPI Backend..."
cd services/api
railway up --service backend

# Deploy React Frontend
echo "🌐 Deploying React Frontend..."
cd ../../apps/web
railway up --service frontend

echo "✅ Deployment completed!"
echo "🌍 Your app should be available at your Railway domains"
echo "📊 Check Railway dashboard for service URLs and logs"