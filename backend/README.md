# Backend API Server

Express.js backend with TypeScript for the Executive AI Assistant Platform.

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Redis 6+

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Create PostgreSQL database:
```bash
createdb execapp_db
```

4. Run development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user/company
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh-token` - Refresh JWT token
- `POST /api/v1/auth/logout` - Logout

### Users
- `GET /api/v1/users/profile` - Get current user profile
- `GET /api/v1/users/team` - Get team members (Executive only)

### Financial
- `GET /api/v1/financial/dashboard` - Financial dashboard
- `GET /api/v1/financial/transactions` - Transaction list
- `GET /api/v1/financial/analytics` - Financial analytics

### Banking
- `POST /api/v1/banking/link-token` - Get Plaid link token
- `POST /api/v1/banking/exchange-token` - Exchange public token
- `GET /api/v1/banking/accounts` - Get bank accounts
- `POST /api/v1/banking/sync` - Sync bank data

### HR
- `GET /api/v1/hr/employees` - Employee list
- `GET /api/v1/hr/attendance` - Attendance records
- `GET /api/v1/hr/payroll` - Payroll data

### Sales
- `GET /api/v1/sales/pipeline` - Sales pipeline
- `GET /api/v1/sales/leads` - Sales leads
- `GET /api/v1/sales/analytics` - Sales analytics

### Marketing
- `GET /api/v1/marketing/campaigns` - Marketing campaigns
- `GET /api/v1/marketing/analytics` - Marketing analytics

### Projects
- `GET /api/v1/projects` - Projects list
- `GET /api/v1/projects/tasks` - Tasks list
- `GET /api/v1/projects/timeline` - Project timeline

### AI
- `POST /api/v1/ai/chat` - AI chat
- `POST /api/v1/ai/analyze` - AI analysis
- `GET /api/v1/ai/insights` - AI insights

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests

## Technology Stack

- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL with Sequelize ORM
- **Cache**: Redis
- **Authentication**: JWT
- **Real-time**: Socket.io
- **AI**: OpenAI API
- **Banking**: Plaid API
- **Validation**: Express Validator
- **Logging**: Winston
