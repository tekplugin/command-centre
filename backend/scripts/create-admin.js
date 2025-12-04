/**
 * Script to create initial admin user
 * Run: node scripts/create-admin.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model (adjust path if needed)
const User = require('../dist/models/User').default;

async function createAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@company.com' });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('Email:', existingAdmin.email);
      process.exit(0);
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('Admin@123456', 10);
    
    const admin = new User({
      email: 'admin@company.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      companyName: 'ATM Solutions Ltd',
      role: 'admin',
    });

    await admin.save();
    
    console.log('\n✓ Admin user created successfully!');
    console.log('\nCredentials:');
    console.log('Email:', 'admin@company.com');
    console.log('Password:', 'Admin@123456');
    console.log('\n⚠️  IMPORTANT: Change this password immediately after first login!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
}

createAdmin();
