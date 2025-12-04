# ExecApp Web - Staff Portal

Next.js web application for staff members to input data and manage tasks.

## Prerequisites

- Node.js 18+
- npm or yarn

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

3. Run development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Features

### Staff Portal
- **Dashboard**: Overview of tasks and activities
- **Task Management**: Create, update, and track tasks
- **Time Tracking**: Log work hours and attendance
- **Expense Reporting**: Submit and track expenses
- **Project Collaboration**: View and contribute to projects
- **Data Input**: Forms for various business data entry
- **Reports**: Generate and view reports

### Pages
- `/login` - Staff login
- `/dashboard` - Main dashboard
- `/tasks` - Task management
- `/time` - Time tracking
- `/expenses` - Expense reporting
- `/projects` - Project management
- `/reports` - Reports and analytics

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State Management**: Redux Toolkit
- **Forms**: React Hook Form
- **Charts**: Recharts
- **Icons**: Heroicons
- **HTTP Client**: Axios

## Project Structure

```
web/
├── src/
│   ├── app/             # Next.js app router pages
│   ├── components/      # React components
│   ├── lib/             # Utilities and helpers
│   │   ├── store/      # Redux store
│   │   └── api/        # API client
│   └── styles/          # Global styles
├── public/              # Static files
└── package.json
```

## Building for Production

```bash
npm run build
npm start
```

## Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API URL

## Development

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run lint      # Run ESLint
npm run type-check # Run TypeScript compiler check
```
