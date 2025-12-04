# ExecApp Production Deployment Checklist

## Pre-Deployment

### Code Preparation
- [ ] All sample data removed
- [ ] Environment variables configured
- [ ] Build passes locally (`npm run build`)
- [ ] All tests pass
- [ ] Code pushed to GitHub repository
- [ ] `.gitignore` includes `.env` files

### AWS Account Setup
- [ ] AWS account created
- [ ] Billing alerts configured ($10, $25, $50)
- [ ] IAM user created for deployment
- [ ] MFA enabled on root account
- [ ] Payment method added

### Domain & DNS
- [ ] Domain purchased (if needed)
- [ ] DNS records ready to configure
- [ ] SSL certificate plan (Let's Encrypt)

---

## Database Setup (MongoDB Atlas)

- [ ] MongoDB Atlas account created
- [ ] Cluster created (M0 Free Tier or higher)
- [ ] Database user created
- [ ] Password saved securely
- [ ] Network access configured (0.0.0.0/0 or specific IPs)
- [ ] Connection string copied
- [ ] Connection tested from local machine
- [ ] Database name: `execapp`

---

## Backend Deployment (EC2)

### EC2 Instance
- [ ] Instance launched (t3.small or larger)
- [ ] Security group configured:
  - Port 22 (SSH) - Your IP only
  - Port 80 (HTTP) - Anywhere
  - Port 443 (HTTPS) - Anywhere
  - Port 5000 (API) - Temporary/Remove after Nginx setup
- [ ] Key pair downloaded and secured
- [ ] Elastic IP allocated and associated (optional but recommended)

### Server Setup
- [ ] Connected to EC2 via SSH
- [ ] System updated (`sudo apt update && sudo apt upgrade`)
- [ ] Node.js 20.x installed
- [ ] PM2 installed globally
- [ ] Nginx installed
- [ ] Git installed

### Application Setup
- [ ] Repository cloned to `/home/ubuntu/execapp`
- [ ] Backend dependencies installed
- [ ] `.env` file created with production values
- [ ] TypeScript compiled successfully
- [ ] Application starts with PM2
- [ ] PM2 configured for auto-restart on reboot
- [ ] PM2 logs verified (`pm2 logs`)

### Nginx Configuration
- [ ] Nginx config file created
- [ ] Config file symlinked to sites-enabled
- [ ] Nginx config tested (`sudo nginx -t`)
- [ ] Nginx restarted
- [ ] Can access API through Nginx

### SSL Certificate
- [ ] Certbot installed
- [ ] SSL certificate obtained
- [ ] HTTPS working
- [ ] HTTP redirects to HTTPS
- [ ] Auto-renewal configured and tested

---

## Frontend Deployment (AWS Amplify)

- [ ] Code pushed to GitHub
- [ ] AWS Amplify app created
- [ ] Repository connected
- [ ] Branch selected (main/production)
- [ ] Build settings configured (amplify.yml)
- [ ] Environment variables added
- [ ] First build successful
- [ ] Application accessible via Amplify URL
- [ ] Custom domain configured (if applicable)
- [ ] DNS configured
- [ ] SSL certificate provisioned automatically

---

## S3 File Storage

- [ ] S3 bucket created (`execapp-files`)
- [ ] Bucket region matches backend
- [ ] Versioning enabled
- [ ] Server-side encryption enabled
- [ ] Public access blocked
- [ ] IAM user created for S3 access
- [ ] Access keys generated and saved
- [ ] Access keys added to backend .env
- [ ] File upload tested from application

---

## Database Initialization

- [ ] Admin user script run (`node scripts/create-admin.js`)
- [ ] Admin login verified
- [ ] Admin password changed from default
- [ ] Database indexes created (if needed)
- [ ] Sample data cleared (if any)

---

## Security Hardening

### Backend
- [ ] Environment variables secured (no defaults)
- [ ] JWT secret is strong (256-bit random)
- [ ] CORS configured for frontend domain only
- [ ] Rate limiting enabled
- [ ] Security headers configured in Nginx
- [ ] API only accessible via Nginx (not port 5000)
- [ ] SSH key-based auth only (password auth disabled)
- [ ] Firewall rules reviewed

### Database
- [ ] Strong database password
- [ ] Network access restricted
- [ ] Database encryption enabled
- [ ] Regular backups configured
- [ ] Backup restore tested

### AWS
- [ ] Root account MFA enabled
- [ ] IAM users use MFA
- [ ] Least privilege principle applied
- [ ] CloudTrail enabled for audit logs
- [ ] AWS Secrets Manager considered for sensitive data

---

## Monitoring & Logging

- [ ] CloudWatch agent installed (optional)
- [ ] CloudWatch alarms configured:
  - EC2 CPU > 80%
  - EC2 Memory > 85%
  - Disk space > 80%
- [ ] PM2 monitoring enabled
- [ ] Application logs accessible (`pm2 logs`)
- [ ] Nginx logs configured
- [ ] Log rotation configured
- [ ] Uptime monitoring set up (UptimeRobot, Pingdom)
- [ ] Error tracking configured (Sentry - optional)

---

## Backup Strategy

- [ ] MongoDB Atlas automatic backups enabled
- [ ] Backup frequency: Daily
- [ ] Backup retention: 7 days minimum
- [ ] S3 versioning enabled
- [ ] EC2 snapshot schedule created (optional)
- [ ] Backup restore procedure documented
- [ ] Test restore performed

---

## Performance Optimization

- [ ] Gzip compression enabled in Nginx
- [ ] Caching headers configured
- [ ] Database indexes optimized
- [ ] Static assets served efficiently
- [ ] CDN configured for frontend (CloudFront - optional)
- [ ] Application response times < 500ms
- [ ] Database query optimization reviewed

---

## Testing in Production

### Smoke Tests
- [ ] Homepage loads
- [ ] Login works
- [ ] Registration works
- [ ] Dashboard accessible
- [ ] All modules load correctly:
  - [ ] Finance
  - [ ] Projects
  - [ ] CRM
  - [ ] Legal
  - [ ] HR
  - [ ] Marketing
  - [ ] Inbox
- [ ] API endpoints respond correctly
- [ ] File upload works
- [ ] Email sending works (Resend)
- [ ] Mobile responsive design works

### Security Tests
- [ ] HTTPS enforced
- [ ] XSS protection verified
- [ ] CSRF protection verified
- [ ] SQL injection prevention verified
- [ ] Authentication required for protected routes
- [ ] Authorization working correctly

### Performance Tests
- [ ] Page load times < 3 seconds
- [ ] API response times < 500ms
- [ ] No memory leaks
- [ ] Concurrent users handled (10, 50, 100)
- [ ] Database connection pool working

---

## Documentation

- [ ] Deployment guide updated
- [ ] Environment variables documented
- [ ] API documentation current
- [ ] User guide created
- [ ] Admin guide created
- [ ] Troubleshooting guide created
- [ ] Runbook for common operations
- [ ] Emergency contact list
- [ ] Incident response plan

---

## Launch Preparation

- [ ] All team members trained
- [ ] Support email configured
- [ ] Terms of Service published
- [ ] Privacy Policy published
- [ ] Contact page working
- [ ] Analytics configured (optional)
- [ ] Status page set up (optional)
- [ ] Marketing materials ready
- [ ] Launch date confirmed

---

## Post-Launch

### Immediate (First 24 Hours)
- [ ] Monitor error logs closely
- [ ] Check server resources (CPU, RAM, Disk)
- [ ] Verify all features working
- [ ] Address any critical issues immediately
- [ ] User feedback collected

### First Week
- [ ] Daily monitoring
- [ ] Performance metrics reviewed
- [ ] User feedback addressed
- [ ] Bug fixes deployed
- [ ] Backup integrity verified

### First Month
- [ ] Weekly reviews
- [ ] Performance optimization
- [ ] Feature requests prioritized
- [ ] Security audit performed
- [ ] Cost optimization reviewed

---

## Maintenance Schedule

### Daily
- [ ] Check PM2 status
- [ ] Review error logs
- [ ] Monitor server resources

### Weekly
- [ ] Review CloudWatch metrics
- [ ] Check backup integrity
- [ ] Security updates applied
- [ ] Performance review

### Monthly
- [ ] Full security audit
- [ ] Cost analysis and optimization
- [ ] Dependency updates
- [ ] Database maintenance
- [ ] SSL certificate renewal check

---

## Emergency Contacts

- AWS Support: [Your AWS Support Plan]
- MongoDB Atlas: support@mongodb.com
- Domain Registrar: [Your Registrar]
- Development Team: [Your Email]
- DevOps Lead: [Your Email]

---

## Rollback Plan

In case of critical issues:

1. **Frontend Rollback**
   - AWS Amplify → Deployment → Previous Version → Redeploy

2. **Backend Rollback**
   ```bash
   cd /home/ubuntu/execapp/backend
   git checkout [previous-commit-hash]
   npm install
   npm run build
   pm2 restart execapp-backend
   ```

3. **Database Rollback**
   - Restore from MongoDB Atlas backup
   - Use point-in-time restore if available

---

## Success Criteria

- [ ] Zero downtime during deployment
- [ ] All features working as expected
- [ ] Performance meets requirements
- [ ] Security standards met
- [ ] Monitoring in place
- [ ] Backups verified
- [ ] Team trained and ready
- [ ] Users can access and use the application

---

**Date Deployed:** _________________

**Deployed By:** _________________

**Version:** _________________

**Notes:**
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
