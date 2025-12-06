/**
 * Nigerian Payroll Calculation Utilities
 * Compliant with Nigerian Tax Laws and Pension Reform Act
 */

export interface PayrollEmployee {
  id: string;
  employeeId: string;
  name: string;
  department: string;
  position: string;
  basicSalary: number;
  housingAllowance: number;
  transportAllowance: number;
  otherAllowances: number;
  // Optional deductions
  loan?: number;
  advance?: number;
  otherDeductions?: number;
}

export interface PayrollBreakdown {
  // Earnings
  basicSalary: number;
  housingAllowance: number;
  transportAllowance: number;
  otherAllowances: number;
  grossSalary: number;
  
  // Statutory Deductions
  pensionEmployee: number; // 8%
  pensionEmployer: number; // 10%
  nhf: number; // 2.5% of basic
  cra: number; // Consolidated Relief Allowance
  paye: number; // Pay As You Earn Tax
  
  // Other Deductions
  loan: number;
  advance: number;
  otherDeductions: number;
  totalDeductions: number;
  
  // Net Pay
  netPay: number;
  
  // Taxable Income Calculation
  taxableIncome: number;
}

/**
 * Calculate Consolidated Relief Allowance (CRA)
 * CRA = Higher of (₦200,000 + 20% of Gross Income) OR 1% of Gross Income
 */
export const calculateCRA = (grossIncome: number): number => {
  const option1 = 200000 + (0.20 * grossIncome);
  const option2 = 0.01 * grossIncome;
  return Math.max(option1, option2);
};

/**
 * Calculate PAYE Tax using Nigerian progressive tax rates (2024)
 * Tax Bands:
 * - First ₦300,000: 7%
 * - Next ₦300,000: 11%
 * - Next ₦500,000: 15%
 * - Next ₦500,000: 19%
 * - Next ₦1,600,000: 21%
 * - Above ₦3,200,000: 24%
 */
export const calculatePAYE = (taxableIncome: number): number => {
  if (taxableIncome <= 0) return 0;
  
  let tax = 0;
  const bands = [
    { limit: 300000, rate: 0.07 },
    { limit: 300000, rate: 0.11 },
    { limit: 500000, rate: 0.15 },
    { limit: 500000, rate: 0.19 },
    { limit: 1600000, rate: 0.21 },
    { limit: Infinity, rate: 0.24 }
  ];
  
  let remainingIncome = taxableIncome;
  
  for (const band of bands) {
    if (remainingIncome <= 0) break;
    
    const taxableAtThisBand = Math.min(remainingIncome, band.limit);
    tax += taxableAtThisBand * band.rate;
    remainingIncome -= taxableAtThisBand;
  }
  
  return Math.round(tax);
};

/**
 * Calculate complete payroll breakdown for an employee
 */
export const calculatePayrollBreakdown = (employee: PayrollEmployee): PayrollBreakdown => {
  // Earnings
  const basicSalary = employee.basicSalary;
  const housingAllowance = employee.housingAllowance;
  const transportAllowance = employee.transportAllowance;
  const otherAllowances = employee.otherAllowances;
  const grossSalary = basicSalary + housingAllowance + transportAllowance + otherAllowances;
  
  // Pension Contributions (on basic + housing + transport)
  const pensionableIncome = basicSalary + housingAllowance + transportAllowance;
  const pensionEmployee = Math.round(pensionableIncome * 0.08);
  const pensionEmployer = Math.round(pensionableIncome * 0.10);
  
  // NHF (2.5% of basic salary)
  const nhf = Math.round(basicSalary * 0.025);
  
  // CRA (Consolidated Relief Allowance)
  const cra = calculateCRA(grossSalary);
  
  // Taxable Income = Gross - (Pension Employee + NHF + CRA)
  const taxableIncome = grossSalary - pensionEmployee - nhf - cra;
  
  // PAYE Tax
  const paye = calculatePAYE(taxableIncome);
  
  // Other Deductions
  const loan = employee.loan || 0;
  const advance = employee.advance || 0;
  const otherDeductions = employee.otherDeductions || 0;
  
  // Total Deductions
  const totalDeductions = pensionEmployee + nhf + paye + loan + advance + otherDeductions;
  
  // Net Pay
  const netPay = grossSalary - totalDeductions;
  
  return {
    basicSalary,
    housingAllowance,
    transportAllowance,
    otherAllowances,
    grossSalary,
    pensionEmployee,
    pensionEmployer,
    nhf,
    cra,
    paye,
    loan,
    advance,
    otherDeductions,
    totalDeductions,
    netPay,
    taxableIncome
  };
};

/**
 * Format currency in Naira
 */
export const formatNaira = (amount: number): string => {
  return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * Generate payslip data
 */
export const generatePayslip = (employee: PayrollEmployee, month: string, year: string) => {
  const breakdown = calculatePayrollBreakdown(employee);
  
  return {
    employee: {
      id: employee.employeeId,
      name: employee.name,
      department: employee.department,
      position: employee.position
    },
    period: `${month} ${year}`,
    earnings: {
      basic: breakdown.basicSalary,
      housing: breakdown.housingAllowance,
      transport: breakdown.transportAllowance,
      others: breakdown.otherAllowances,
      gross: breakdown.grossSalary
    },
    deductions: {
      pension: breakdown.pensionEmployee,
      nhf: breakdown.nhf,
      paye: breakdown.paye,
      loan: breakdown.loan,
      advance: breakdown.advance,
      others: breakdown.otherDeductions,
      total: breakdown.totalDeductions
    },
    netPay: breakdown.netPay,
    employerContributions: {
      pension: breakdown.pensionEmployer
    }
  };
};

/**
 * Payroll status types
 */
export type PayrollStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'paid';

export interface PayrollSubmission {
  id: string;
  month: string;
  year: string;
  employees: PayrollEmployee[];
  totalGross: number;
  totalNet: number;
  totalDeductions: number;
  status: PayrollStatus;
  submittedBy: string;
  submittedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  paidAt?: string;
}
