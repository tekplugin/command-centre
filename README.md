# ExecApp - Executive AI Assistant Platform

> 🚀 An AI-driven mobile and web application designed for entrepreneurs and executives, providing comprehensive business management capabilities.

[![License](https://img.shields.io/badge/license-Proprietary-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![React Native](https://img.shields.io/badge/React%20Native-0.73-61dafb.svg)](https://reactnative.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)

## 🎯 Overview

ExecApp is a comprehensive AI-powered business management platform that combines the capabilities of multiple C-level executives into a single, intelligent system. The platform integrates:

- 🤖 **Executive Assistant** - Task management, scheduling, email handling
- 💰 **CFO** - Financial analysis, forecasting, budget optimization
- 👥 **HR Manager** - Team management, performance analysis, recruitment
- 📈 **Sales Manager** - Pipeline tracking, lead scoring, forecasting
- 📱 **Marketing Manager** - Campaign analytics, content generation, ROI tracking
- 📊 **Project Manager** - Resource allocation, risk assessment, timeline optimization

## Architecture

### Tech Stack

**Backend:**
- Node.js with Express & TypeScript
- PostgreSQL database
- Redis for caching and sessions
- OpenAI API for AI capabilities
- Socket.io for real-time notifications

**Mobile App (Executive Level):**
- React Native with TypeScript
- Redux Toolkit for state management
- React Navigation
- Native integrations for biometric auth

**Web App (Staff Portal):**
- Next.js 14 with TypeScript
- TailwindCSS for styling
- Server-side rendering
- Role-based access control

**Integrations:**
- Banking APIs (Plaid)
- Calendar integrations (Google, Outlook)
- Email integrations
- Cloud storage (AWS S3)

## Features

### Executive Mobile App
- Dashboard with AI-powered insights
- Financial overview and analytics
- Team management and HR insights
- Sales pipeline and forecasting
- Marketing campaign performance
- Project status and tracking
- Real-time notifications
- Voice commands
- Biometric authentication

### Staff Web Portal
- Task and project input
- Time tracking
- Expense reporting
- Sales data entry
- Customer interaction logs
- Document upload and management
- Team communication

### AI Capabilities
- Natural language processing for commands
- Predictive analytics for business metrics
- Automated report generation
- Intelligent task prioritization
- Financial forecasting
- Sales and marketing insights
- Risk assessment and alerts

## Project Structure

```
execapp/
├── backend/              # Node.js API server
│   ├── src/
│   │   ├── config/      # Configuration files
│   │   ├── controllers/ # Request handlers
│   │   ├── models/      # Database models
│   │   ├── routes/      # API routes
│   │   ├── services/    # Business logic
│   │   ├── middleware/  # Auth, validation, etc.
│   │   ├── ai/          # AI service integrations
│   │   └── utils/       # Helper functions
│   └── package.json
├── mobile/              # React Native app
│   ├── src/
│   │   ├── screens/     # App screens
│   │   ├── components/  # Reusable components
│   │   ├── navigation/  # Navigation config
│   │   ├── store/       # Redux store
│   │   ├── services/    # API clients
│   │   └── utils/       # Utilities
│   └── package.json
├── web/                 # Next.js web app
│   ├── src/
│   │   ├── app/         # App router pages
│   │   ├── components/  # React components
│   │   ├── lib/         # Utilities and helpers
│   │   └── styles/      # CSS and styling
│   └── package.json
└── shared/              # Shared types and constants
    └── types/
```

## Security Considerations

- End-to-end encryption for sensitive data
- Multi-factor authentication
- Role-based access control (RBAC)
- Banking data encryption at rest and in transit
- Regular security audits
- GDPR and data privacy compliance

## 🚀 Quick Start

Get started in 15 minutes! See [QUICKSTART.md](QUICKSTART.md) for the fastest setup.

### For detailed setup:
1. 📖 [Complete Setup Guide](SETUP_GUIDE.md) - Comprehensive installation instructions
2. 🏗️ [Architecture Overview](ARCHITECTURE.md) - System design and technical details
3. 🗺️ [Development Roadmap](ROADMAP.md) - Feature timeline and priorities

### Component Documentation:
- [`/backend/README.md`](backend/README.md) - API server setup
- [`/mobile/README.md`](mobile/README.md) - React Native app setup
- [`/web/README.md`](web/README.md) - Next.js web app setup

## ✨ Key Features

### Mobile App (Executive Level)
- 📊 Real-time business dashboard with AI insights
- 💬 Natural language AI assistant for business queries
- 💰 Advanced financial analytics and forecasting
- 👥 Team performance monitoring and HR insights
- 📈 Sales pipeline visualization and predictions
- 🎯 Marketing campaign performance tracking
- 📱 Push notifications for critical alerts
- 🔐 Biometric authentication (Face ID/Touch ID)

### Web App (Staff Portal)
- ✅ Task and project management
- ⏱️ Time tracking and attendance
- 💵 Expense reporting and approval workflow
- 📁 Document management and sharing
- 📊 Report generation and analytics
- 💬 Team collaboration tools
- 📅 Calendar integration

### Backend API
- 🔐 JWT-based authentication with role-based access
- 🤖 AI-powered business intelligence and insights
- 🏦 Banking integration via Plaid
- 🔄 Real-time updates via WebSockets
- 📧 Email notifications and alerts
- 🗄️ PostgreSQL database with Redis caching
- 📝 Comprehensive API documentation

## 📁 Project Structure

```
execapp/
├── backend/              # Node.js/Express API server
│   ├── src/
│   │   ├── controllers/  # Request handlers
│   │   ├── models/      # Database models
│   │   ├── routes/      # API endpoints
│   │   ├── services/    # Business logic & AI
│   │   ├── middleware/  # Auth, validation, errors
│   │   └── config/      # Configuration
│   └── package.json
│
├── mobile/              # React Native app (Executives)
│   ├── src/
│   │   ├── screens/     # App screens
│   │   ├── components/  # UI components
│   │   ├── navigation/  # App navigation
│   │   ├── store/       # Redux state
│   │   └── services/    # API clients
│   └── package.json
│
├── web/                 # Next.js web app (Staff)
│   ├── src/
│   │   ├── app/         # Next.js pages
│   │   ├── components/  # React components
│   │   └── lib/         # Utilities
│   └── package.json
│
├── QUICKSTART.md        # 15-minute setup guide
├── SETUP_GUIDE.md       # Complete setup instructions
├── ARCHITECTURE.md      # Technical architecture
├── ROADMAP.md          # Development roadmap
└── README.md           # This file
```

## 🛠️ Technology Stack

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js with TypeScript
- **Database:** PostgreSQL 14+
- **Cache:** Redis 6+
- **ORM:** Sequelize
- **AI:** OpenAI GPT-4
- **Banking:** Plaid API
- **Real-time:** Socket.io
- **Auth:** JWT

### Mobile (React Native)
- **Framework:** React Native 0.73 + Expo SDK 50
- **Language:** TypeScript
- **State:** Redux Toolkit
- **Navigation:** React Navigation 6
- **UI:** Custom components + React Native Paper
- **Auth:** Biometric + JWT

### Web (Next.js)
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **State:** Redux Toolkit
- **Forms:** React Hook Form
- **Charts:** Recharts

## 🎬 Getting Started

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+
- Redis 6+
- OpenAI API key (for AI features)
- Plaid account (for banking features)

### Installation

1. **Clone the repository**
   ```powershell
   cd c:\Users\Tekpl\OneDrive\Documents\execapp
   ```

2. **Install all dependencies**
   ```powershell
   npm run install:all
   ```

3. **Set up databases**
   ```powershell
   # Start PostgreSQL
   Start-Service postgresql*
   
   # Create database
   psql -U postgres -c "CREATE DATABASE execapp_db;"
   
   # Start Redis
   Start-Service Redis
   ```

4. **Configure environment**
   ```powershell
   # Backend
   cd backend
   cp .env.example .env
   # Edit .env with your credentials
   
   # Web
   cd ../web
   cp .env.example .env.local
   ```

5. **Start all services**
   ```powershell
   # Terminal 1: Backend
   cd backend && npm run dev
   
   # Terminal 2: Web
   cd web && npm run dev
   
   # Terminal 3: Mobile (optional)
   cd mobile && npm start
   ```

6. **Access the applications**
   - Backend API: http://localhost:5000
   - Web App: http://localhost:3000
   - Mobile: Scan QR code with Expo Go

For detailed instructions, see [QUICKSTART.md](QUICKSTART.md) or [SETUP_GUIDE.md](SETUP_GUIDE.md).

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [QUICKSTART.md](QUICKSTART.md) | Get started in 15 minutes |
| [SETUP_GUIDE.md](SETUP_GUIDE.md) | Complete setup instructions |
| [ARCHITECTURE.md](ARCHITECTURE.md) | System architecture and design |
| [ROADMAP.md](ROADMAP.md) | Development roadmap and timeline |
| [web/STYLING_GUIDE.md](web/STYLING_GUIDE.md) | **UI styling and visibility rules** |
| [backend/README.md](backend/README.md) | Backend API documentation |
| [mobile/README.md](mobile/README.md) | Mobile app documentation |
| [web/README.md](web/README.md) | Web app documentation |

## 🎯 Use Cases

### For Executives
- Monitor business metrics in real-time
- Get AI-powered insights and recommendations
- Make data-driven decisions quickly
- Stay informed with smart notifications
- Access financial analytics on-the-go

### For Staff
- Track tasks and time efficiently
- Submit expenses and reports
- Collaborate on projects
- Access company resources
- Communicate with team members

### For Companies
- Centralized business management
- Improved decision-making with AI
- Better team collaboration
- Enhanced productivity
- Data-driven insights

## 🔐 Security

- **Authentication:** JWT with refresh tokens
- **Authorization:** Role-based access control (RBAC)
- **Data Encryption:** At rest and in transit
- **Password Security:** Bcrypt hashing
- **API Security:** Rate limiting, CORS, Helmet.js
- **Biometric Auth:** Face ID/Touch ID on mobile
- **Secure Storage:** Expo SecureStore for tokens

## 🚢 Deployment

### Backend (Heroku Example)
```powershell
cd backend
heroku create execapp-api
heroku addons:create heroku-postgresql:hobby-dev
heroku addons:create heroku-redis:hobby-dev
git push heroku main
```

### Web (Vercel)
```powershell
cd web
vercel
```

### Mobile (App Stores)
```powershell
cd mobile
expo build:ios    # iOS
expo build:android # Android
```

See [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed deployment instructions.

## 📊 Development Status

| Phase | Status | Completion |
|-------|--------|------------|
| Phase 1: Foundation | ✅ Complete | 100% |
| Phase 2: Core Features | 🔄 In Progress | 40% |
| Phase 3: Advanced Features | ⏳ Planned | 0% |
| Phase 4: Enhancement | ⏳ Planned | 0% |
| Phase 5: Scale & Polish | ⏳ Planned | 0% |
| Phase 6: Enterprise | ⏳ Planned | 0% |

See [ROADMAP.md](ROADMAP.md) for detailed timeline and features.

## 🤝 Contributing

This is a private/proprietary project. For contributions:
1. Follow the project structure
2. Write tests for new features
3. Update documentation
4. Follow TypeScript best practices
5. Commit messages should be descriptive

## 📝 Development Roadmap

See [ROADMAP.md](ROADMAP.md) for:
- Detailed feature timeline
- Priority matrix
- Resource requirements
- Success metrics

## 🆘 Support & Troubleshooting

### Common Issues
- Database connection errors → Check PostgreSQL service
- Redis connection errors → Check Redis service
- Port conflicts → Kill processes using ports 5000, 3000
- Module errors → Clean install `node_modules`

See [QUICKSTART.md](QUICKSTART.md) for solutions.

### Getting Help
1. Check documentation in each directory
2. Review [SETUP_GUIDE.md](SETUP_GUIDE.md)
3. Check logs in `backend/logs/`
4. Open an issue (if applicable)

## 💡 Tips for Success

1. **Start with QUICKSTART.md** for fastest setup
2. **Read the architecture** to understand the system
3. **Test incrementally** - don't wait to test
4. **Use Git** - commit changes frequently
5. **Check logs** when debugging
6. **Follow the roadmap** for feature priorities

## 📄 License

Proprietary - All rights reserved

## 🙏 Acknowledgments

- OpenAI for GPT-4 API
- Plaid for banking integration
- All open-source libraries used in this project

## License

Proprietary - All rights reserved
