# ExecApp Mobile

React Native mobile application for executives using AI-powered business management.

## Prerequisites

- Node.js 18+
- npm or yarn
- iOS: Xcode and CocoaPods
- Android: Android Studio and JDK

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Run on iOS:
```bash
npm run ios
```

4. Run on Android:
```bash
npm run android
```

## Features

### Executive Mobile App
- **Dashboard**: Overview of all business metrics
- **Financial Management**: CFO-level analytics and insights
- **AI Assistant**: Natural language interaction with business AI
- **Team Management**: HR and team performance
- **Projects**: Project tracking and management
- **Real-time Notifications**: Instant alerts and updates
- **Biometric Authentication**: Face ID/Touch ID support

### Screens
- Authentication (Login/Register)
- Dashboard
- Financial Analytics
- AI Chat Assistant
- Team Management
- Projects & Tasks
- Profile & Settings

## Project Structure

```
mobile/
├── src/
│   ├── components/      # Reusable UI components
│   ├── navigation/      # Navigation configuration
│   ├── screens/         # App screens
│   ├── store/           # Redux store and slices
│   ├── services/        # API and services
│   └── utils/           # Utilities
├── assets/              # Images, fonts, etc.
├── App.tsx              # Main app component
└── package.json
```

## Technology Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation
- **State Management**: Redux Toolkit
- **API Client**: Axios
- **Authentication**: JWT with Secure Store
- **Real-time**: Socket.io
- **Charts**: React Native Chart Kit
- **Icons**: React Native Vector Icons

## Configuration

Update the API URL in `src/services/api.ts`:
```typescript
const API_URL = 'YOUR_API_URL';
```

## Building for Production

### iOS
```bash
expo build:ios
```

### Android
```bash
expo build:android
```

## Testing

```bash
npm test
```
