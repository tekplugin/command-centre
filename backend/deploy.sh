#!/bin/bash

# ExecApp Backend Deployment Script for EC2
# Usage: bash deploy.sh

set -e  # Exit on any error

echo "======================================"
echo "   ExecApp Backend Deployment"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
APP_DIR="/home/ubuntu/execapp/backend"
PM2_APP_NAME="execapp-backend"

echo "→ Checking current directory..."
if [ ! -d "$APP_DIR" ]; then
    echo -e "${RED}✗ Error: Application directory not found!${NC}"
    exit 1
fi

cd "$APP_DIR"
echo -e "${GREEN}✓ In application directory${NC}"

echo ""
echo "→ Pulling latest code from Git..."
git pull origin main
echo -e "${GREEN}✓ Code updated${NC}"

echo ""
echo "→ Installing dependencies..."
npm install --production
echo -e "${GREEN}✓ Dependencies installed${NC}"

echo ""
echo "→ Building TypeScript..."
npm run build
echo -e "${GREEN}✓ Build complete${NC}"

echo ""
echo "→ Restarting application with PM2..."
pm2 restart $PM2_APP_NAME
echo -e "${GREEN}✓ Application restarted${NC}"

echo ""
echo "→ Checking PM2 status..."
pm2 status $PM2_APP_NAME

echo ""
echo "======================================"
echo -e "${GREEN}✓ Deployment complete!${NC}"
echo "======================================"
echo ""
echo "View logs: pm2 logs $PM2_APP_NAME"
echo "Monitor: pm2 monit"
echo ""
