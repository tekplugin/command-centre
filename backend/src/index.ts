import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { connectDatabase } from './config/database';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import financialRoutes from './routes/financial.routes';
import hrRoutes from './routes/hr.routes';
import salesRoutes from './routes/sales.routes';
import marketingRoutes from './routes/marketing.routes';
import projectRoutes from './routes/project.routes';
import aiRoutes from './routes/ai.routes';
import bankingRoutes from './routes/banking.routes';
import emailRoutes from './routes/emailRoutes';
import webhookRoutes from './routes/webhook.routes';

dotenv.config();

const app: Application = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    credentials: true,
  },
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rateLimiter);

// Root route - Welcome page with API info
app.get('/', (_req, res) => {
  res.json({
    name: 'Command Centre API',
    version: '1.0.0',
    status: 'running',
    message: 'Welcome to Command Centre Backend API',
    endpoints: {
      health: '/health',
      api: `/api/${process.env.API_VERSION || 'v1'}`,
      auth: `/api/${process.env.API_VERSION || 'v1'}/auth`,
      docs: '/api/v1/docs'
    },
    frontend: 'http://localhost:3000',
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
const API_VERSION = process.env.API_VERSION || 'v1';
app.use(`/api/${API_VERSION}/auth`, authRoutes);
app.use(`/api/${API_VERSION}/users`, userRoutes);
app.use(`/api/${API_VERSION}/financial`, financialRoutes);
app.use(`/api/${API_VERSION}/hr`, hrRoutes);
app.use(`/api/${API_VERSION}/sales`, salesRoutes);
app.use(`/api/${API_VERSION}/marketing`, marketingRoutes);
app.use(`/api/${API_VERSION}/projects`, projectRoutes);
app.use(`/api/${API_VERSION}/ai`, aiRoutes);
app.use(`/api/${API_VERSION}/banking`, bankingRoutes);
app.use(`/api/${API_VERSION}/email`, emailRoutes);
app.use(`/api/${API_VERSION}/webhooks`, webhookRoutes);

// Error handling
app.use(errorHandler);

// Socket.io connection handling
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);

  socket.on('join_company', (companyId: string) => {
    socket.join(`company_${companyId}`);
    logger.info(`Socket ${socket.id} joined company ${companyId}`);
  });

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Make io accessible to routes
app.set('io', io);

const PORT = process.env.PORT || 5000;

// Database connection and server start
const startServer = async () => {
  try {
    await connectDatabase();
    logger.info('Database connection established successfully');

    return new Promise<void>((resolve, reject) => {
      httpServer.listen(PORT, () => {
        logger.info(`Server running on port ${PORT}`);
        logger.info(`Environment: ${process.env.NODE_ENV}`);
        logger.info(`Health check: http://localhost:${PORT}/health`);
        resolve();
      });

      httpServer.on('error', (error) => {
        logger.error('Server error:', error);
        reject(error);
      });
    });
  } catch (error) {
    logger.error('Unable to start server:', error);
    process.exit(1);
  }
};

startServer()
  .then(() => {
    logger.info('Server started successfully and is listening for connections');
  })
  .catch((error) => {
    logger.error('Fatal error during startup:', error);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: Error, promise: Promise<any>) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process, just log the error
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  // Don't exit the process, just log the error
});

export { io };
