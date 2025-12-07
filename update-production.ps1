# Production Update Script for Windows (PowerShell)
# Updates ExecApp on AWS EC2

param(
    [string]$EC2Host = "13.219.183.238",
    [string]$EC2User = "ubuntu",
    [string]$SSHKey = "$env:USERPROFILE\Downloads\command-centre-key.pem"
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
Invoke-SSHCommand "cd $BackendDir; git pull origin main; npm install --production; npm run build; pm2 restart execapp-backend"
Write-Host "âœ“ Backend updated" -ForegroundColor Green
Write-Host ""

# 2. Update Frontend
Write-Host "[2/4] Updating Frontend..." -ForegroundColor Yellow
Invoke-SSHCommand "cd $FrontendDir; git pull origin main; npm install; npm run build; pm2 restart execapp-frontend"
Write-Host "âœ“ Frontend updated" -ForegroundColor Green
Write-Host ""

# 3. Check PM2 Status
Write-Host "[3/4] Checking application status..." -ForegroundColor Yellow
Invoke-SSHCommand "pm2 status"
Write-Host ""

# 4. Health Checks
Write-Host "[4/4] Running health checks..." -ForegroundColor Yellow
try {
    $backendResponse = Invoke-WebRequest -Uri "http://$EC2Host:5000/health" -UseBasicParsing -TimeoutSec 5
    if ($backendResponse.StatusCode -eq 200) {
        Write-Host "âœ“ Backend health check passed" -ForegroundColor Green
    }
} catch {
    Write-Host "âœ— Backend health check failed" -ForegroundColor Red
}

try {
    $frontendResponse = Invoke-WebRequest -Uri "http://$EC2Host:3000/" -UseBasicParsing -TimeoutSec 5
    if ($frontendResponse.StatusCode -eq 200) {
        Write-Host "âœ“ Frontend health check passed" -ForegroundColor Green
    }
} catch {
    Write-Host "âœ— Frontend health check failed" -ForegroundColor Red
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "âœ“ Production Update Complete!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Dashboard: http://$EC2Host:3000"
Write-Host "API: http://$EC2Host:5000/health"
Write-Host ""

