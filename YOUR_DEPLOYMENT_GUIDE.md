# 🚀 Command Centre Deployment - YOUR CUSTOM GUIDE

**Your Details:**
- Domain: chiayii.resend.app
- MongoDB: ✅ Connected to Cluster0
- Resend: ✅ API Key configured
- AWS Account: ✅ Ready
- GitHub: ✅ Ready

---

## 📋 DEPLOYMENT CHECKLIST

### Phase 1: Push Code to GitHub (5 minutes)

```powershell
# Navigate to your project
cd C:\Users\Tekpl\OneDrive\Documents\execapp

# Initialize Git (if not done)
git init
git add .
git commit -m "Initial Command Centre deployment"

# Create GitHub repository
# Go to: https://github.com/new
# Repository name: command-centre
# Make it Private
# DON'T initialize with README

# Push to GitHub
git remote add origin https://github.com/YOUR-USERNAME/command-centre.git
git branch -M main
git push -u origin main
```

### Phase 2: Deploy Backend to AWS EC2 (20 minutes)

#### 2.1 Launch EC2 Instance

1. Go to AWS Console → EC2 → Launch Instance
2. Configure:
   ```
   Name: command-centre-backend
   AMI: Ubuntu Server 22.04 LTS
   Instance Type: t3.small
   Key Pair: Create new → Download .pem file
   
   Security Group:
   - SSH (22) - Your IP only
   - HTTP (80) - Anywhere
   - HTTPS (443) - Anywhere
   - Custom TCP (5000) - Anywhere (temporary)
   
   Storage: 20GB gp3
   ```
3. Click "Launch Instance"
4. Wait 2 minutes for instance to start
5. Copy the **Public IPv4 address**

#### 2.2 Connect to EC2

```powershell
# Replace with your .pem file name and EC2 IP
ssh -i "your-key.pem" ubuntu@YOUR-EC2-IP
```

#### 2.3 Install Software on EC2

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
node --version
npm --version
pm2 --version
nginx -v
```

#### 2.4 Clone and Setup Backend

```bash
# Clone repository
cd /home/ubuntu
git clone https://github.com/YOUR-USERNAME/command-centre.git
cd command-centre/backend

# Install dependencies
npm install

# Create .env file
nano .env
```

**Paste this into .env:**
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://ofolufemi_db_user:rBqGV9U6EgIEUz1Q@cluster0.itaxd2n.mongodb.net/commandcentre?retryWrites=true&w=majority
JWT_SECRET=en3970XQZJGg5Ohum1K8BMNSljWFCcozIfPasRUYVkb4qrxtpwDEH6dTL2ivAy
JWT_EXPIRES_IN=7d
RESEND_API_KEY=re_Deb38n68_HbuwY1KppJ4yJRtP6yw8aD8p
FRONTEND_URL=https://chiayii.resend.app
AWS_REGION=us-east-1
```

Save: `Ctrl+X`, then `Y`, then `Enter`

#### 2.5 Build and Start Backend

```bash
# Build TypeScript
npm run build

# Start with PM2
pm2 start dist/index.js --name command-centre-backend

# Save PM2 config
pm2 save

# Auto-start on reboot
pm2 startup
# Run the command it shows

# Check status
pm2 status
pm2 logs command-centre-backend
```

#### 2.6 Create Admin User

```bash
# Create admin
node scripts/create-admin.js
```

**Default credentials:**
- Email: admin@company.com
- Password: Admin@123456

#### 2.7 Configure Nginx

```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/command-centre
```

**Paste this:**
```nginx
server {
    listen 80;
    server_name YOUR-EC2-IP;

    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Save and enable:
```bash
sudo ln -s /etc/nginx/sites-available/command-centre /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 2.8 Test Backend

```bash
curl http://YOUR-EC2-IP/health
# Should return: {"status":"ok","timestamp":"..."}
```

---

### Phase 3: Deploy Frontend to AWS Amplify (10 minutes)

#### 3.1 Push Frontend to GitHub

```powershell
cd C:\Users\Tekpl\OneDrive\Documents\execapp\web

# Create separate repo for frontend
git init
git add .
git commit -m "Command Centre frontend"
git remote add origin https://github.com/YOUR-USERNAME/command-centre-web.git
git push -u origin main
```

#### 3.2 Deploy with AWS Amplify

