#!/bin/bash

# MSWD Livelihood Rizal Palawan - Deployment Script
# This script handles Git operations and Railway deployment

set -e  # Exit on any error

echo "🚀 MSWD Livelihood Rizal Palawan - Deployment Script"
echo "================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
RAILWAY_TOKEN="bda800d1-dccb-4fb5-8c21-95e4936cf40c"
RAILWAY_PROJECT_ID="112eaa22-255c-4f61-9e19-fa30afa29e04"
GIT_REMOTE_URL="https://github.com/ORDEROFCODE/MSWD-Livelihood-Rizal-Palawan-Web-App.git"

echo -e "${BLUE}📋 Project Configuration:${NC}"
echo "   Railway Project ID: $RAILWAY_PROJECT_ID"
echo "   Git Remote URL: $GIT_REMOTE_URL"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to install Railway CLI
install_railway_cli() {
    echo -e "${YELLOW}📦 Installing Railway CLI...${NC}"
    if command_exists railway; then
        echo -e "${GREEN}✅ Railway CLI already installed${NC}"
    else
        curl -fsSL https://railway.app/install.sh | sh
        export PATH="$HOME/.railway/bin:$PATH"
        echo 'export PATH="$HOME/.railway/bin:$PATH"' >> ~/.bashrc
        echo 'export PATH="$HOME/.railway/bin:$PATH"' >> ~/.zshrc
        echo -e "${GREEN}✅ Railway CLI installed successfully${NC}"
    fi
}

# Function to setup Git repository
setup_git() {
    echo -e "${YELLOW}🔧 Setting up Git repository...${NC}"
    
    # Initialize git if not already initialized
    if [ ! -d ".git" ]; then
        git init
        echo -e "${GREEN}✅ Git repository initialized${NC}"
    else
        echo -e "${GREEN}✅ Git repository already exists${NC}"
    fi
    
    # Configure git user
    git config user.name "MSWD Development Team"
    git config user.email "dev@mswd-rizal.gov.ph"
    echo -e "${GREEN}✅ Git user configured${NC}"
    
    # Add remote origin if not exists
    if ! git remote get-url origin >/dev/null 2>&1; then
        git remote add origin "$GIT_REMOTE_URL"
        echo -e "${GREEN}✅ Git remote origin added${NC}"
    else
        echo -e "${GREEN}✅ Git remote origin already exists${NC}"
    fi
}

# Function to commit and push changes
git_commit_push() {
    echo -e "${YELLOW}📝 Committing and pushing changes...${NC}"
    
    # Add all files
    git add .
    echo -e "${GREEN}✅ Files added to staging${NC}"
    
    # Check if there are changes to commit
    if git diff --staged --quiet; then
        echo -e "${YELLOW}⚠️  No changes to commit${NC}"
    else
        # Commit changes
        git commit -m "feat: Initial MSWD Livelihood project setup with Railway integration
        
        - Added complete FastAPI backend structure
        - Implemented user, program, application, and beneficiary management
        - Added authentication and authorization
        - Configured Railway deployment
        - Added Docker and docker-compose setup
        - Implemented N8N workflow integration
        - Added comprehensive testing and CI/CD pipeline"
        echo -e "${GREEN}✅ Changes committed${NC}"
    fi
    
    # Push to remote
    git push -u origin main
    echo -e "${GREEN}✅ Changes pushed to GitHub${NC}"
}

# Function to setup Railway
setup_railway() {
    echo -e "${YELLOW}🚂 Setting up Railway deployment...${NC}"
    
    # Set Railway token
    export RAILWAY_TOKEN="$RAILWAY_TOKEN"
    
    # Login to Railway
    railway login --token "$RAILWAY_TOKEN"
    echo -e "${GREEN}✅ Logged into Railway${NC}"
    
    # Link to project
    railway link "$RAILWAY_PROJECT_ID"
    echo -e "${GREEN}✅ Linked to Railway project${NC}"
    
    # Deploy to Railway
    echo -e "${YELLOW}🚀 Deploying to Railway...${NC}"
    railway up --detach
    echo -e "${GREEN}✅ Deployed to Railway${NC}"
    
    # Show deployment status
    railway status
}

# Function to setup environment variables on Railway
setup_railway_env() {
    echo -e "${YELLOW}⚙️  Setting up Railway environment variables...${NC}"
    
    # Set essential environment variables
    railway variables set SECRET_KEY="$(openssl rand -hex 32)"
    railway variables set ALGORITHM="HS256"
    railway variables set ACCESS_TOKEN_EXPIRE_MINUTES="30"
    railway variables set ENVIRONMENT="production"
    railway variables set PROJECT_NAME="MSWD Livelihood Rizal Palawan"
    railway variables set PROJECT_VERSION="1.0.0"
    railway variables set API_V1_STR="/api/v1"
    
    echo -e "${GREEN}✅ Railway environment variables configured${NC}"
}

# Function to create database and Redis services
setup_railway_services() {
    echo -e "${YELLOW}🗄️  Setting up Railway services...${NC}"
    
    # Add PostgreSQL
    railway add postgresql
    echo -e "${GREEN}✅ PostgreSQL service added${NC}"
    
    # Add Redis
    railway add redis
    echo -e "${GREEN}✅ Redis service added${NC}"
    
    # Wait for services to be ready
    echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
    sleep 30
}

# Main execution
main() {
    echo -e "${BLUE}🎯 Starting deployment process...${NC}"
    echo ""
    
    # Check prerequisites
    if ! command_exists git; then
        echo -e "${RED}❌ Git is not installed. Please install Git first.${NC}"
        exit 1
    fi
    
    if ! command_exists curl; then
        echo -e "${RED}❌ curl is not installed. Please install curl first.${NC}"
        exit 1
    fi
    
    # Execute deployment steps
    install_railway_cli
    setup_git
    git_commit_push
    setup_railway
    setup_railway_services
    setup_railway_env
    
    echo ""
    echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
    echo -e "${BLUE}📊 Deployment Summary:${NC}"
    echo "   ✅ Git repository initialized and pushed"
    echo "   ✅ Railway CLI installed and configured"
    echo "   ✅ Application deployed to Railway"
    echo "   ✅ PostgreSQL and Redis services added"
    echo "   ✅ Environment variables configured"
    echo ""
    echo -e "${YELLOW}🔗 Next Steps:${NC}"
    echo "   1. Check your Railway dashboard: https://railway.app/project/$RAILWAY_PROJECT_ID"
    echo "   2. Configure custom domain if needed"
    echo "   3. Set up monitoring and alerts"
    echo "   4. Configure Firebase credentials in Railway variables"
    echo "   5. Set up email SMTP configuration"
    echo ""
    echo -e "${GREEN}🚀 Your MSWD Livelihood application is now live!${NC}"
}

# Run main function
main "$@"