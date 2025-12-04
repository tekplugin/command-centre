# ✅ Resend Webhook Quick Setup Checklist

## Before You Start
- [ ] Resend account created (https://resend.com)
- [ ] MongoDB running locally
- [ ] Backend and Frontend code updated

---

## 📝 Step-by-Step Setup

### 1️⃣ Get Resend API Key (2 minutes)
- [ ] Login to https://resend.com/login
- [ ] Go to **API Keys**
- [ ] Click "Create API Key"
- [ ] Copy the key (starts with `re_...`)
- [ ] Paste in `backend/.env` as `RESEND_API_KEY=re_...`

### 2️⃣ Add Your Domain (5 minutes)
- [ ] In Resend Dashboard → **Domains** → Add Domain
- [ ] Enter your domain name
- [ ] Add DNS records (SPF, DKIM, DMARC) to your domain provider
- [ ] Wait for verification ⏳

### 3️⃣ Setup Webhook (3 minutes)

**For Local Testing:**
- [ ] Install ngrok: `choco install ngrok` or download from https://ngrok.com
- [ ] Run: `ngrok http 5000`
- [ ] Copy the HTTPS URL (e.g., `https://abc123.ngrok-free.app`)

**Configure Webhook:**
- [ ] In Resend Dashboard → **Webhooks** → Add Endpoint
- [ ] **URL**: `https://your-ngrok-url.ngrok-free.app/api/v1/webhooks/resend/incoming`
- [ ] **Events**: Select "Email Received" or "email.received"  
- [ ] Click Create
- [ ] Copy webhook secret (`whsec_...`)
- [ ] Paste in `backend/.env` as `RESEND_WEBHOOK_SECRET=whsec_...`

### 4️⃣ Configure Inbound Email (3 minutes)
- [ ] In Resend Dashboard → **Inbound**
- [ ] Click "Create Inbound Route"
- [ ] **Match**: `*@yourdomain.com` or specific like `support@yourdomain.com`
- [ ] **Forward to**: Webhook (select your webhook)
- [ ] Click Create

### 5️⃣ Update Backend .env File
Open `backend/.env` and add/update these lines:

```bash
# Resend Configuration
RESEND_API_KEY=re_your_api_key_here
RESEND_WEBHOOK_SECRET=whsec_your_webhook_secret_here
RESEND_FROM_EMAIL=noreply@yourdomain.com
RESEND_DOMAIN=yourdomain.com
```

- [ ] `RESEND_API_KEY` filled
- [ ] `RESEND_WEBHOOK_SECRET` filled
- [ ] `RESEND_FROM_EMAIL` updated with your domain
- [ ] `RESEND_DOMAIN` updated with your domain

### 6️⃣ Start Backend Server
```bash
cd backend
npm run dev
```

- [ ] Backend running on port 5000
- [ ] No errors in terminal
- [ ] MongoDB connected successfully

### 7️⃣ Start Frontend (Optional - for viewing inbox)
```bash
cd web
npm run dev
```

- [ ] Frontend running on port 3000
- [ ] Can access http://localhost:3000

### 8️⃣ Test Email Reception

**Method 1: Send Real Email**
- [ ] Send email from Gmail/Outlook to: `support@yourdomain.com`
- [ ] Check backend terminal for logs
- [ ] Should see: `[INFO] Incoming email saved successfully`

**Method 2: Check Inbox Page**
- [ ] Open http://localhost:3000
- [ ] Login to ExecApp
- [ ] Click **Inbox** (📧) in sidebar
- [ ] See your test email listed

**Method 3: Check Database**
```bash
mongosh
use execapp_db
db.incomingemails.find().pretty()
```
- [ ] Email saved in database

---

## 🎯 Success Criteria

✅ All checkboxes above completed
✅ Test email received and visible in inbox
✅ No errors in backend logs
✅ Email stored in MongoDB database

---

## 🚨 Troubleshooting

**Problem: Webhook not receiving emails**
- Verify ngrok is running
- Check webhook URL is correct in Resend
- Verify backend is running on port 5000

**Problem: Signature verification failing**
- Check `RESEND_WEBHOOK_SECRET` in .env
- Make sure it starts with `whsec_`
- Copy exactly from Resend Dashboard

**Problem: Emails not in database**
- Check MongoDB is running: `mongosh`
- Check backend logs for database errors
- Verify IncomingEmail model loaded

**Problem: Inbox page shows nothing**
- Check browser console (F12) for errors
- Verify you're logged in
- Check localStorage has 'token'
- Test API: `GET http://localhost:5000/api/v1/email/inbox`

---

## 📚 Full Documentation

For detailed instructions, see: `RESEND_WEBHOOK_SETUP.md`

---

## 🎉 You're Done!

Your ExecApp can now receive emails!

**What's Next?**
- Configure custom email addresses (sales@, support@, billing@)
- Add email templates for automatic replies
- Set up email-to-ticket conversion
- Link emails to deals and projects

Happy emailing! 📧