1. Go to AWS Console → AWS Amplify
2. Click "New app" → "Host web app"
3. Select "GitHub" → Authorize
4. Choose repository: `command-centre-web`
5. Branch: `main`
6. Build settings (auto-detected) ✓
7. **Add Environment Variables:**
   ```
   NEXT_PUBLIC_API_URL = http://YOUR-EC2-IP
   ```
8. Click "Save and Deploy"
9. Wait 5-10 minutes for build

#### 3.3 Get Your URL

- After deployment completes, you'll get a URL like:
  `https://main.xxxxx.amplifyapp.com`

#### 3.4 Update Backend CORS

```bash
# SSH back to EC2
ssh -i "your-key.pem" ubuntu@YOUR-EC2-IP

cd /home/ubuntu/command-centre/backend
nano .env

# Update FRONTEND_URL to your Amplify URL:
FRONTEND_URL=https://main.xxxxx.amplifyapp.com

# Restart backend
pm2 restart command-centre-backend
```

---

### Phase 4: Setup SSL (Optional - 5 minutes)

If you want to use a custom domain:

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d api.chiayii.com

# Auto-renew
sudo certbot renew --dry-run
```

Update Amplify environment variable to HTTPS:
```
NEXT_PUBLIC_API_URL = https://api.chiayii.com
```

---

### Phase 5: Create S3 Bucket (5 minutes)

1. AWS Console → S3 → Create bucket
   ```
   Bucket name: command-centre-files-YOUR-UNIQUE-ID
   Region: us-east-1
   Block Public Access: Keep enabled
   Versioning: Enable
   Encryption: Enable (AES-256)
   ```

2. Create IAM User for S3:
   - IAM → Users → Add user
   - Name: `command-centre-s3`
   - Access: Programmatic
   - Permissions: AmazonS3FullAccess
   - Copy Access Key ID and Secret

3. Update backend .env:
   ```bash
   nano /home/ubuntu/command-centre/backend/.env
   
   # Add:
   AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY
   AWS_SECRET_ACCESS_KEY=YOUR_SECRET_KEY
   AWS_S3_BUCKET=command-centre-files-YOUR-UNIQUE-ID
   
   # Restart
   pm2 restart command-centre-backend
   ```

---

## ✅ POST-DEPLOYMENT CHECKLIST

- [ ] Backend running on EC2: `http://YOUR-EC2-IP`
- [ ] Frontend running on Amplify: `https://main.xxxxx.amplifyapp.com`
- [ ] Can login with admin@company.com / Admin@123456
- [ ] All modules accessible
- [ ] Change admin password immediately!
- [ ] Test file uploads
- [ ] Test email sending
- [ ] Set up CloudWatch monitoring
- [ ] Configure database backups
- [ ] Review security groups

---

## 📊 Your Infrastructure

```
┌─────────────────────────────────────┐
│  Frontend (AWS Amplify)             │
│  https://main.xxxxx.amplifyapp.com  │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Backend (EC2 t3.small)             │
│  http://YOUR-EC2-IP                 │
│  + Nginx Reverse Proxy              │
│  + PM2 Process Manager              │
└──────────────┬──────────────────────┘
               │
               ├───► MongoDB Atlas (Free Tier)
               ├───► Resend Email Service
               └───► AWS S3 File Storage
```

---

## 💰 Monthly Costs

- EC2 t3.small: ~$15
- MongoDB Atlas: $0 (free tier)
- AWS Amplify: $0 (free tier) or ~$15
- S3 Storage: ~$1-3
- Data Transfer: ~$5
- **Total: ~$21-38/month**

---

## 🆘 Quick Commands

**Backend Management:**
```bash
pm2 status
pm2 logs command-centre-backend
pm2 restart command-centre-backend
pm2 monit
```

**Update Code:**
```bash
cd /home/ubuntu/command-centre/backend
git pull
npm install
npm run build
pm2 restart command-centre-backend
```

**Check Logs:**
```bash
pm2 logs command-centre-backend --lines 100
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

**Nginx:**
```bash
sudo nginx -t
sudo systemctl status nginx
sudo systemctl restart nginx
```

---

## 🎉 YOU'RE READY TO DEPLOY!

**Next Steps:**
1. Follow Phase 1 to push code to GitHub
2. Follow Phase 2 to deploy backend
3. Follow Phase 3 to deploy frontend
4. Test everything
5. Go live!

**Need help?** Check:
- Full guide: `AWS_DEPLOYMENT.md`
- Quick start: `QUICK_START.md`
- Checklist: `DEPLOYMENT_CHECKLIST.md`

Good luck! 🚀
