import mongoose, { Schema, Document } from 'mongoose';

export enum TransactionCategory {
  REVENUE = 'revenue',
  EXPENSE = 'expense',
  PAYROLL = 'payroll',
  TAX = 'tax',
  LOAN = 'loan',
  INVESTMENT = 'investment',
  OTHER = 'other',
}

export interface ITransaction extends Document {
  companyId: mongoose.Types.ObjectId;
  bankAccountId: mongoose.Types.ObjectId;
  transactionId: string;
  amount: number;
  currency: string;
  description: string;
  category: TransactionCategory;
  subcategory?: string;
  date: Date;
  merchantName?: string;
  pending: boolean;
  notes?: string;
}

const transactionSchema = new Schema<ITransaction>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    bankAccountId: {
      type: Schema.Types.ObjectId,
      ref: 'BankAccount',
      required: true,
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: Object.values(TransactionCategory),
      required: true,
    },
    subcategory: {
      type: String,
    },
    date: {
      type: Date,
      required: true,
    },
    merchantName: {
      type: String,
    },
    pending: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);

export default Transaction;
