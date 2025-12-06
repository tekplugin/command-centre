#!/bin/bash

# ExecApp Production Update Script
# Updates both backend and frontend on AWS
# Usage: bash update-production.sh

set -e

echo "======================================"
echo "   ExecApp Production Update"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration - Update these with your production values
EC2_HOST="your-ec2-ip-or-domain"
EC2_USER="ubuntu"
SSH_KEY="~/.ssh/your-key.pem"
BACKEND_DIR="/home/ubuntu/execapp/backend"
FRONTEND_DIR="/home/ubuntu/execapp/web"

echo -e "${BLUE}→ Connecting to production server...${NC}"
echo ""

# Function to run commands on EC2
run_on_ec2() {
    ssh -i "$SSH_KEY" "$EC2_USER@$EC2_HOST" "$1"
}

# 1. Update Backend
echo -e "${YELLOW}[1/4] Updating Backend...${NC}"
run_on_ec2 "cd $BACKEND_DIR && \
    git pull origin main && \
    npm install --production && \
    npm run build && \
    pm2 restart execapp-backend"
echo -e "${GREEN}✓ Backend updated${NC}"
echo ""

# 2. Update Frontend
echo -e "${YELLOW}[2/4] Updating Frontend...${NC}"
run_on_ec2 "cd $FRONTEND_DIR && \
    git pull origin main && \
    npm install && \
    npm run build && \
    pm2 restart execapp-frontend"
echo -e "${GREEN}✓ Frontend updated${NC}"
echo ""

# 3. Check PM2 Status
echo -e "${YELLOW}[3/4] Checking application status...${NC}"
run_on_ec2 "pm2 status"
echo ""

# 4. Health Check
echo -e "${YELLOW}[4/4] Running health checks...${NC}"
BACKEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" https://$EC2_HOST/api/health)
FRONTEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" https://$EC2_HOST/)

if [ "$BACKEND_HEALTH" == "200" ]; then
    echo -e "${GREEN}✓ Backend health check passed${NC}"
else
    echo -e "${RED}✗ Backend health check failed (HTTP $BACKEND_HEALTH)${NC}"
fi

if [ "$FRONTEND_HEALTH" == "200" ]; then
    echo -e "${GREEN}✓ Frontend health check passed${NC}"
else
    echo -e "${RED}✗ Frontend health check failed (HTTP $FRONTEND_HEALTH)${NC}"
fi

echo ""
echo "======================================"
echo -e "${GREEN}✓ Production Update Complete!${NC}"
echo "======================================"
echo ""
echo "Dashboard: https://$EC2_HOST"
echo "API: https://$EC2_HOST/api/health"
echo ""
echo "View logs:"
echo "  Backend:  ssh -i $SSH_KEY $EC2_USER@$EC2_HOST 'pm2 logs execapp-backend'"
echo "  Frontend: ssh -i $SSH_KEY $EC2_USER@$EC2_HOST 'pm2 logs execapp-frontend'"
echo ""
