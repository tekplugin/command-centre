# 🚀 Quick Start - AWS Deployment

This guide will get ExecApp running on AWS in ~30 minutes.

---

## Step 1: MongoDB Atlas (5 minutes)

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up → Create FREE cluster
3. Choose AWS, us-east-1
4. Wait for cluster to deploy (2-3 mins)
5. Database Access → Add Database User
   - Username: `execapp_admin`
   - Password: [Generate & Save]
6. Network Access → Add IP: `0.0.0.0/0`
7. Click "Connect" → Copy connection string
8. Save connection string for later

**Connection String Format:**
```
mongodb+srv://execapp_admin:PASSWORD@cluster0.xxxxx.mongodb.net/execapp?retryWrites=true&w=majority
```

---

## Step 2: Launch EC2 (10 minutes)

### 2.1 Create Instance
```
AWS Console → EC2 → Launch Instance

Name: execapp-backend
AMI: Ubuntu Server 22.04 LTS (Free tier)
Instance type: t3.small ($15/month)
Key pair: Create new → Download .pem file

Network:
  ✓ Allow SSH (22) - Your IP
  ✓ Allow HTTP (80) - Anywhere
  ✓ Allow HTTPS (443) - Anywhere

Storage: 20GB gp3

Launch Instance
```

### 2.2 Connect to EC2
```powershell
# Windows
ssh -i "your-key.pem" ubuntu@YOUR-EC2-PUBLIC-IP
```

### 2.3 Install Software
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install Git
sudo apt install -y git

# Verify installations
node --version  # Should show v20.x
npm --version
pm2 --version
nginx -v
```

---

## Step 3: Deploy Backend (10 minutes)

### 3.1 Clone & Setup
```bash
cd /home/ubuntu
git clone https://github.com/YOUR-USERNAME/execapp.git
cd execapp/backend
npm install
```

### 3.2 Create .env File
```bash
nano .env
```

Paste this (replace with your values):
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://execapp_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/execapp?retryWrites=true&w=majority
JWT_SECRET=YOUR_RANDOM_256_BIT_SECRET_KEY_HERE_CHANGE_THIS_NOW
RESEND_API_KEY=re_YOUR_RESEND_KEY
FRONTEND_URL=https://your-frontend-url.amplifyapp.com
```

Press `Ctrl+X`, then `Y`, then `Enter` to save.

### 3.3 Build & Start
```bash
# Build TypeScript
npm run build

# Start with PM2
pm2 start dist/index.js --name execapp-backend

# Save PM2 config
pm2 save

# Auto-start on reboot
pm2 startup
# Run the command it outputs

# Check status
pm2 status
pm2 logs execapp-backend
```

### 3.4 Create Admin User
```bash
node scripts/create-admin.js
# Saves admin@company.com / Admin@123456
```

---

## Step 4: Configure Nginx (5 minutes)

### 4.1 Create Config
```bash
sudo nano /etc/nginx/sites-available/execapp
```

Paste this:
```nginx
server {
    listen 80;
    server_name YOUR-EC2-PUBLIC-IP;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Save and enable:
```bash
sudo ln -s /etc/nginx/sites-available/execapp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 4.2 Test Backend
```bash
curl http://YOUR-EC2-PUBLIC-IP/health
# Should return: {"status":"ok","timestamp":"..."}
```

---

## Step 5: Deploy Frontend (5 minutes)

### 5.1 Push to GitHub
```powershell
# On your local machine
cd C:\Users\Tekpl\OneDrive\Documents\execapp\web

# Initialize git (if not done)
git init
git add .
git commit -m "Production deployment"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/execapp-web.git
git push -u origin main
```

### 5.2 Deploy with Amplify
```
AWS Console → AWS Amplify → New app → Host web app

1. Select GitHub
2. Authorize AWS Amplify
3. Select repository: execapp-web
4. Select branch: main
5. App name: execapp
6. Build settings: Auto-detected ✓
7. Advanced settings → Add environment variable:
   - NEXT_PUBLIC_API_URL = http://YOUR-EC2-PUBLIC-IP
8. Save and Deploy

Wait 5 minutes for build to complete
```

### 5.3 Test Application
```
1. Click the Amplify URL (https://main.xxxxx.amplifyapp.com)
2. Login with: admin@company.com / Admin@123456
3. Change password immediately!
```

---

## Step 6: SSL Certificate (Optional - 5 minutes)

### 6.1 Get Domain
If you have a domain (e.g., api.execapp.com), point it to your EC2 IP.

### 6.2 Install Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.execapp.com
```

Follow prompts → Auto-redirects HTTP to HTTPS!

### 6.3 Update Amplify
```
Amplify → Environment variables
Change: NEXT_PUBLIC_API_URL = https://api.execapp.com
Redeploy
```

---

## ✅ You're Live!

Your application is now running on AWS!

**Access:**
- Frontend: `https://main.xxxxx.amplifyapp.com`
- Backend: `http://YOUR-EC2-IP` or `https://api.yourdomain.com`

**Default Admin:**
- Email: `admin@company.com`
- Password: `Admin@123456`

⚠️ **IMPORTANT:** Change the admin password immediately!

---

## Common Commands

### Check Backend Status
```bash
pm2 status
pm2 logs execapp-backend
pm2 monit
```

### Restart Backend
```bash
pm2 restart execapp-backend
```

### Update Code
```bash
cd /home/ubuntu/execapp/backend
git pull
npm install
npm run build
pm2 restart execapp-backend
```

### Check Nginx
```bash
sudo nginx -t
sudo systemctl status nginx
sudo systemctl restart nginx
```

### View Logs
```bash
# Application logs
pm2 logs execapp-backend

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## Troubleshooting

### Backend won't start
```bash
pm2 logs execapp-backend  # Check for errors
node dist/index.js  # Test directly
```

### Can't connect to database
```bash
# Test connection
node -e "const m=require('mongoose');m.connect('YOUR_URI').then(()=>console.log('OK')).catch(e=>console.error(e))"
```

### Nginx errors
```bash
sudo nginx -t  # Test config
sudo systemctl status nginx  # Check status
```

### Frontend build fails
- Check Amplify console logs
- Verify environment variables
- Test build locally: `npm run build`

---

## Cost Breakdown

**Monthly Costs:**
- EC2 t3.small: ~$15
- MongoDB Atlas (Free Tier): $0
- AWS Amplify: $0 (free tier) or ~$15
- S3 Storage: ~$1-3
- Data Transfer: ~$5

**Total: ~$21-38/month**

---

## Next Steps

1. ✅ Change admin password
2. ✅ Set up custom domain
3. ✅ Configure SSL
4. ✅ Set up CloudWatch alarms
5. ✅ Enable backups
6. ✅ Add team members
7. ✅ Configure email settings
8. ✅ Test all features

---

## Need Help?

- Full Guide: See `AWS_DEPLOYMENT.md`
- Checklist: See `DEPLOYMENT_CHECKLIST.md`
- Issues: Check CloudWatch logs

Good luck! 🚀
