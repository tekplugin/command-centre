import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { logger } from '../utils/logger';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/execapp_db';

export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URI);
    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on('connected', () => {
  logger.info('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  logger.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('Mongoose disconnected from MongoDB');
});

// Graceful shutdown
// Temporarily disabled to prevent premature shutdown during curl requests
// process.on('SIGINT', async () => {
//   await mongoose.connection.close();
//   logger.info('Mongoose connection closed through app termination');
//   process.exit(0);
// });

export default mongoose;
