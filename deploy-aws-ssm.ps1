# Deploy to Production using AWS Systems Manager
# No SSH key required!

Write-Host "`n🚀 AWS SSM Production Deployment`n" -ForegroundColor Cyan

# Configuration
$InstanceId = "i-09d3dae8b350c17a6"
$Region = "ap-southeast-1"

Write-Host "Checking AWS CLI..." -ForegroundColor Yellow
if (-not (Get-Command aws -ErrorAction SilentlyContinue)) {
    Write-Host "❌ AWS CLI not installed!" -ForegroundColor Red
    Write-Host "Install from: https://aws.amazon.com/cli/`n" -ForegroundColor Yellow
    exit 1
}
Write-Host "✓ AWS CLI found`n" -ForegroundColor Green

# Update Backend
Write-Host "[1/2] Deploying Backend..." -ForegroundColor Yellow
$backendCommands = @"
cd /home/ubuntu/command-centre/backend
git pull origin main
npm install --production
npm run build
pm2 restart command-centre-backend
pm2 save
"@

aws ssm send-command `
    --instance-ids $InstanceId `
    --document-name "AWS-RunShellScript" `
    --parameters "commands=['$backendCommands']" `
    --region $Region `
    --output text

Write-Host "✓ Backend deployment initiated`n" -ForegroundColor Green

# Update Frontend
Write-Host "[2/2] Deploying Frontend..." -ForegroundColor Yellow
$frontendCommands = @"
cd /home/ubuntu/command-centre/web
git pull origin main
npm install
npm run build
pm2 restart command-centre-frontend
pm2 save
"@

aws ssm send-command `
    --instance-ids $InstanceId `
    --document-name "AWS-RunShellScript" `
    --parameters "commands=['$frontendCommands']" `
    --region $Region `
    --output text

Write-Host "✓ Frontend deployment initiated`n" -ForegroundColor Green

Write-Host "`n======================================" -ForegroundColor Cyan
Write-Host "✓ Deployment Commands Sent!" -ForegroundColor Green
Write-Host "======================================`n" -ForegroundColor Cyan

Write-Host "Waiting 30 seconds for services to restart..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

Write-Host "`nVerifying deployment..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://13.219.183.238:5000/health" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ Backend is healthy" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠ Backend health check failed" -ForegroundColor Yellow
}

Write-Host "`n🎉 Deployment Complete!`n" -ForegroundColor Green
Write-Host "Production URL: http://13.219.183.238`n"
