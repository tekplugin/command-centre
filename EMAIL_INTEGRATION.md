# Email Integration Documentation

## Overview
The application now supports sending invoice emails directly from the CFO dashboard using NodeMailer.

## Features
- ✅ Send professional HTML invoice emails
- ✅ Pre-filled recipient emails for all bank clients
- ✅ Customizable subject and message
- ✅ Automatic invoice details formatting
- ✅ VAT calculations and line items display
- ✅ Test mode with preview URLs (Ethereal)
- ✅ Production-ready SMTP configuration

## How to Use

### 1. From the Web App (CFO Dashboard)
1. Navigate to the CFO page at http://localhost:3000/cfo
2. Scroll to "Recent Invoices" section
3. Click the **Send** button on any invoice
4. Review/edit the pre-filled email details:
   - Recipient email (auto-populated from client)
   - Subject line
   - Message body
5. Click **Send Email**
6. For test mode: You'll receive a preview URL to view the email

### 2. Email Content
The email includes:
- Professional header with company branding
- Invoice details (number, client, dates)
- Your custom message
- Complete invoice breakdown:
  - Line items with descriptions, quantities, rates
  - Subtotal calculation
  - VAT percentage and amount
  - Total amount
- Notes section (if provided)
- Company footer with contact information

## Configuration

### Development Mode (Current - Ethereal Test Account)
- **No configuration needed!**
- Automatically uses Ethereal fake SMTP service
- Emails are NOT actually delivered
- Preview URLs provided to view sent emails
- Perfect for testing without sending real emails
- Current test account: gl4xllt2abqxc2tc@ethereal.email

### Production Mode (Real Email Sending)

#### Option 1: Gmail
1. Create an App Password:
   - Go to Google Account settings
   - Enable 2-Step Verification
   - Generate App Password
2. Add to `backend/.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-digit-app-password
SMTP_FROM="ATM Solutions Ltd <noreply@atmsolutions.com>"
```

#### Option 2: SendGrid
1. Sign up at sendgrid.com
2. Create API key
3. Add to `backend/.env`:
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
SMTP_FROM="ATM Solutions Ltd <noreply@atmsolutions.com>"
```

#### Option 3: AWS SES
1. Set up AWS SES and verify domain
2. Create SMTP credentials
3. Add to `backend/.env`:
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-aws-smtp-username
SMTP_PASS=your-aws-smtp-password
SMTP_FROM="ATM Solutions Ltd <noreply@atmsolutions.com>"
```

## API Endpoints

### Send Invoice Email
```
POST http://localhost:5000/api/v1/email/send-invoice
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "to": "accounts@firstbank.ng",
  "subject": "Invoice INV-2024-001 from ATM Solutions Ltd",
  "message": "Dear First Bank Team...",
  "invoice": {
    "invoiceNumber": "INV-2024-001",
    "client": "First Bank",
    "amount": 8500000,
    "issueDate": "2024-11-15",
    "dueDate": "2024-12-15",
    "items": [
      {
        "description": "ATM Maintenance - November",
        "quantity": 1,
        "rate": 8500000,
        "amount": 8500000
      }
    ],
    "vat": 7.5,
    "notes": "Payment terms: Net 30 days"
  }
}
```

### Send Generic Email
```
POST http://localhost:5000/api/v1/email/send
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "to": "recipient@example.com",
  "subject": "Your Subject",
  "html": "<h1>Your HTML content</h1>"
}
```

## Client Email Mapping
Pre-configured email addresses for all bank clients:

- **First Bank**: accounts@firstbank.ng
- **Union Bank**: finance@unionbank.ng
- **Polaris Bank**: billing@polarisbank.ng
- **Sterling Bank**: accounts@sterlingbank.ng
- **GTBank**: finance@gtbank.com
- **Access Bank**: accounts@accessbank.ng
- **Zenith Bank**: billing@zenithbank.com
- **UBA**: finance@ubagroup.com
- **Fidelity Bank**: accounts@fidelitybank.ng
- **Stanbic IBTC**: finance@stanbicibtc.com

## Testing

### Test Invoice Email (Development)
1. Make sure backend is running: `cd backend && npx ts-node src\index.ts`
2. Make sure web app is running: `cd web && npm run dev`
3. Login at http://localhost:3000 (admin@company.com / Test123456)
4. Navigate to CFO page
5. Click Send on any invoice
6. Click Send Email button
7. Copy the preview URL from the alert message
8. Paste into browser to view the email

### Check Backend Logs
The backend console will show:
```
✅ Email service initialized
📧 Using test account: gl4xllt2abqxc2tc@ethereal.email
✅ Email sent: <message-id>
📧 Preview URL: https://ethereal.email/message/...
```

## Troubleshooting

### "Please login to send emails"
- Make sure you're logged in
- Check localStorage for token: `localStorage.getItem('token')`

### Email not sending
- Check backend is running on port 5000
- Check backend console for error messages
- Verify SMTP configuration in `.env`

### Production emails not delivering
- Verify SMTP credentials are correct
- Check spam folder
- Verify sender domain is authenticated (SPF/DKIM)
- Check email service provider dashboard for bounces

## Security Notes
- All email endpoints require JWT authentication
- SMTP credentials stored in `.env` (never commit to git)
- Test mode uses Ethereal - no real emails sent
- Production mode requires valid SMTP credentials

## Next Steps
1. ✅ Email sending implemented
2. 🔄 Track email delivery status
3. 🔄 Add PDF invoice attachment generation
4. 🔄 Email templates for other modules (tickets, reports)
5. 🔄 Email scheduling and bulk sending
6. 🔄 Email history/audit log
