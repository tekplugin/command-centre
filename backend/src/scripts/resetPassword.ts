import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User';

dotenv.config();

const resetPassword = async () => {
  try {
    // Get email and new password from command line arguments
    const email = process.argv[2];
    const newPassword = process.argv[3];

    if (!email || !newPassword) {
      console.error('Usage: npm run reset-password <email> <new-password>');
      console.error('Example: npm run reset-password ofolufemi@tekplugin.com MyNewPass123!');
      process.exit(1);
    }

    // Validate password strength
    if (newPassword.length < 8) {
      console.error('Password must be at least 8 characters long');
      process.exit(1);
    }

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/command-centre';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.error(`User not found: ${email}`);
      console.log('\nAvailable users:');
      const users = await User.find({}, 'email firstName lastName roles');
      users.forEach(u => {
        console.log(`  - ${u.email} (${u.firstName} ${u.lastName}) - Roles: ${u.roles.join(', ')}`);
      });
      process.exit(1);
    }

    // Hash and update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    console.log('\n✅ Password updated successfully!');
    console.log(`Email: ${user.email}`);
    console.log(`Name: ${user.firstName} ${user.lastName}`);
    console.log(`Roles: ${user.roles.join(', ')}`);
    console.log('\nYou can now login with the new password.');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error resetting password:', error);
    process.exit(1);
  }
};

resetPassword();
