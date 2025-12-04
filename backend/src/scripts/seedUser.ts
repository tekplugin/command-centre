import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User, { UserRole } from '../models/User';
import Company from '../models/Company';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/execapp_db';

const seedUser = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if user already exists
    const existingUser = await User.findOne({ email: 'admin@company.com' });
    if (existingUser) {
      console.log('User already exists!');
      await mongoose.connection.close();
      process.exit(0);
    }

    // Create company
    const company = await Company.create({
      name: 'ATM Solutions Ltd',
      isActive: true,
    });
    console.log('Company created:', company.name);

    // Create user
    const user = await User.create({
      email: 'admin@company.com',
      password: 'Test123456', // Will be hashed by pre-save hook
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.EXECUTIVE,
      companyId: company._id,
      isActive: true,
    });

    console.log('User created successfully:');
    console.log('Email:', user.email);
    console.log('Name:', `${user.firstName} ${user.lastName}`);
    console.log('Role:', user.role);

    await mongoose.connection.close();
    console.log('Done!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding user:', error);
    process.exit(1);
  }
};

seedUser();
