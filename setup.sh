#!/bin/bash

echo "=========================================="
echo "Task Planner App - Setup Script"
echo "=========================================="
echo ""

# Check if running from correct directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "Error: Please run this script from the task-planner-app directory"
    exit 1
fi

# Backend setup
echo "Setting up backend..."
cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

echo "Activating virtual environment..."
source venv/bin/activate

echo "Installing Python dependencies..."
pip install -r requirements.txt

# Check if .env exists
if [ ! -f ".env" ]; then
    echo ""
    echo "Warning: .env file not found!"
    echo "Please copy .env.example to .env and configure your settings:"
    echo "  1. Database URL"
    echo "  2. Anthropic API Key"
    echo "  3. Secret Key"
    echo ""
    read -p "Press Enter to continue..."
fi

cd ..

# Frontend setup
echo ""
echo "Setting up frontend..."
cd frontend

echo "Installing npm dependencies..."
npm install

cd ..

echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Configure backend/.env file with your credentials"
echo "2. Create PostgreSQL database"
echo "3. Start backend: cd backend && source venv/bin/activate && uvicorn app.main:app --reload"
echo "4. Start frontend: cd frontend && npm run dev"
echo ""
echo "See README.md for detailed instructions"
