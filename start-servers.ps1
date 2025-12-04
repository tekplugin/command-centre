# ExecApp Server Startup Script
Write-Host "`n🚀 Starting ExecApp Servers...`n" -ForegroundColor Green

# Kill any existing node processes
Write-Host "Cleaning up existing processes..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Start Backend
Write-Host "`n📡 Starting Backend Server..." -ForegroundColor Cyan
$backendPath = "C:\Users\Tekpl\OneDrive\Documents\execapp\backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 8

# Start Frontend
Write-Host "🌐 Starting Frontend Server..." -ForegroundColor Cyan
$frontendPath = "C:\Users\Tekpl\OneDrive\Documents\execapp\web"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 6

# Check status
Write-Host "`n✅ Checking Server Status...`n" -ForegroundColor Green

$backendRunning = Test-NetConnection -ComputerName localhost -Port 5000 -InformationLevel Quiet -WarningAction SilentlyContinue
$frontendRunning = Test-NetConnection -ComputerName localhost -Port 3000 -InformationLevel Quiet -WarningAction SilentlyContinue

if ($backendRunning) {
    Write-Host "✅ Backend:  http://localhost:5000 - RUNNING" -ForegroundColor Green
} else {
    Write-Host "❌ Backend:  Port 5000 - NOT RUNNING" -ForegroundColor Red
}

if ($frontendRunning) {
    Write-Host "✅ Frontend: http://localhost:3000 - RUNNING" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend: Port 3000 - NOT RUNNING" -ForegroundColor Red
}

if ($backendRunning -and $frontendRunning) {
    Write-Host "`n🎉 All servers are running!" -ForegroundColor Green
    Write-Host "`n📊 Project Manager: http://localhost:3000/projects" -ForegroundColor Cyan
    Write-Host "📥 Inbox:           http://localhost:3000/inbox" -ForegroundColor Cyan
    Write-Host "🔐 Login:           http://localhost:3000/login" -ForegroundColor Cyan
    Write-Host "`nCredentials: admin@company.com / Test123456`n" -ForegroundColor Gray
} else {
    Write-Host "`n⚠️  Some servers failed to start. Check the terminal windows for errors.`n" -ForegroundColor Yellow
}

Write-Host "Press any key to exit this script (servers will keep running)..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
