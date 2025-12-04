import mongoose from 'mongoose';
import SalesLead from '../models/SalesLead';
import { logger } from '../utils/logger';
import dotenv from 'dotenv';

dotenv.config();

const sampleLeads = [
  {
    clientName: 'GTBank',
    contactPerson: 'Adebayo Ogunleye',
    email: 'a.ogunleye@gtbank.com',
    phone: '+234-801-234-5678',
    company: 'Guaranty Trust Bank Plc',
    stage: 'closed-won',
    value: 15000000,
    probability: 100,
    actualCloseDate: new Date('2024-11-15'),
    notes: 'Software upgrade and ATM maintenance contract'
  },
  {
    clientName: 'Access Bank',
    contactPerson: 'Chioma Nwankwo',
    email: 'c.nwankwo@accessbank.com',
    phone: '+234-802-345-6789',
    company: 'Access Bank Plc',
    stage: 'closed-won',
    value: 12000000,
    probability: 100,
    actualCloseDate: new Date('2024-11-20'),
    notes: 'ATM installation across 10 branches'
  },
  {
    clientName: 'Zenith Bank',
    contactPerson: 'Ibrahim Musa',
    email: 'i.musa@zenithbank.com',
    phone: '+234-803-456-7890',
    company: 'Zenith Bank Plc',
    stage: 'closed-won',
    value: 8000000,
    probability: 100,
    actualCloseDate: new Date('2024-11-10'),
    notes: 'Annual maintenance contract'
  },
  {
    clientName: 'UBA',
    contactPerson: 'Amina Hassan',
    email: 'a.hassan@ubagroup.com',
    phone: '+234-804-567-8901',
    company: 'United Bank for Africa Plc',
    stage: 'closed-won',
    value: 20000000,
    probability: 100,
    actualCloseDate: new Date('2024-11-25'),
    notes: 'Complete system integration project'
  },
  {
    clientName: 'First Bank',
    contactPerson: 'Oluwaseun Adeyemi',
    email: 'o.adeyemi@firstbank.com',
    phone: '+234-805-678-9012',
    company: 'First Bank of Nigeria Ltd',
    stage: 'closed-won',
    value: 10000000,
    probability: 100,
    actualCloseDate: new Date('2024-11-28'),
    notes: 'Network infrastructure upgrade'
  },
  {
    clientName: 'Fidelity Bank',
    contactPerson: 'Grace Okafor',
    email: 'g.okafor@fidelitybank.com',
    phone: '+234-806-789-0123',
    company: 'Fidelity Bank Plc',
    stage: 'negotiation',
    value: 7000000,
    probability: 75,
    expectedCloseDate: new Date('2024-12-15'),
    notes: 'Under final negotiation'
  }
];

async function seedSalesLeads() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/execapp';
    await mongoose.connect(mongoUri);
    logger.info('Connected to MongoDB');

    // Get a user and company for seeding
    const User = mongoose.model('User');
    const Company = mongoose.model('Company');

    const user = await User.findOne();
    const company = await Company.findOne();

    if (!user || !company) {
      logger.error('No user or company found. Please create a user first.');
      process.exit(1);
    }

    // Clear existing leads (optional)
    await SalesLead.deleteMany({ companyId: company._id });
    logger.info('Cleared existing sales leads');

    // Create sales leads
    const leads = sampleLeads.map(lead => ({
      ...lead,
      createdBy: user._id,
      companyId: company._id
    }));

    await SalesLead.insertMany(leads);
    
    logger.info(`✅ Successfully seeded ${leads.length} sales leads`);
    logger.info(`   - ${leads.filter(l => l.stage === 'closed-won').length} closed-won clients`);
    logger.info(`   - ${leads.filter(l => l.stage !== 'closed-won').length} other stage clients`);

    process.exit(0);
  } catch (error) {
    logger.error('Error seeding sales leads:', error);
    process.exit(1);
  }
}

seedSalesLeads();
