#!/bin/bash
# Update Production Environment Configuration
# Run this script in AWS Session Manager

cd /home/ec2-user/command-centre/backend

# Backup existing .env
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)

# Create new .env file
cat > .env << 'EOF'
# Production Environment Variables
NODE_ENV=production
PORT=5000
API_VERSION=v1

# Database - MongoDB Atlas
MONGODB_URI=mongodb+srv://ofolufemi_db_user:FOlKIHdRxPwriQXs@cluster0.itaxd2n.mongodb.net/?appName=Cluster0

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Security - JWT
JWT_SECRET=prod_secret_key_change_this_to_something_secure_12345678
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=prod_refresh_secret_change_this_too_87654321
REFRESH_TOKEN_EXPIRES_IN=30d

# OpenAI
OPENAI_API_KEY=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
OPENAI_MODEL=gpt-4-turbo-preview

# Plaid (Banking Integration)
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_secret
PLAID_ENV=sandbox

# Email SMTP Configuration
SMTP_HOST=tekplugin.com
SMTP_PORT=465
SMTP_USER=ofolufemi@tekplugin.com
SMTP_PASS="40{GA~k#,c{f"
SMTP_FROM="Tekplugin Ltd<ofolufemi@tekplugin.com>"

# Resend (Email Service)
RESEND_API_KEY="re_N1HTHQ3M_CwKpLkvfxHqLdMBzGhcgeCzk"
RESEND_WEBHOOK_SECRET="whsec_JvZf4opUz6wcUEc6k4bxExSQ716z8aLi"
RESEND_FROM_EMAIL=noreply@chiayii.resend.dev
RESEND_TO_EMAIL=support@chiayii.resend.dev
RESEND_DOMAIN=chiayii.resend.dev

# Frontend URL for password reset emails
FRONTEND_URL=http://13.219.183.238:3000

# AWS S3 (File Storage)
AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_KEY
AWS_REGION=us-east-1
AWS_S3_BUCKET=command-centre-files

# Security
ENCRYPTION_KEY=your_encryption_key_here_32_chars
BCRYPT_ROUNDS=10

# CORS
CORS_ORIGIN=http://13.219.183.238:3000,http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EOF

echo ""
echo "✅ Production .env file updated!"
echo ""
echo "Now restart the services:"
echo "pm2 restart command-centre"
echo "pm2 save"
echo ""
echo "Then test password reset:"
echo "npm run reset-password ofolufemi@tekplugin.com 'YourPassword123!'"
echo ""
