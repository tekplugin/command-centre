# ====================================================================
# GoDaddy DNS Setup Script for Resend Email
# ====================================================================
# This script automates DNS record creation for email with Resend
# 
# IMPORTANT SECURITY NOTES:
# 1. These API credentials are now EXPOSED and should be rotated
# 2. Go to https://developer.godaddy.com/keys to regenerate them
# 3. After running this script, DELETE or secure this file
# ====================================================================

# GoDaddy API Credentials (ROTATE THESE IMMEDIATELY AFTER USE!)
$apiKey = "dLDHTMepWpzR_56xauxbgaGXD7vH9RPk66K"
$apiSecret = "4dFL2y5XmNS5M3dEnmtfUd"

# Configuration
$domain = "tekplugin.com"  # Change this to your domain
$useSubdomain = $true       # Set to $false for root domain (RISKY!)
$subdomain = "app"          # Subdomain to use (app.tekplugin.com)

# Resend DNS Records (from Resend dashboard - UPDATE THESE!)
# Get these values from https://resend.com/domains after adding your domain
$resendRecords = @{
    mx = @{
        name = if ($useSubdomain) { $subdomain } else { "@" }
        value = "feedback-smtp.us-east-1.amazonses.com"  # UPDATE from Resend
        priority = 10
    }
    spf = @{
        name = if ($useSubdomain) { $subdomain } else { "@" }
        value = "v=spf1 include:amazonses.com ~all"
    }
    dkim = @(
        @{
            name = "resend._domainkey"
            value = "p=YOUR_DKIM_KEY_1"  # UPDATE from Resend
        },
        @{
            name = "resend2._domainkey"
            value = "p=YOUR_DKIM_KEY_2"  # UPDATE from Resend
        },
        @{
            name = "resend3._domainkey"
            value = "p=YOUR_DKIM_KEY_3"  # UPDATE from Resend
        }
    )
}

# ====================================================================
# FUNCTIONS
# ====================================================================

