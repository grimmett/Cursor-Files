#!/bin/bash

echo "🚀 Setting up Construction Punchlist App..."
echo "=============================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL first."
    exit 1
fi

# Check if Expo CLI is installed
if ! command -v expo &> /dev/null; then
    echo "📱 Installing Expo CLI..."
    npm install -g @expo/cli
fi

echo "✅ Prerequisites check passed!"

# Create necessary directories
echo "📁 Creating project structure..."
mkdir -p backend/uploads
mkdir -p backend/logs
mkdir -p mobile-app/assets
mkdir -p web-app/public

# Install backend dependencies
echo "🔧 Installing backend dependencies..."
cd backend
npm install
cd ..

# Install mobile app dependencies
echo "📱 Installing mobile app dependencies..."
cd mobile-app
npm install
cd ..

# Install web app dependencies
echo "🌐 Installing web app dependencies..."
cd web-app
npm install
cd ..

# Create database
echo "🗄️ Setting up database..."
psql -U postgres -c "CREATE DATABASE construction_punchlist;" 2>/dev/null || echo "Database already exists or user doesn't have permission"

# Copy environment files
echo "⚙️ Setting up environment files..."
if [ ! -f backend/.env ]; then
    cp backend/env.example backend/.env
    echo "⚠️  Please update backend/.env with your database credentials"
fi

echo ""
echo "🎉 Setup complete! Next steps:"
echo ""
echo "1. Update backend/.env with your database credentials"
echo "2. Start the backend server:"
echo "   cd backend && npm run dev"
echo ""
echo "3. Start the web app:"
echo "   cd web-app && npm run dev"
echo ""
echo "4. Start the mobile app:"
echo "   cd mobile-app && npm start"
echo ""
echo "📚 For more information, see README.md"
echo ""
echo "Happy coding! 🚀"



