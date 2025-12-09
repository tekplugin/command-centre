// backend/src/scripts/autoAssignMonthlyPayroll.ts
// Script to auto-assign master payroll template to new month

import mongoose from 'mongoose';
import Payroll from '../models/Payroll';
import dotenv from 'dotenv';
dotenv.config();

async function autoAssignMonthlyPayroll(companyId: string) {
  await mongoose.connect(process.env.MONGODB_URI || '', {});
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  // Check if current month payroll exists
  const existing = await Payroll.findOne({ companyId, month, year });
  if (existing) {
    console.log('Current month payroll already exists.');
    return;
  }
  // Get master payroll
  const master = await Payroll.findOne({ companyId, status: 'master' });
  if (!master) {
    console.log('No master payroll found.');
    return;
  }
  // Create new payroll for current month
  const newPayroll = await Payroll.create({
    companyId,
    month,
    year,
    employees: master.employees,
    totalGross: master.totalGross,
    totalNet: master.totalNet,
    totalDeductions: master.totalDeductions,
    status: 'draft',
  });
  console.log('Monthly payroll created:', newPayroll._id);
}

// Example usage: node autoAssignMonthlyPayroll.js <companyId>
if (require.main === module) {
  const companyId = process.argv[2];
  if (!companyId) {
    console.error('Usage: node autoAssignMonthlyPayroll.js <companyId>');
    process.exit(1);
  }
  autoAssignMonthlyPayroll(companyId).then(() => process.exit(0));
}
