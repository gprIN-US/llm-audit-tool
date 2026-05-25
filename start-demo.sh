#!/bin/bash

echo ""
echo "LLM Audit Tool - Starting up..."
echo ""

cd "$(dirname "$0")"

if ! command -v python3 &> /dev/null; then
    echo "Python3 not found. Install from python.org first."
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "Node.js not found. Install from nodejs.org first."
    exit 1
fi

echo "Setting up backend..."
cd backend

if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate
pip install -r requirements.txt -q

cp ../.env.demo .env

echo "Starting backend on http://localhost:8000"
python main.py &
BACKEND_PID=$!

cd ../frontend

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install -q
fi

echo "Starting frontend on http://localhost:3000"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "Both servers are running."
echo "Open http://localhost:3000 in your browser."
echo ""
echo "Press Ctrl+C to stop both servers."
echo ""

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Stopped.'" EXIT
wait
