# Quick Setup Guide for AWS Systems Manager Deployment

## Step 1: Get Your EC2 Instance ID

1. Go to AWS Console: https://console.aws.amazon.com/ec2/
2. Click on **Instances** in the left menu
3. Find your instance (IP: 13.219.183.238)
4. Copy the **Instance ID** (starts with `i-`)
   Example: `i-0123456789abcdef0`

## Step 2: Enable SSM on EC2 Instance

1. In AWS Console, select your EC2 instance
2. Click **Actions** → **Security** → **Modify IAM role**
3. If no role exists:
   - Click **Create new IAM role**
   - Search for: `AmazonSSMManagedInstanceCore`
   - Select it and create the role
4. Attach the role to your instance
5. Wait 5 minutes for SSM agent to register

## Step 3: Update Deployment Script

Open: `deploy-aws-ssm.ps1`

Find this line:
```powershell
$InstanceId = "i-your-instance-id-here"
```

Replace with your actual Instance ID:
```powershell
$InstanceId = "i-0123456789abcdef0"  # Your actual ID
```

## Step 4: Deploy!

Run from PowerShell:
```powershell
cd C:\Users\Tekpl\OneDrive\Documents\execapp
.\deploy-aws-ssm.ps1
```

## Verification

After deployment completes, check:
- Backend: http://13.219.183.238:5000/health
- Frontend: http://13.219.183.238:3000/

## Troubleshooting

**If SSM doesn't work:**
- Verify IAM role is attached to EC2
- Check instance is running
- Wait a few minutes after attaching role

**If deployment fails:**
- Check AWS credentials are correct
- Verify Instance ID is correct
- Check EC2 security groups allow outbound traffic

## Future Deployments

Once set up, just run:
```powershell
.\deploy-aws-ssm.ps1
```

That's it! No SSH keys needed ever again! 🚀
