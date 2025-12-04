# Resend Webhook Setup for Incoming Emails

## Quick Start Guide

Follow these steps to configure your ExecApp to receive incoming emails via Resend.

---

## Step 1: Get Your Resend API Key

1. **Login to Resend**
   - Go to https://resend.com/login
   - Sign in with your account

2. **Get API Key**
   - Navigate to **API Keys** section
   - Click "Create API Key"
   - Name it: "ExecApp Production"
   - Copy the API key (starts with `re_...`)

3. **Update Backend .env File**
   ```bash
   # Open: backend/.env
   RESEND_API_KEY=re_your_actual_api_key_here
   RESEND_FROM_EMAIL=noreply@yourdomain.com
   RESEND_DOMAIN=yourdomain.com
   ```

---

## Step 2: Setup Domain in Resend

1. **Add Your Domain**
   - In Resend Dashboard, go to **Domains**
   - Click "Add Domain"
   - Enter your domain (e.g., `execapp.com`)

2. **Verify DNS Records**
   - Resend will show DNS records to add
   - Add these to your domain DNS settings:
     - SPF record
     - DKIM record
     - DMARC record (optional but recommended)
   - Wait for verification (can take up to 48 hours)

---

## Step 3: Configure Inbound Email Forwarding

### Option A: Using Resend Inbound Routes (Recommended)

1. **Go to Inbound Routes**
   - In Resend Dashboard → **Inbound**
   - Click "Create Inbound Route"

2. **Configure Route**
   - **Match**: `*@yourdomain.com` (or specific address like `support@yourdomain.com`)
   - **Forward to**: Webhook URL
   - **Webhook URL**: `https://your-production-url.com/api/v1/webhooks/resend/incoming`

### Option B: For Local Development (Testing)

1. **Install ngrok**
   ```bash
   # Download from https://ngrok.com/download
   # Or install via chocolatey:
   choco install ngrok
   ```

2. **Start ngrok tunnel**
   ```bash
   ngrok http 5000
   ```

3. **Copy HTTPS URL**
   - ngrok will display: `https://abc123.ngrok-free.app`
   - This is your temporary public URL

4. **Configure Resend Webhook**
   - Use: `https://abc123.ngrok-free.app/api/v1/webhooks/resend/incoming`

---

## Step 4: Create Webhook in Resend

1. **Go to Webhooks Section**
   - In Resend Dashboard → **Webhooks**
   - Click "Add Endpoint"

2. **Configure Webhook**
   - **Endpoint URL**: 
     - Production: `https://yourdomain.com/api/v1/webhooks/resend/incoming`
     - Development: `https://your-ngrok-url.ngrok-free.app/api/v1/webhooks/resend/incoming`
   
   - **Events to listen**: Select **"Email Received"** or **"email.received"**
   
   - **Description**: "ExecApp Incoming Email Handler"

3. **Get Webhook Secret**
   - After creating, Resend shows: `whsec_...`
   - Copy this secret

4. **Update .env with Secret**
   ```bash
   RESEND_WEBHOOK_SECRET="https://your-ngrok-url.ngrok-free.app/api/v1/webhooks/resend/incoming"
   ```

---

## Step 5: Start Your Backend Server

1. **Navigate to backend folder**
   ```bash
   cd C:\Users\Tekpl\OneDrive\Documents\execapp\backend
   ```

2. **Install dependencies** (if not already done)
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm run dev
   ```

4. **Verify server is running**
   - You should see: `Server running on port 5000`
   - Webhook endpoint ready at: `http://localhost:5000/api/v1/webhooks/resend/incoming`

---

## Step 6: Test Incoming Email

### Method 1: Send Test Email via Resend Dashboard

1. **Go to Resend Dashboard → Inbound**
2. **Find your configured route**
3. **Click "Test"**
4. **Send test email**

### Method 2: Send Real Email

1. **Send an email to**: `support@yourdomain.com` (or configured address)
2. **From any email client**: Gmail, Outlook, etc.
3. **Subject**: "Test Email"
4. **Body**: "Testing incoming email"

### Method 3: Use curl (Advanced)

```bash
curl -X POST http://localhost:5000/api/v1/webhooks/resend/incoming \
  -H "Content-Type: application/json" \
  -d '{
    "id": "msg_test123",
    "from": "customer@example.com",
    "to": ["support@yourdomain.com"],
    "subject": "Test Email",
    "text": "This is a test email",
    "html": "<p>This is a test email</p>",
    "created_at": "2025-12-01T10:00:00Z"
  }'
```

---

## Step 7: Verify Email Receipt

### Check Backend Logs

```bash
# You should see in terminal:
[INFO] Received incoming email webhook
[INFO] Incoming email saved successfully
```

### Check MongoDB Database

```bash
# Connect to MongoDB
mongosh

# Use execapp database
use execapp_db

# View incoming emails
db.incomingemails.find().pretty()
```

### Check Frontend Inbox

1. **Open ExecApp**: http://localhost:3000
2. **Login**
3. **Go to Inbox** (📧 in sidebar)
4. **You should see**: Your test email listed

---

## Configuration Summary

### Environment Variables (.env)

```bash
# Resend Configuration
RESEND_API_KEY=re_your_actual_api_key_here
RESEND_WEBHOOK_SECRET=whsec_your_webhook_secret_here
RESEND_FROM_EMAIL=noreply@yourdomain.com
RESEND_DOMAIN=yourdomain.com
```

### Webhook Endpoint

```
POST /api/v1/webhooks/resend/incoming
```

