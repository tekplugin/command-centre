import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';

dotenv.config();

const printUserInfo = async () => {
  try {
    const email = process.argv[2];
    if (!email) {
      console.error('Usage: npm run print-user-info <email>');
      process.exit(1);
    }
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/command-centre';
    await mongoose.connect(mongoUri);
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.error('User not found:', email);
      process.exit(1);
    }
    console.log('User info:');
    console.log('Email:', user.email);
    console.log('First Name:', user.firstName);
    console.log('Last Name:', user.lastName);
    console.log('Active:', user.isActive);
    console.log('Roles:', user.roles);
    console.log('Password (hashed):', user.password);
    console.log('Departments:', user.departments);
    console.log('Company ID:', user.companyId);
    console.log('Last Login:', user.lastLogin);
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

printUserInfo();
