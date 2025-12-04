# ExecApp - Quick Start Guide

## 🚀 Get Started in 15 Minutes

This guide will get you up and running with ExecApp quickly.

## Prerequisites Check

```powershell
# Check Node.js version (should be 18+)
node --version

# Check npm version
npm --version

# Check PostgreSQL
psql --version

# Check Redis
redis-cli --version
```

If any are missing, install them first (see SETUP_GUIDE.md).

## Quick Setup

### Step 1: Install Dependencies (5 min)

Open PowerShell and run:

```powershell
# Navigate to project
cd c:\Users\Tekpl\OneDrive\Documents\execapp

# Install all dependencies
npm run install:all
```

This installs dependencies for backend, web, and mobile apps.

### Step 2: Database Setup (3 min)

```powershell
# Start PostgreSQL service
Start-Service postgresql*

# Create database
psql -U postgres -c "CREATE DATABASE execapp_db;"

# Start Redis
Start-Service Redis
```

### Step 3: Configure Environment (2 min)

```powershell
# Backend
cd backend
cp .env.example .env

# Edit .env with your settings
notepad .env
```

**Minimum required settings:**
```env
DB_PASSWORD=your_postgres_password
JWT_SECRET=any_random_32_char_string
REFRESH_TOKEN_SECRET=another_random_32_char_string
OPENAI_API_KEY=sk-your_openai_key_if_you_have_one
```

**Web app:**
```powershell
cd ..\web
cp .env.example .env.local
# Default settings work for local development
```

### Step 4: Start Everything (2 min)

Open 3 PowerShell terminals:

**Terminal 1 - Backend:**
```powershell
cd backend
npm run dev
```
Wait for "Server running on port 5000" ✅

**Terminal 2 - Web App:**
```powershell
cd web
npm run dev
```
Wait for "Ready on http://localhost:3000" ✅

**Terminal 3 - Mobile (Optional):**
```powershell
cd mobile
npm start
```

### Step 5: Test It (3 min)

1. **Open Web App:** http://localhost:3000
2. **Create Account:**
   - Click "Register" or go to http://localhost:3000/register
   - Fill in your details
   - Click "Create Account"

3. **Test API:**
   ```powershell
   # Health check
   Invoke-WebRequest -Uri http://localhost:5000/health
   ```

## Common Issues & Fixes

### Issue: "Cannot connect to database"
```powershell
# Check PostgreSQL is running
Get-Service postgresql*
Start-Service postgresql-x64-14
```

### Issue: "Redis connection failed"
```powershell
# Check Redis is running
Get-Service Redis
Start-Service Redis
```

### Issue: "Port 5000 already in use"
```powershell
# Find process using port
netstat -ano | findstr :5000

# Kill process (replace PID with actual number)
taskkill /PID <PID> /F
```

### Issue: Module not found errors
```powershell
# Clean install
cd backend  # or web, or mobile
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

## What's Next?

### 1. Explore the Platform

**Mobile App (Executives):**
- Download Expo Go on your phone
- Scan QR code from mobile terminal
- Login with your account
- Explore dashboard, financial, AI assistant

**Web App (Staff):**
- Go to http://localhost:3000
- Login with your account
- Explore dashboard, tasks, projects

### 2. Test Features

**Create a test transaction:**
```powershell
# Using curl or Postman
$headers = @{
    "Authorization" = "Bearer YOUR_TOKEN_HERE"
    "Content-Type" = "application/json"
}

$body = @{
    amount = 1000
    description = "Test Transaction"
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:5000/api/v1/financial/transactions -Method POST -Headers $headers -Body $body
```

**Test AI features:**
- Open mobile app → AI Assistant
- Type: "What's my financial overview?"
- AI will analyze and respond

### 3. Customize

**Add your logo:**
- Backend: Place in `backend/public/logo.png`
- Web: Place in `web/public/logo.png`
- Mobile: Place in `mobile/assets/logo.png`

**Change colors:**
- Web: Edit `web/tailwind.config.js`
- Mobile: Edit `mobile/src/theme/colors.ts` (create if needed)

### 4. Add Team Members

**Create staff accounts:**
- Executives can invite via mobile app
- Or create directly via API:
```json
POST /api/v1/users/invite
{
  "email": "staff@company.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "staff"
}
```

## Development Workflow

### Making Changes

1. **Backend API:** Edit files in `backend/src/`
2. **Mobile App:** Edit files in `mobile/src/`
3. **Web App:** Edit files in `web/src/`

Changes auto-reload in development mode!

### Adding New Features

**Example: Add new API endpoint**
```typescript
// backend/src/routes/example.routes.ts
import { Router } from 'express';
const router = Router();

router.get('/hello', (req, res) => {
  res.json({ message: 'Hello World!' });
});

export default router;

// Then add to backend/src/index.ts
import exampleRoutes from './routes/example.routes';
app.use('/api/v1/example', exampleRoutes);
```

## Useful Commands

```powershell
# Backend
npm run dev          # Start dev server
npm run build        # Build for production
npm test            # Run tests

# Web
npm run dev         # Start dev server
npm run build       # Build for production
npm run lint        # Check code quality

# Mobile
npm start           # Start Expo
npm run ios         # Run on iOS
npm run android     # Run on Android
```

## Getting Help

### Check Logs

**Backend:**
- Terminal output
- `backend/logs/error.log`
- `backend/logs/combined.log`

**Web:**
- Terminal output
- Browser console (F12)

**Mobile:**
- Expo DevTools (opens automatically)
- Shake device → Debug menu

### Documentation

- `README.md` - Project overview
- `SETUP_GUIDE.md` - Detailed setup instructions
- `ROADMAP.md` - Development roadmap
- Each directory has its own README

### Community

- GitHub Issues - Report bugs
- Discussions - Ask questions

## Production Deployment

When you're ready:

1. **Set up production database**
2. **Configure environment variables**
3. **Build all apps:**
   ```powershell
   cd backend && npm run build
   cd ../web && npm run build
   cd ../mobile && expo build
   ```
4. **Deploy:**
   - Backend → Heroku/AWS/DigitalOcean
   - Web → Vercel/Netlify
   - Mobile → App Store/Play Store

See `SETUP_GUIDE.md` deployment section for details.

## Success Checklist

- [ ] All services running without errors
- [ ] Can create account on web app
- [ ] Can login on mobile app
- [ ] Dashboard loads with data
- [ ] AI features respond
- [ ] No console errors

## Tips for Success

1. **Start simple** - Get basic features working first
2. **Test often** - Don't wait to test
3. **Read errors** - Error messages are helpful
4. **Use Git** - Commit changes frequently
5. **Document changes** - Add comments to your code

## Next Steps

1. ✅ Basic setup complete
2. ⏳ Customize for your business
3. ⏳ Add real data
4. ⏳ Invite team members
5. ⏳ Deploy to production

---

**Questions?** Check `SETUP_GUIDE.md` for detailed information.

**Need Help?** Open an issue on GitHub or contact support.

**Happy Coding! 🎉**
