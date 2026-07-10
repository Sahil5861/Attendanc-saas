#!/bin/bash

set -e

PROJECT_ROOT="/var/www/Attendanc-saas"
BACKEND="$PROJECT_ROOT/attendance-backend"
FRONTEND="$PROJECT_ROOT/frontend"

echo "========================================="
echo "Starting Deployment..."
echo "========================================="

cd "$PROJECT_ROOT"

echo "Pulling latest code..."
git pull origin main

echo "Checking for dependency changes..."

if git diff HEAD@{1} HEAD --name-only | grep -qE 'attendance-backend/package(-lock)?\.json'; then
    echo "Installing backend dependencies..."
    cd "$BACKEND"
    npm install
fi

if git diff HEAD@{1} HEAD --name-only | grep -qE 'frontend/package(-lock)?\.json'; then
    echo "Installing frontend dependencies..."
    cd "$FRONTEND"
    npm install
fi

echo "Restarting Backend..."
cd "$BACKEND"
pm2 restart attendance-backend

echo "Building Frontend..."
cd "$FRONTEND"

rm -rf .next

npm run build

echo "Restarting Frontend..."
pm2 restart attendance-frontend

pm2 save

echo ""
echo "Deployment Successful!"