import mongoose, { Schema, Document } from 'mongoose';

export interface IPayrollEmployee {
  employeeId: string;
  name: string;
  department: string;
  position: string;
  basicSalary: number;
  housingAllowance: number;
  transportAllowance: number;
  otherAllowances: number;
  loan?: number;
  advance?: number;
  otherDeductions?: number;
  startDate?: Date;
}

export interface IPayroll extends Document {
  companyId: mongoose.Types.ObjectId;
  month: number; // 1-12
  year: number;
  employees: IPayrollEmployee[];
  totalGross: number;
  totalNet: number;
  totalDeductions: number;
  status: 'master' | 'draft' | 'submitted' | 'approved' | 'rejected' | 'paid';
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  rejectedBy?: mongoose.Types.ObjectId;
  rejectedAt?: Date;
  rejectionReason?: string;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PayrollEmployeeSchema = new Schema<IPayrollEmployee>({
  employeeId: { type: String, required: true },
  name: String,
  department: String,
  position: String,
  basicSalary: Number,
  housingAllowance: Number,
  transportAllowance: Number,
  otherAllowances: Number,
  loan: Number,
  advance: Number,
  otherDeductions: Number,
  startDate: Date,
});

const PayrollSchema = new Schema<IPayroll>({
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  employees: [PayrollEmployeeSchema],
  totalGross: Number,
  totalNet: Number,
  totalDeductions: Number,
  status: { type: String, enum: ['master', 'draft', 'submitted', 'approved', 'rejected', 'paid'], default: 'draft' },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },
  rejectedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  rejectedAt: { type: Date },
  rejectionReason: { type: String },
  paidAt: { type: Date },
}, { timestamps: true });

const Payroll = mongoose.model<IPayroll>('Payroll', PayrollSchema);
export default Payroll;
