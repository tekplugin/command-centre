/**
 * Script to create a global admin user
 * Run with: npx ts-node src/scripts/createAdmin.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User, { UserRole } from '../models/User';
import Company from '../models/Company';

dotenv.config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || '';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Check if user already exists
    const existingUser = await User.findOne({ email: 'ofolufemi@tekplugin.com' });
    if (existingUser) {
      console.log('⚠️  User already exists!');
      
      // Update to admin if not already
      if (!existingUser.roles.includes(UserRole.ADMIN)) {
        existingUser.roles.push(UserRole.ADMIN);
        await existingUser.save();
        console.log('✅ Updated user to Global Admin');
      }
      
      console.log('User details:', {
        email: existingUser.email,
        name: `${existingUser.firstName} ${existingUser.lastName}`,
        roles: existingUser.roles,
        departments: existingUser.departments,
      });
      
      await mongoose.disconnect();
      return;
    }

    // Find or create Tekplugin company
    let company = await Company.findOne({ name: 'Tekplugin Ltd' });
    if (!company) {
      company = await Company.create({
        name: 'Tekplugin Ltd',
        isActive: true,
      });
      console.log('✅ Created Tekplugin Ltd company');
    }

    // Create admin user
    const adminUser = await User.create({
      email: 'ofolufemi@tekplugin.com',
      password: '123456test',
      firstName: 'Ofolufemi',
      lastName: 'Oladimeji',
      roles: [UserRole.ADMIN],
      departments: [], // Admin has access to all departments
      companyId: company._id,
      phoneNumber: '',
      isActive: true,
    });

    console.log('\n✅ GLOBAL ADMIN USER CREATED!\n');
    console.log('═══════════════════════════════════════');
    console.log('Email:      ', adminUser.email);
    console.log('Password:   ', '123456test');
    console.log('Name:       ', `${adminUser.firstName} ${adminUser.lastName}`);
    console.log('Roles:      ', adminUser.roles);
    console.log('Company:    ', company.name);
    console.log('═══════════════════════════════════════\n');

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();
