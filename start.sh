#!/bin/bash

# AI Doctor Voice Agent - Start Script
echo "🩺 Starting AI Doctor Voice Agent..."
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found"
    echo "Please create a .env file with your OpenAI API key:"
    echo "1. Copy the example file: cp .env.example .env"
    echo "2. Edit .env and add your OpenAI API key"
    echo ""
    exit 1
fi

# Source the .env file to check if OPENAI_API_KEY is set
source .env

if [ -z "$OPENAI_API_KEY" ] || [ "$OPENAI_API_KEY" = "your-openai-api-key-here" ]; then
    echo "❌ Error: OPENAI_API_KEY not properly configured in .env file"
    echo "Please edit the .env file and set your actual OpenAI API key"
    echo ""
    exit 1
fi

echo "✅ Environment configuration loaded from .env file"
echo ""

# Function to cleanup background processes
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    kill $API_PID $DEV_PID 2>/dev/null
    exit 0
}

# Set up trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Start API server in background
echo "🚀 Starting API server on port 3001..."
npm run server &
API_PID=$!

# Wait a moment for API server to start
sleep 2

# Start development server in background
echo "🚀 Starting development server on port 5174..."
npm run dev &
DEV_PID=$!

echo ""
echo "🎉 Both servers are starting up!"
echo ""
echo "📋 Services:"
echo "   🔗 API Server: http://localhost:3001"
echo "   🌐 Frontend: http://localhost:5174"
echo ""
echo "💡 The application will automatically fetch ephemeral keys from the API"
echo "🩺 Open http://localhost:5174 in your browser to start using the AI Doctor"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for background processes
wait