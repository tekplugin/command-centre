# MongoDB Setup Guide

## Quick Setup

### Option 1: Install MongoDB Locally

1. **Download MongoDB Community Server**: Visit https://www.mongodb.com/try/download/community
2. **Install MongoDB** (Windows):
   - Run the installer
   - Choose "Complete" installation
   - Install as a Windows Service (recommended)
   - Install MongoDB Compass (GUI tool) - optional but helpful

3. **Verify Installation**:
   ```powershell
   mongod --version
   ```

4. **Start MongoDB** (if not running as a service):
   ```powershell
   mongod
   ```

### Option 2: Use MongoDB Atlas (Cloud - Free Tier Available)

1. **Create Account**: Visit https://www.mongodb.com/cloud/atlas/register
2. **Create Free Cluster** (M0 Sandbox - Free Forever)
3. **Configure Security**:
   - Add your IP address to the whitelist (or use 0.0.0.0/0 for development)
   - Create a database user with password
4. **Get Connection String**:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

5. **Update your `.env` file**:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/execapp_db?retryWrites=true&w=majority
   ```

### Option 3: Docker (Fastest for Development)

```powershell
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## Project Setup Steps

1. **Navigate to backend folder**:
   ```powershell
   cd backend
   ```

2. **Install dependencies**:
   ```powershell
   npm install
   ```

3. **Copy `.env.example` to `.env`**:
   ```powershell
   Copy-Item .env.example .env
   ```

4. **Update `.env` with your MongoDB connection**:
   - For local MongoDB: `MONGODB_URI=mongodb://localhost:27017/execapp_db`
   - For MongoDB Atlas: Use the connection string from Atlas
   - For Docker: `MONGODB_URI=mongodb://localhost:27017/execapp_db`

5. **Configure other required environment variables** in `.env`:
   ```env
   JWT_SECRET=your_secure_random_string_here
   REFRESH_TOKEN_SECRET=another_secure_random_string
   OPENAI_API_KEY=sk-your-openai-key (optional for testing)
   ```

6. **Start the backend server**:
   ```powershell
   npm run dev
   ```

7. **Verify the server is running**:
   ```powershell
   Invoke-RestMethod -Uri http://localhost:5000/health
   ```

   You should see:
   ```json
   {
     "status": "ok",
     "timestamp": "2024-..."
   }
   ```

## Testing the Application

### 1. Register a New User

```powershell
$body = @{
    email = "admin@company.com"
    password = "Test123456"
    firstName = "John"
    lastName = "Doe"
    companyName = "My Company"
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:5000/api/v1/auth/register -Method POST -Body $body -ContentType "application/json"
```

### 2. Login

```powershell
$body = @{
    email = "admin@company.com"
    password = "Test123456"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri http://localhost:5000/api/v1/auth/login -Method POST -Body $body -ContentType "application/json"
$token = $response.token
```

### 3. Test Protected Endpoint

```powershell
$headers = @{
    Authorization = "Bearer $token"
}

Invoke-RestMethod -Uri http://localhost:5000/api/v1/users/me -Headers $headers
```

## What Changed from PostgreSQL

✅ **Converted to MongoDB**:
- Replaced Sequelize ORM with Mongoose ODM
- Updated all models to use Mongoose schemas
- Changed database configuration to MongoDB connection
- Updated controllers to use MongoDB query syntax
- No need for database migrations

✅ **Benefits**:
- Easier setup (no user/password configuration needed)
- Flexible schema (great for rapid development)
- Cloud option available (MongoDB Atlas free tier)
- Better for document-based data
- Built-in replica sets for high availability

## Troubleshooting

### Cannot connect to MongoDB
- **Local**: Make sure MongoDB service is running: `Get-Service MongoDB`
- **Atlas**: Check your IP whitelist and connection string
- **Docker**: Verify container is running: `docker ps`

### Port 27017 already in use
```powershell
# Find what's using the port
Get-NetTCPConnection -LocalPort 27017

# Stop MongoDB service if needed
Stop-Service MongoDB
```

### Authentication failed
- Check your MongoDB username/password in connection string
- For local MongoDB without auth: `MONGODB_URI=mongodb://localhost:27017/execapp_db`

## Next Steps

Once your backend is running:

1. **Test all endpoints** using the commands above
2. **Set up the web app**: `cd ../web && npm install && npm run dev`
3. **Set up the mobile app**: `cd ../mobile && npm install && npx expo start`

## MongoDB GUI Tools (Optional)

- **MongoDB Compass**: Official GUI (installed with MongoDB)
- **Studio 3T**: Feature-rich GUI with free version
- **NoSQLBooster**: Modern MongoDB GUI

To connect with Compass:
- Connection String: `mongodb://localhost:27017`
- Or click "Fill in connection fields individually" and enter:
  - Hostname: `localhost`
  - Port: `27017`
