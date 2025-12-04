# ExecApp - Complete Setup Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Project Overview](#project-overview)
3. [Backend Setup](#backend-setup)
4. [Mobile App Setup](#mobile-app-setup)
5. [Web App Setup](#web-app-setup)
6. [Configuration](#configuration)
7. [Running the Full Stack](#running-the-full-stack)
8. [API Documentation](#api-documentation)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software
- **Node.js** 18.x or higher
- **npm** 9.x or higher (comes with Node.js)
- **PostgreSQL** 14.x or higher
- **Redis** 6.x or higher

### Optional (for mobile development)
- **iOS**: Xcode 14+ (macOS only)
- **Android**: Android Studio with Android SDK

### API Keys Required
- **OpenAI API Key** (for AI features)
- **Plaid Account** (for banking integration)
- **AWS Account** (for file storage - optional)

## Project Overview

ExecApp is a comprehensive AI-driven management platform consisting of:

1. **Backend API** (Node.js/Express + PostgreSQL)
   - RESTful API
   - Real-time WebSocket support
   - AI service integration
   - Banking API integration

2. **Mobile App** (React Native/Expo)
   - Executive-level dashboard
   - iOS and Android support
   - Biometric authentication
   - Real-time notifications

3. **Web App** (Next.js)
   - Staff portal
   - Data input and management
   - Responsive design
   - Server-side rendering

## Backend Setup

### 1. Install PostgreSQL

**Windows:**
```powershell
# Download from https://www.postgresql.org/download/windows/
# Or use Chocolatey:
choco install postgresql
```

### 2. Install Redis

**Windows:**
```powershell
# Download from https://github.com/microsoftarchive/redis/releases
# Or use Chocolatey:
choco install redis-64
```

### 3. Create Database

```powershell
# Connect to PostgreSQL
psql -U postgres

# In psql:
CREATE DATABASE execapp_db;
\q
```

### 4. Backend Configuration

```powershell
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env file with your settings
notepad .env
```

**Required Environment Variables:**
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=execapp_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password

# JWT Secrets (generate secure random strings)
JWT_SECRET=your_secure_jwt_secret_here
REFRESH_TOKEN_SECRET=your_secure_refresh_token_secret

# OpenAI
OPENAI_API_KEY=sk-your_openai_api_key

# Plaid
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_secret
PLAID_ENV=sandbox
```

### 5. Start Backend

```powershell
cd backend

# Development mode with hot reload
npm run dev

# Or build and run production
npm run build
npm start
```

Backend will run on `http://localhost:5000`

## Mobile App Setup

### 1. Install Expo CLI

```powershell
npm install -g expo-cli
```

### 2. Install Dependencies

```powershell
cd mobile
npm install
```

### 3. Update API URL

Edit `mobile/src/services/api.ts`:
```typescript
const API_URL = 'http://YOUR_COMPUTER_IP:5000/api/v1';
// For emulator: http://localhost:5000/api/v1
// For physical device: http://192.168.x.x:5000/api/v1
```

### 4. Start Mobile App

```powershell
cd mobile

# Start Expo dev server
npm start

# Or directly run on platform:
npm run ios      # iOS simulator
npm run android  # Android emulator
npm run web      # Web browser
```

### Testing on Physical Devices

1. Install **Expo Go** app from App Store or Play Store
2. Scan QR code from terminal
3. Ensure device is on same network as development machine

## Web App Setup

### 1. Install Dependencies

```powershell
cd web
npm install
```

### 2. Configure Environment

```powershell
# Copy environment file
cp .env.example .env.local

# Edit with your settings
notepad .env.local
```

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

### 3. Start Web App

```powershell
cd web

# Development mode
npm run dev

# Build for production
npm run build
npm start
```

Web app will run on `http://localhost:3000`

## Running the Full Stack

### Quick Start All Services

**Terminal 1 - Backend:**
```powershell
cd backend
npm run dev
```

**Terminal 2 - Web App:**
```powershell
cd web
npm run dev
```

**Terminal 3 - Mobile App:**
```powershell
cd mobile
npm start
```

### Services Overview

| Service | Port | URL |
|---------|------|-----|
| Backend API | 5000 | http://localhost:5000 |
| Web App | 3000 | http://localhost:3000 |
| Mobile App | 19000 | Expo DevTools |

## API Documentation

### Authentication Endpoints

**Register Executive Account:**
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "ceo@company.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "companyName": "My Company Inc"
}
```

**Login:**
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "ceo@company.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "ceo@company.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "executive",
    "companyId": "uuid"
  },
  "token": "jwt_token_here",
  "refreshToken": "refresh_token_here"
}
```

### Using Protected Endpoints

Include JWT token in Authorization header:
```http
GET /api/v1/financial/dashboard
Authorization: Bearer your_jwt_token_here
```

## Configuration

### Generating Secure Secrets

```powershell
# Generate random secrets in PowerShell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
```

### Database Migrations

The backend automatically syncs database models in development mode. For production:

```powershell
cd backend
npm run migrate
```

### Setting Up OpenAI

1. Create account at https://platform.openai.com/
2. Generate API key from API settings
3. Add to `.env` as `OPENAI_API_KEY`

### Setting Up Plaid (Banking)

1. Sign up at https://plaid.com/
2. Get Client ID and Secret from dashboard
3. Add to `.env`:
   - `PLAID_CLIENT_ID`
   - `PLAID_SECRET`
   - `PLAID_ENV=sandbox`

## Deployment

### Backend Deployment (Example: Heroku)

```powershell
cd backend

# Initialize git if not already
git init
git add .
git commit -m "Initial commit"

# Create Heroku app
heroku create execapp-api

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Add Redis
heroku addons:create heroku-redis:hobby-dev

# Set environment variables
heroku config:set JWT_SECRET=your_secret
heroku config:set OPENAI_API_KEY=your_key
# ... set all other env vars

# Deploy
git push heroku main
```

### Web App Deployment (Example: Vercel)

```powershell
cd web

# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Mobile App Deployment

**iOS:**
```powershell
cd mobile
expo build:ios
# Follow prompts for App Store submission
```

**Android:**
```powershell
cd mobile
expo build:android
# Follow prompts for Play Store submission
```

## Troubleshooting

### Backend Issues

**Database Connection Error:**
```powershell
# Check PostgreSQL is running
Get-Service postgresql*

# Start if stopped
Start-Service postgresql-x64-14
```

**Redis Connection Error:**
```powershell
# Check Redis is running
Get-Service Redis

# Start if stopped
Start-Service Redis
```

### Mobile App Issues

**Cannot connect to API:**
- Ensure backend is running
- Check API_URL in `mobile/src/services/api.ts`
- For physical devices, use your computer's local IP
- Check firewall allows connections on port 5000

**Expo Build Errors:**
```powershell
# Clear cache and reinstall
cd mobile
rm -r node_modules
rm package-lock.json
npm install
expo start -c
```

### Web App Issues

**Module not found errors:**
```powershell
cd web
rm -r node_modules .next
npm install
npm run dev
```

## Development Workflow

### Adding New Features

1. **Backend**: Create models → routes → controllers → services
2. **Mobile**: Create screens → navigation → API integration
3. **Web**: Create pages → components → API integration

### Testing

```powershell
# Backend tests
cd backend
npm test

# Mobile tests
cd mobile
npm test

# Web tests
cd web
npm test
```

### Code Quality

```powershell
# Lint code
npm run lint

# Type check
npm run type-check
```

## Support

For issues and questions:
- Check README files in each directory
- Review API documentation
- Check troubleshooting section

## Next Steps

1. **Set up all API keys** (OpenAI, Plaid)
2. **Configure databases** (PostgreSQL, Redis)
3. **Start all services** (Backend, Web, Mobile)
4. **Create test account** via registration
5. **Explore features** in mobile and web apps

## Security Notes

⚠️ **Important:**
- Never commit `.env` files to version control
- Use strong, unique secrets for production
- Enable HTTPS in production
- Implement rate limiting
- Regular security updates
- Monitor API usage and costs (OpenAI, Plaid)

---

**Happy Building! 🚀**
