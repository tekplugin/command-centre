# AWS Production Deployment Guide

## Overview
This guide covers deploying ExecApp to AWS using:
- **Frontend (Next.js)**: AWS Amplify or S3 + CloudFront
- **Backend (Node.js/Express)**: AWS EC2 or ECS
- **Database**: MongoDB Atlas (managed) or AWS DocumentDB
- **File Storage**: AWS S3
- **Email**: Already using Resend (no change needed)

---

## Architecture Options

### Option 1: Simple & Cost-Effective (Recommended for MVP)
- **Frontend**: AWS Amplify (auto-deploy from GitHub)
- **Backend**: Single EC2 t3.small instance
- **Database**: MongoDB Atlas (free tier)
- **Storage**: AWS S3
- **Cost**: ~$15-30/month

### Option 2: Scalable & Production-Ready
- **Frontend**: S3 + CloudFront
- **Backend**: ECS Fargate with Auto Scaling
- **Database**: AWS DocumentDB
- **Storage**: AWS S3
- **Load Balancer**: Application Load Balancer
- **Cost**: ~$100-200/month

---

## Prerequisites

1. **AWS Account**
   - Sign up at https://aws.amazon.com
   - Set up billing alerts

2. **Domain Name** (Optional but recommended)
   - Register via Route 53 or external provider
   - Example: execapp.com

3. **Environment Variables**
   ```bash
   # Backend
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_secure_jwt_secret_256_bits
   RESEND_API_KEY=your_resend_key
   AWS_ACCESS_KEY_ID=your_aws_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret
   AWS_REGION=us-east-1
   AWS_S3_BUCKET=execapp-files
   
   # Frontend
   NEXT_PUBLIC_API_URL=https://api.execapp.com
   ```

---

## Step-by-Step Deployment (Option 1)

### Part 1: Database Setup (MongoDB Atlas)

1. **Create MongoDB Atlas Account**
   ```
   - Visit https://www.mongodb.com/cloud/atlas
   - Sign up for free tier (512MB storage)
   - Create a cluster (AWS, us-east-1 recommended)
   ```

2. **Configure Database**
   ```
   - Go to Database Access → Add New Database User
   - Username: execapp_admin
   - Password: Generate strong password
   - Database User Privileges: Atlas admin
   
   - Go to Network Access → Add IP Address
   - Add: 0.0.0.0/0 (Allow from anywhere - for EC2)
   - Or add your EC2 instance IP later
   ```

3. **Get Connection String**
   ```
   - Click "Connect" → "Connect your application"
   - Copy connection string
   - Replace <password> with your password
   - Format: mongodb+srv://execapp_admin:<password>@cluster0.xxxxx.mongodb.net/execapp?retryWrites=true&w=majority
   ```

### Part 2: Backend Deployment (EC2)

1. **Launch EC2 Instance**
   ```bash
   # AWS Console → EC2 → Launch Instance
   
   Name: execapp-backend
   AMI: Ubuntu Server 22.04 LTS
   Instance Type: t3.small (2 vCPU, 2GB RAM)
   Key Pair: Create new or use existing
   
   Network Settings:
   - Allow SSH (port 22) from your IP
   - Allow HTTP (port 80) from anywhere
   - Allow HTTPS (port 443) from anywhere
   - Allow Custom TCP (port 5000) from anywhere (temporary)
   
   Storage: 20GB gp3
   ```

2. **Connect to EC2**
   ```powershell
   # Download .pem key file
   ssh -i "your-key.pem" ubuntu@your-ec2-public-ip
   ```

