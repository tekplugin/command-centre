# Production Update Script for Windows (PowerShell)
# Updates ExecApp on AWS EC2
# Usage: .\update-production.ps1

param(
    [string]$EC2Host = "your-ec2-ip-or-domain",
    [string]$EC2User = "ubuntu",
    [string]$SSHKey = "$HOME\.ssh\your-key.pem"
)

Write-Host "`n======================================" -ForegroundColor Cyan
Write-Host "   ExecApp Production Update" -ForegroundColor Cyan
Write-Host "======================================`n" -ForegroundColor Cyan

# Configuration
$BackendDir = "/home/ubuntu/execapp/backend"
$FrontendDir = "/home/ubuntu/execapp/web"

# Function to run SSH commands
function Invoke-SSHCommand {
    param([string]$Command)
    ssh -i $SSHKey "$EC2User@$EC2Host" $Command
}

# 1. Update Backend
Write-Host "[1/4] Updating Backend..." -ForegroundColor Yellow
Invoke-SSHCommand "cd $BackendDir && git pull origin main && npm install --production && npm run build && pm2 restart execapp-backend"
Write-Host "✓ Backend updated`n" -ForegroundColor Green

# 2. Update Frontend
Write-Host "[2/4] Updating Frontend..." -ForegroundColor Yellow
Invoke-SSHCommand "cd $FrontendDir && git pull origin main && npm install && npm run build && pm2 restart execapp-frontend"
Write-Host "✓ Frontend updated`n" -ForegroundColor Green

# 3. Check PM2 Status
Write-Host "[3/4] Checking application status..." -ForegroundColor Yellow
Invoke-SSHCommand "pm2 status"
Write-Host ""

# 4. Health Checks
Write-Host "[4/4] Running health checks..." -ForegroundColor Yellow
try {
    $backendResponse = Invoke-WebRequest -Uri "https://$EC2Host/api/health" -UseBasicParsing -TimeoutSec 5
    if ($backendResponse.StatusCode -eq 200) {
        Write-Host "✓ Backend health check passed" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ Backend health check failed" -ForegroundColor Red
}

try {
    $frontendResponse = Invoke-WebRequest -Uri "https://$EC2Host/" -UseBasicParsing -TimeoutSec 5
    if ($frontendResponse.StatusCode -eq 200) {
        Write-Host "✓ Frontend health check passed" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ Frontend health check failed" -ForegroundColor Red
}

Write-Host "`n======================================" -ForegroundColor Cyan
Write-Host "✓ Production Update Complete!" -ForegroundColor Green
Write-Host "======================================`n" -ForegroundColor Cyan

Write-Host "Dashboard: https://$EC2Host"
Write-Host "API: https://$EC2Host/api/health`n"

Write-Host "View logs:" -ForegroundColor Yellow
Write-Host "  Backend:  ssh -i $SSHKey $EC2User@$EC2Host 'pm2 logs execapp-backend'"
Write-Host "  Frontend: ssh -i $SSHKey $EC2User@$EC2Host 'pm2 logs execapp-frontend'`n"
