import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';

dotenv.config();

const testPasswordCompare = async () => {
  try {
    const email = process.argv[2];
    const password = process.argv[3];
    if (!email || !password) {
      console.error('Usage: npm run test-password-compare <email> <password>');
      process.exit(1);
    }
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/command-centre';
    await mongoose.connect(mongoUri);
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.error('User not found:', email);
      process.exit(1);
    }
    const isMatch = await user.comparePassword(password);
    console.log('Password match:', isMatch);
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

testPasswordCompare();