function Add-GoDaddyDNSRecord {
    param(
        [string]$Domain,
        [string]$Type,
        [string]$Name,
        [string]$Value,
        [int]$Priority = $null,
        [int]$TTL = 3600
    )
    
    $headers = @{
        "Authorization" = "sso-key $apiKey`:$apiSecret"
        "Content-Type" = "application/json"
    }
    
    $record = @{
        data = $Value
        ttl = $TTL
    }
    
    if ($Priority) {
        $record.priority = $Priority
    }
    
    $body = @($record) | ConvertTo-Json
    
    try {
        $uri = "https://api.godaddy.com/v1/domains/$Domain/records/$Type/$Name"
        Write-Host "Adding $Type record: $Name -> $Value" -ForegroundColor Cyan
        
        $response = Invoke-RestMethod -Uri $uri -Method PUT -Headers $headers -Body $body
        Write-Host "  ✓ Success!" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "  ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

function Get-GoDaddyDNSRecords {
    param([string]$Domain)
    
    $headers = @{
        "Authorization" = "sso-key $apiKey`:$apiSecret"
    }
    
    try {
        $uri = "https://api.godaddy.com/v1/domains/$Domain/records"
        $records = Invoke-RestMethod -Uri $uri -Method GET -Headers $headers
        return $records
    }
    catch {
        Write-Host "Error fetching DNS records: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# ====================================================================
# MAIN SCRIPT
# ====================================================================

Write-Host "`n============================================" -ForegroundColor Yellow
Write-Host "  GoDaddy DNS Setup for Resend Email" -ForegroundColor Yellow
Write-Host "============================================`n" -ForegroundColor Yellow

Write-Host "Domain: $domain" -ForegroundColor Cyan
Write-Host "Configuration: " -NoNewline
if ($useSubdomain) {
    Write-Host "$subdomain.$domain (subdomain)" -ForegroundColor Green
} else {
    Write-Host "$domain (root domain - WILL AFFECT ALL EMAIL!)" -ForegroundColor Red
}

Write-Host "`nWARNING: " -ForegroundColor Yellow -NoNewline
Write-Host "This will modify DNS records for your domain!"
Write-Host "Press Ctrl+C to cancel, or any key to continue..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host "`n=== Step 1: Fetching Current DNS Records ===" -ForegroundColor Cyan
$currentRecords = Get-GoDaddyDNSRecords -Domain $domain
if ($currentRecords) {
    Write-Host "Found $($currentRecords.Count) existing DNS records" -ForegroundColor Green
} else {
    Write-Host "Could not fetch current records. Check your API credentials." -ForegroundColor Red
    exit 1
}

Write-Host "`n=== Step 2: Adding MX Record ===" -ForegroundColor Cyan
$mxSuccess = Add-GoDaddyDNSRecord `
    -Domain $domain `
    -Type "MX" `
    -Name $resendRecords.mx.name `
    -Value $resendRecords.mx.value `
    -Priority $resendRecords.mx.priority

Write-Host "`n=== Step 3: Adding SPF Record ===" -ForegroundColor Cyan
$spfSuccess = Add-GoDaddyDNSRecord `
    -Domain $domain `
    -Type "TXT" `
    -Name $resendRecords.spf.name `
    -Value $resendRecords.spf.value

Write-Host "`n=== Step 4: Adding DKIM Records ===" -ForegroundColor Cyan
$dkimSuccess = $true
foreach ($dkimRecord in $resendRecords.dkim) {
    if ($dkimRecord.value -eq "p=YOUR_DKIM_KEY_1" -or 
        $dkimRecord.value -eq "p=YOUR_DKIM_KEY_2" -or 
        $dkimRecord.value -eq "p=YOUR_DKIM_KEY_3") {
        Write-Host "  ⚠ Skipping $($dkimRecord.name) - UPDATE THE SCRIPT WITH REAL DKIM KEYS!" -ForegroundColor Yellow
        continue
    }
    
    $result = Add-GoDaddyDNSRecord `
        -Domain $domain `
        -Type "TXT" `
        -Name $dkimRecord.name `
        -Value $dkimRecord.value
    
    $dkimSuccess = $dkimSuccess -and $result
}

Write-Host "`n=== Summary ===" -ForegroundColor Cyan
Write-Host "MX Record:   " -NoNewline
Write-Host $(if ($mxSuccess) { "✓ Added" } else { "✗ Failed" }) -ForegroundColor $(if ($mxSuccess) { "Green" } else { "Red" })
Write-Host "SPF Record:  " -NoNewline
Write-Host $(if ($spfSuccess) { "✓ Added" } else { "✗ Failed" }) -ForegroundColor $(if ($spfSuccess) { "Green" } else { "Red" })
Write-Host "DKIM Records:" -NoNewline
Write-Host $(if ($dkimSuccess) { "✓ Added" } else { "⚠ Check above" }) -ForegroundColor $(if ($dkimSuccess) { "Green" } else { "Yellow" })

Write-Host "`n=== Next Steps ===" -ForegroundColor Cyan
Write-Host "1. Wait 15 minutes to 2 hours for DNS propagation"
Write-Host "2. Go to https://resend.com/domains"
Write-Host "3. Click 'Verify Records' or 'Check DNS'"
Write-Host "4. Once verified, configure Inbound Route in Resend"
Write-Host "5. IMPORTANT: Rotate your API credentials at https://developer.godaddy.com/keys"
Write-Host "6. DELETE THIS SCRIPT or remove the API keys from it!"

Write-Host "`n=== Verification ===" -ForegroundColor Cyan
Write-Host "You can verify DNS propagation with:"
Write-Host "  nslookup -type=MX $subdomain.$domain" -ForegroundColor Gray
Write-Host "  nslookup -type=TXT $subdomain.$domain" -ForegroundColor Gray
Write-Host "  nslookup -type=TXT resend._domainkey.$domain" -ForegroundColor Gray

Write-Host "`nDone!" -ForegroundColor Green
