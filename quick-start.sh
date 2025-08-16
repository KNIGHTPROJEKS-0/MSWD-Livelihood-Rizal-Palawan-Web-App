#!/bin/bash

echo "🚀 MSWD Livelihood Quick Start"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Start services
echo "🐳 Starting Docker services..."
docker-compose up -d postgres redis

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 10

# Start API
echo "🔧 Starting API service..."
docker-compose up -d api

# Install web dependencies and start
echo "📦 Setting up web application..."
cd apps/web
npm install
npm run dev &

echo "✅ Quick start complete!"
echo "🌐 Web: http://localhost:3000"
echo "🔧 API: http://localhost:8000"
echo "📊 API Docs: http://localhost:8000/docs"