**Security**: 
- ✅ Signature verification enabled
- ✅ HTTPS required for production
- ✅ Rate limiting active

---

## Production Deployment Checklist

- [ ] Domain verified in Resend
- [ ] DNS records configured (SPF, DKIM, DMARC)
- [ ] Inbound route created in Resend
- [ ] Webhook endpoint configured with production URL
- [ ] RESEND_API_KEY set in production .env
- [ ] RESEND_WEBHOOK_SECRET set in production .env
- [ ] Backend deployed and running
- [ ] HTTPS enabled on production domain
- [ ] Test email sent and received successfully
- [ ] Inbox page accessible in frontend

---

## Troubleshooting

### Webhook not receiving emails

**Check 1: Verify Backend is Running**
```bash
# Test locally
curl http://localhost:5000/health

# Should return: {"status":"ok","timestamp":"..."}
```

**Check 2: Verify ngrok (for local testing)**
```bash
# ngrok should be running
# Visit: http://127.0.0.1:4040 (ngrok web interface)
# Check for incoming requests
```

**Check 3: Check Resend Webhook Logs**
- Go to Resend Dashboard → Webhooks
- Click on your webhook
- View "Recent Deliveries"
- Check for errors

**Check 4: Verify Webhook URL**
- Must be HTTPS in production
- Must be publicly accessible
- No firewall blocking

### Emails not appearing in database

**Check MongoDB Connection**
```bash
# In backend logs, look for:
[INFO] MongoDB connected successfully
```

**Check Email Model**
```bash
# In MongoDB:
db.incomingemails.countDocuments()
# Should return number > 0 if emails received
```

### Signature Verification Failing

**Option 1: Disable temporarily for testing**
```bash
# In .env, comment out:
# RESEND_WEBHOOK_SECRET=
```

**Option 2: Verify secret is correct**
- Copy from Resend Dashboard → Webhooks → Your Webhook → Signing Secret
- Must start with `whsec_`

### Frontend not showing emails

**Check 1: Verify API endpoint**
```bash
# Test with curl (replace TOKEN with your JWT token)
curl http://localhost:5000/api/v1/email/inbox \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Check 2: Check browser console**
- Open Dev Tools (F12)
- Look for errors in Console tab

**Check 3: Verify authentication**
- Make sure you're logged in
- Check localStorage for 'token'

---

## API Documentation

### Incoming Email Webhook Payload

Resend sends this data when an email is received:

```json
{
  "id": "msg_abc123",
  "message_id": "<unique@resend.dev>",
  "from": "sender@example.com",
  "to": ["recipient@yourdomain.com"],
  "cc": [],
  "bcc": [],
  "subject": "Email subject line",
  "text": "Plain text version of email body",
  "html": "<p>HTML version of email body</p>",
  "created_at": "2025-12-01T10:30:00.000Z",
  "headers": {
    "return-path": "<sender@example.com>",
    "received": "...",
    "reply-to": "sender@example.com",
    "in-reply-to": "<previous-message-id>",
    "references": "<thread-reference-ids>"
  },
  "attachments": [
    {
      "filename": "document.pdf",
      "content_type": "application/pdf",
      "size": 12345,
      "content": "base64_encoded_content..."
    }
  ]
}
```

### Frontend API Endpoints

**Get Inbox**
```
GET /api/v1/email/inbox
Authorization: Bearer {token}

Query Params:
- page (default: 1)
- limit (default: 50)
- isRead (true/false)
- isArchived (default: false)
```

**Get Single Email**
```
GET /api/v1/email/inbox/:emailId
Authorization: Bearer {token}
```

**Mark as Read**
```
PATCH /api/v1/email/inbox/:emailId/read
Authorization: Bearer {token}
Body: {"isRead": true}
```

**Archive Email**
```
PATCH /api/v1/email/inbox/:emailId/archive
Authorization: Bearer {token}
Body: {"isArchived": true}
```

---

## Advanced Features

### Email Threading

Emails are automatically threaded using:
- `inReplyTo` field
- `references` field
- Subject line matching

### Attachment Handling

Attachments are:
- Tracked in database (filename, size, type)
- Can be stored to S3/cloud storage (future enhancement)
- Displayed in email viewer UI

### Real-time Notifications

When email arrives:
1. Saved to database
2. Socket.IO event emitted: `new_email`
3. Frontend can listen and show notification

**Frontend Socket Listener** (optional):
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

socket.on('new_email', (data) => {
  console.log('New email:', data);
  // Show browser notification
  // Refresh inbox
  // Play sound
});
```

---

## Support & Resources

- **Resend Documentation**: https://resend.com/docs
- **Resend Webhooks Guide**: https://resend.com/docs/dashboard/webhooks/introduction
- **ngrok Documentation**: https://ngrok.com/docs
- **MongoDB Compass**: https://www.mongodb.com/products/compass

---

## Quick Reference Commands

```bash
# Start backend
cd backend
npm run dev

# Start frontend  
cd web
npm run dev

# Start ngrok (for local testing)
ngrok http 5000

# Check MongoDB
mongosh
use execapp_db
db.incomingemails.find()

# Test webhook locally
curl -X POST http://localhost:5000/api/v1/webhooks/resend/incoming \
  -H "Content-Type: application/json" \
  -d '{"from":"test@example.com","to":["support@yourdomain.com"],"subject":"Test"}'
```

---

**Your incoming email system is ready! 🎉**

Just follow the steps above to configure Resend and start receiving emails.

