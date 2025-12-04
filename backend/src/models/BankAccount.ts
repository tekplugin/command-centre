import mongoose, { Schema, Document } from 'mongoose';

export interface IBankAccount extends Document {
  companyId: mongoose.Types.ObjectId;
  plaidAccessToken: string;
  plaidItemId: string;
  accountId: string;
  accountName: string;
  accountType: string;
  accountSubtype?: string;
  mask?: string;
  currentBalance?: number;
  availableBalance?: number;
  currency: string;
  isActive: boolean;
  lastSynced?: Date;
}

const bankAccountSchema = new Schema<IBankAccount>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    plaidAccessToken: {
      type: String,
      required: true,
    },
    plaidItemId: {
      type: String,
      required: true,
    },
    accountId: {
      type: String,
      required: true,
    },
    accountName: {
      type: String,
      required: true,
    },
    accountType: {
      type: String,
      required: true,
    },
    accountSubtype: {
      type: String,
    },
    mask: {
      type: String,
    },
    currentBalance: {
      type: Number,
    },
    availableBalance: {
      type: Number,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastSynced: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const BankAccount = mongoose.model<IBankAccount>('BankAccount', bankAccountSchema);

export default BankAccount;
