#!/bin/bash

# MSWD Livelihood Railway Deployment Script
# This script helps deploy your FastAPI changes to Railway

echo "🚀 MSWD Livelihood Railway Deployment"
echo "======================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Error: Git repository not found. Please initialize git first."
    exit 1
fi

echo "📋 Current Railway FastAPI Domain: fastapi-production-9cc0.up.railway.app"
echo ""

# Show current git status
echo "📊 Git Status:"
git status --short

echo ""
echo "🔄 Preparing deployment..."

# Add all changes
echo "📦 Adding changes to git..."
git add .

# Commit changes
echo "💾 Committing changes..."
read -p "Enter commit message (or press Enter for default): " commit_msg
if [ -z "$commit_msg" ]; then
    commit_msg="Update FastAPI configuration for Railway deployment"
fi

git commit -m "$commit_msg"

# Push to main branch (Railway will auto-deploy)
echo "🚀 Pushing to main branch..."
git push origin main

echo ""
echo "✅ Deployment initiated!"
echo ""
echo "📝 Next Steps:"
echo "1. Check Railway dashboard for deployment status"
echo "2. Monitor logs: railway logs --service=your-fastapi-service"
echo "3. Test endpoints after deployment completes"
echo "4. Update frontend environment variables if needed"
echo ""
echo "🔗 Your FastAPI will be available at:"
echo "   https://fastapi-production-9cc0.up.railway.app"
echo ""
echo "🧪 Test endpoints:"
echo "   Health: https://fastapi-production-9cc0.up.railway.app/health"
echo "   API v1: https://fastapi-production-9cc0.up.railway.app/api/v1/"
echo "   Docs: https://fastapi-production-9cc0.up.railway.app/docs"