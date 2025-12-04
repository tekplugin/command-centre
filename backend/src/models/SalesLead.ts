import mongoose, { Schema, Document } from 'mongoose';

export interface ISalesLead extends Document {
  clientName: string;
  contactPerson: string;
  email: string;
  phone?: string;
  company: string;
  stage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  value: number;
  probability: number;
  expectedCloseDate?: Date;
  actualCloseDate?: Date;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SalesLeadSchema = new Schema<ISalesLead>(
  {
    clientName: { type: String, required: true },
    contactPerson: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    company: { type: String, required: true },
    stage: { 
      type: String, 
      enum: ['lead', 'qualified', 'proposal', 'negotiation', 'closed-won', 'closed-lost'],
      default: 'lead'
    },
    value: { type: Number, required: true },
    probability: { type: Number, default: 0, min: 0, max: 100 },
    expectedCloseDate: { type: Date },
    actualCloseDate: { type: Date },
    notes: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true }
  },
  { timestamps: true }
);

// Indexes
SalesLeadSchema.index({ companyId: 1, stage: 1 });
SalesLeadSchema.index({ email: 1 });

export default mongoose.model<ISalesLead>('SalesLead', SalesLeadSchema);
