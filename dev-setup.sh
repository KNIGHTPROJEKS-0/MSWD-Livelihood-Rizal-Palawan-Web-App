#!/bin/bash

echo "🚀 Setting up MSWD Livelihood Development Environment..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Login to Firebase (if not already logged in)
echo "🔐 Checking Firebase authentication..."
firebase login --no-localhost

# Install dependencies
echo "📦 Installing dependencies..."
cd apps/web && npm install && cd ../..

# Start Firebase emulators
echo "🔥 Starting Firebase emulators..."
firebase emulators:start --only auth,firestore,storage &

# Wait for emulators to start
sleep 5

# Start web development server
echo "🌐 Starting web development server..."
cd apps/web && npm run dev

echo "✅ Development environment ready!"
echo "🌐 Web app: http://localhost:3000"
echo "🔥 Firebase UI: http://localhost:4000"