3. **Install Dependencies**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js 20.x
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs
   
   # Install PM2 (process manager)
   sudo npm install -g pm2
   
   # Install Nginx
   sudo apt install -y nginx
   
   # Install Git
   sudo apt install -y git
   ```

4. **Clone and Setup Backend**
   ```bash
   # Create app directory
   cd /home/ubuntu
   git clone https://github.com/your-username/execapp.git
   cd execapp/backend
   
   # Install dependencies
   npm install
   
   # Create .env file
   nano .env
   ```
   
   Paste your environment variables:
   ```env
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=your_256_bit_secret_key_here
   RESEND_API_KEY=re_...
   AWS_ACCESS_KEY_ID=AKIA...
   AWS_SECRET_ACCESS_KEY=...
   AWS_REGION=us-east-1
   AWS_S3_BUCKET=execapp-files
   FRONTEND_URL=https://your-frontend-url.com
   ```

5. **Build Backend**
   ```bash
   # Build TypeScript
   npm run build
   
   # Test run
   npm start
   ```

6. **Setup PM2**
   ```bash
   # Start with PM2
   pm2 start dist/index.js --name execapp-backend
   
   # Save PM2 configuration
   pm2 save
   
   # Setup PM2 to start on system boot
   pm2 startup
   # Run the command it outputs
   
   # Monitor
   pm2 status
   pm2 logs execapp-backend
   ```

7. **Configure Nginx Reverse Proxy**
   ```bash
   sudo nano /etc/nginx/sites-available/execapp
   ```
   
   Add configuration:
   ```nginx
   server {
       listen 80;
       server_name api.execapp.com;  # Your API domain
   
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
   
   Enable site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/execapp /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

8. **Setup SSL with Let's Encrypt**
   ```bash
   # Install Certbot
   sudo apt install -y certbot python3-certbot-nginx
   
   # Get SSL certificate
   sudo certbot --nginx -d api.execapp.com
   
   # Auto-renewal is set up automatically
   # Test renewal
   sudo certbot renew --dry-run
   ```

### Part 3: S3 Setup for File Storage

1. **Create S3 Bucket**
   ```bash
   # AWS Console → S3 → Create Bucket
   
   Bucket name: execapp-files
   Region: us-east-1
   
   Block Public Access: Keep enabled
   Versioning: Enable
   Server-side encryption: Enable (AES-256)
   ```

2. **Create IAM User for S3 Access**
   ```bash
   # AWS Console → IAM → Users → Add User
   
   User name: execapp-s3-user
   Access type: Programmatic access
   
   Permissions: Attach policies directly
   - AmazonS3FullAccess (or create custom policy)
   
   # Save Access Key ID and Secret Access Key
   ```

3. **Update Backend .env**
   ```bash
   AWS_ACCESS_KEY_ID=AKIA...
   AWS_SECRET_ACCESS_KEY=...
   AWS_REGION=us-east-1
   AWS_S3_BUCKET=execapp-files
   ```

### Part 4: Frontend Deployment (AWS Amplify)

1. **Push Code to GitHub**
   ```powershell
   # From your local machine
   cd C:\Users\Tekpl\OneDrive\Documents\execapp\web
   
   git init
   git add .
   git commit -m "Initial production deployment"
   git branch -M main
   git remote add origin https://github.com/your-username/execapp-web.git
   git push -u origin main
   ```

2. **Deploy with AWS Amplify**
   ```
   AWS Console → AWS Amplify → New App → Host web app
   
   - Select GitHub
   - Authorize and select repository
   - Choose branch: main
   - Build settings (auto-detected):
   ```
   
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm install
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
         - .next/cache/**/*
   ```

3. **Configure Environment Variables**
   ```
   Amplify Console → App Settings → Environment Variables
   
   Add:
   NEXT_PUBLIC_API_URL = https://api.execapp.com
   ```

4. **Custom Domain** (Optional)
   ```
   - Go to Domain Management
   - Add domain: execapp.com
   - Follow DNS configuration instructions
   - SSL certificate is auto-provisioned
   ```

### Part 5: Database Initialization

1. **Create Initial Admin User**
   ```bash
   # SSH into EC2
   ssh -i "your-key.pem" ubuntu@your-ec2-ip
   
   cd /home/ubuntu/execapp/backend
   
   # Create a script to add admin user
   nano scripts/create-admin.js
   ```
   
   ```javascript
   const mongoose = require('mongoose');
   const bcrypt = require('bcryptjs');
   require('dotenv').config();
   
   const User = require('../dist/models/User').default;
   
   async function createAdmin() {
     await mongoose.connect(process.env.MONGODB_URI);
     
     const hashedPassword = await bcrypt.hash('Admin@123456', 10);
     
     const admin = new User({
       email: 'admin@company.com',
       password: hashedPassword,
       firstName: 'Admin',
       lastName: 'User',
       companyName: 'ATM Solutions Ltd',
       role: 'admin',
     });
     
     await admin.save();
     console.log('Admin user created!');
     process.exit(0);
   }
   
   createAdmin().catch(console.error);
   ```
   
   Run it:
   ```bash
   node scripts/create-admin.js
   ```

---

## Post-Deployment Checklist

### Security
- [ ] Change default admin password
- [ ] Enable AWS CloudWatch for monitoring
- [ ] Set up AWS CloudTrail for audit logs
- [ ] Configure AWS WAF for DDoS protection
- [ ] Enable MFA on AWS root account
- [ ] Restrict EC2 security group (port 5000 only from Nginx)
- [ ] Set up AWS Secrets Manager for sensitive data
- [ ] Configure CORS properly in backend

### Monitoring
- [ ] Set up CloudWatch alarms for EC2 CPU/Memory
- [ ] Configure PM2 monitoring: `pm2 install pm2-logrotate`
- [ ] Set up uptime monitoring (UptimeRobot, Pingdom)
- [ ] Configure error tracking (Sentry)
- [ ] Set up log aggregation

### Backups
- [ ] Enable MongoDB Atlas automatic backups
- [ ] Configure S3 versioning and lifecycle policies
- [ ] Set up automated database backups
- [ ] Test restore procedures

### Performance
- [ ] Enable CloudFront CDN for frontend
- [ ] Configure caching headers
- [ ] Optimize images and assets
- [ ] Enable Gzip compression in Nginx
- [ ] Set up database indexes

### Documentation
- [ ] Document all credentials in password manager
- [ ] Create runbook for common operations
- [ ] Document backup/restore procedures
- [ ] Create incident response plan

---

## Maintenance Commands

### Backend (EC2)
```bash
# SSH into server
ssh -i "your-key.pem" ubuntu@your-ec2-ip

# Check PM2 status
pm2 status
pm2 logs execapp-backend

# Restart backend
pm2 restart execapp-backend

# Update code
cd /home/ubuntu/execapp/backend
git pull
npm install
npm run build
pm2 restart execapp-backend

# Monitor resources
htop
df -h
free -m

# Check Nginx
sudo nginx -t
sudo systemctl status nginx
sudo systemctl restart nginx

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Database (MongoDB Atlas)
```bash
# Connect via mongosh
mongosh "mongodb+srv://cluster0.xxxxx.mongodb.net/execapp" --username execapp_admin

# Backup
mongodump --uri="mongodb+srv://..." --out=/backup/

# Restore
mongorestore --uri="mongodb+srv://..." /backup/
```

### AWS S3
```bash
# List files
aws s3 ls s3://execapp-files/

# Sync local to S3
aws s3 sync ./uploads s3://execapp-files/

# Download backup
aws s3 sync s3://execapp-files/ ./backup/
```

---

## Scaling & Optimization

### When to Scale
- CPU > 70% consistently
- Memory > 80%
- Response times > 500ms
- Traffic > 1000 concurrent users

### Vertical Scaling (Easier)
```bash
# Stop instance
# Change instance type to t3.medium or t3.large
# Start instance
```

### Horizontal Scaling (Better)
1. Set up Application Load Balancer
2. Create Auto Scaling Group
3. Use Amazon RDS or DocumentDB for database
4. Implement Redis for caching
5. Move to ECS/Fargate for containerization

---

## Cost Optimization

### Monthly Cost Breakdown
```
EC2 t3.small (backend):        $15
MongoDB Atlas (free tier):     $0
S3 (100GB + requests):         $3
Amplify (frontend):            $0 (free tier) or $15
Route 53 (domain):             $1
Data Transfer:                 $5-10

Total: ~$24-44/month
```

### Savings Tips
- Use Reserved Instances (40-60% discount)
- Enable S3 Intelligent-Tiering
- Set up CloudWatch billing alarms
- Delete unused resources
- Use AWS Cost Explorer

---

## Troubleshooting

### Backend Won't Start
```bash
# Check logs
pm2 logs execapp-backend

# Check environment variables
cat /home/ubuntu/execapp/backend/.env

# Test MongoDB connection
node -e "const mongoose = require('mongoose'); mongoose.connect('your-uri').then(() => console.log('Connected!')).catch(e => console.error(e));"

# Check port 5000
sudo netstat -tlnp | grep 5000
```

### Frontend Build Fails
```
# Check Amplify build logs in console
# Verify environment variables
# Test build locally:
npm run build
```

### Database Connection Issues
```
# Verify IP whitelist in MongoDB Atlas
# Check connection string
# Test from EC2:
telnet cluster0.xxxxx.mongodb.net 27017
```

### SSL Certificate Issues
```bash
# Renew manually
sudo certbot renew

# Check certificate status
sudo certbot certificates
```

---

## Alternative: Deploy Everything with Docker

If you prefer containerization:

1. **Create Dockerfile for Backend**
2. **Push to Amazon ECR**
3. **Deploy with ECS Fargate**
4. **Use RDS instead of MongoDB Atlas**

Let me know if you want the Docker deployment guide!

---

## Support & Resources

- AWS Documentation: https://docs.aws.amazon.com
- MongoDB Atlas Docs: https://docs.mongodb.com/atlas
- Next.js Deployment: https://nextjs.org/docs/deployment
- PM2 Documentation: https://pm2.keymetrics.io/docs/usage/quick-start/

---

## Next Steps

1. ✅ Remove all sample data (Done)
2. 📝 Create AWS account
3. 🗄️ Set up MongoDB Atlas
4. 🖥️ Launch EC2 and deploy backend
5. 📦 Configure S3 for file storage
6. 🌐 Deploy frontend with Amplify
7. 🔒 Configure SSL and security
8. 📊 Set up monitoring
9. 🧪 Test everything thoroughly
10. 🚀 Go live!

Good luck with your deployment! Let me know if you need help with any specific step.
