import mongoose, { Schema, Document } from 'mongoose';

export interface ICompany extends Document {
  name: string;
  industry?: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  taxId?: string;
  isActive: boolean;
}

const companySchema = new Schema<ICompany>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    industry: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
    },
    logoUrl: {
      type: String,
    },
    website: {
      type: String,
    },
    address: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    country: {
      type: String,
    },
    zipCode: {
      type: String,
    },
    taxId: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Company = mongoose.model<ICompany>('Company', companySchema);

export default Company;
