#!/bin/bash

# MSWD Livelihood Development Startup Script
echo "🚀 Starting MSWD Livelihood Development Environment..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "📋 Please copy .env.template to .env and configure your settings"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    pnpm install
fi

# Start PostgreSQL and Redis (if using Docker)
echo "🐳 Starting database services..."
docker-compose up -d postgres redis

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 5

# Start the API server
echo "🔧 Starting FastAPI backend..."
cd services/api
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
API_PID=$!
cd ../..

# Start the web frontend
echo "🌐 Starting React frontend..."
cd apps/web
pnpm dev &
WEB_PID=$!
cd ../..

echo "✅ Development environment started!"
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend API: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for interrupt
trap "echo '🛑 Stopping services...'; kill $API_PID $WEB_PID; docker-compose down; exit" INT
wait