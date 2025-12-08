'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import PayrollApproval from '@/components/PayrollApproval';
import { PayrollSubmission } from '@/utils/nigerianPayroll';

/**
 * IMPORTANT UI VISIBILITY RULE:
 * 
 * Always add explicit text color classes to ALL text elements (<p>, <span>, <div>, etc.)
 * to ensure proper contrast and visibility.
 * 
 * Common color classes:
 * - text-gray-900 (dark text for primary content)
 * - text-gray-700 (medium dark for secondary content)
 * - text-gray-600 (medium for labels)
 * - text-gray-500 (light for hints/helper text)
 * - text-red-600 (for deductions/negative values)
 * - text-green-600 (for positive values/net pay)
 * - text-blue-900 (for summary panels with blue backgrounds)
 * 
 * NEVER rely on default text colors - always specify explicitly!
 * Add 'block' class to span elements when needed for proper display.
 */

export default function FinancePage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showInvoiceDetailsModal, setShowInvoiceDetailsModal] = useState(false);
  const [showPayrollModal, setShowPayrollModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showProcurementModal, setShowProcurementModal] = useState(false);
  const [showCashFlowModal, setShowCashFlowModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [payrollSubmissions, setPayrollSubmissions] = useState<PayrollSubmission[]>([]);
  const [procurementRequests, setProcurementRequests] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  
  // Load assets from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedAssets = localStorage.getItem('company_assets');
      if (savedAssets) {
        try {
          setAssets(JSON.parse(savedAssets));
        } catch (e) {
          console.error('Error loading assets:', e);
        }
      }
    }
  }, []);

  // Load payroll submissions from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPayrolls = localStorage.getItem('payroll_submissions');
      if (savedPayrolls) {
        try {
          setPayrollSubmissions(JSON.parse(savedPayrolls));
        } catch (e) {
          console.error('Error loading payrolls:', e);
        }
      }
    }
  }, [showPayrollModal]);

  // Load procurement requests
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedRequests = localStorage.getItem('procurement_requests');
      if (savedRequests) {
        try {
          setProcurementRequests(JSON.parse(savedRequests));
        } catch (e) {
          console.error('Error loading procurement:', e);
        }
      }
    }
  }, [showProcurementModal]);

  // Handle payroll approval
  const handleApprove = (id: string, comments: string) => {
    if (typeof window !== 'undefined') {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedPayrolls = payrollSubmissions.map(p => 
        p.id === id ? {
          ...p,
          status: 'approved' as const,
          approvedBy: `${user.firstName} ${user.lastName}`,
          approvedAt: new Date().toISOString()
        } : p
      );
      setPayrollSubmissions(updatedPayrolls);
      localStorage.setItem('payroll_submissions', JSON.stringify(updatedPayrolls));
      alert('Payroll approved successfully!');
    }
  };

  // Handle payroll rejection
  const handleReject = (id: string, reason: string) => {
    if (typeof window !== 'undefined') {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedPayrolls = payrollSubmissions.map(p => 
        p.id === id ? {
          ...p,
          status: 'rejected' as const,
          rejectedBy: `${user.firstName} ${user.lastName}`,
          rejectedAt: new Date().toISOString(),
          rejectionReason: reason
        } : p
      );
      setPayrollSubmissions(updatedPayrolls);
      localStorage.setItem('payroll_submissions', JSON.stringify(updatedPayrolls));
      alert('Payroll rejected');
    }
  };

  // Handle mark as paid
  const handleMarkPaid = (id: string) => {
    if (typeof window !== 'undefined') {
      const updatedPayrolls = payrollSubmissions.map(p => 
        p.id === id ? {
          ...p,
          status: 'paid' as const,
          paidAt: new Date().toISOString()
        } : p
      );
      setPayrollSubmissions(updatedPayrolls);
      localStorage.setItem('payroll_submissions', JSON.stringify(updatedPayrolls));
    };
    
    fetchExchangeRate();
    // Refresh rate every hour
    const interval = setInterval(fetchExchangeRate, 3600000);
    return () => clearInterval(interval);
  }, []);

  // Load currency preference from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCurrency = localStorage.getItem('app_currency');
      if (savedCurrency === 'USD' || savedCurrency === 'NGN') {
        setCurrency(savedCurrency);
      }
    }
  }, []);

  // Save currency preference to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('app_currency', currency);
    }
  }, [currency]);

  // Currency conversion function
  const convertAmount = (amount: number, fromCurrency: 'NGN' | 'USD' = 'NGN'): number => {
    if (fromCurrency === 'NGN' && currency === 'USD') {
      return amount / exchangeRate;
    } else if (fromCurrency === 'USD' && currency === 'NGN') {
      return amount * exchangeRate;
    }
    return amount;
  };

  // Currency formatter function with conversion
  const formatCurrency = (amount: number, fromCurrency: 'NGN' | 'USD' = 'NGN') => {
    const convertedAmount = convertAmount(amount, fromCurrency);
    if (currency === 'USD') {
      return `$${convertedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `₦${convertedAmount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  // Currency symbol
  const currencySymbol = currency === 'USD' ? '$' : '₦';

  // Load data from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedInvoices = localStorage.getItem('cfo_invoices');
      const savedAccountsReceivable = localStorage.getItem('cfo_accounts_receivable');
      const savedExpenses = localStorage.getItem('cfo_expenses');
      const savedRevenues = localStorage.getItem('cfo_revenues');
      
      if (savedInvoices) {
        try {
          setInvoices(JSON.parse(savedInvoices));
        } catch (e) {
          console.error('Error loading invoices:', e);
        }
      }
      
      if (savedAccountsReceivable) {
        try {
          setAccountsReceivable(JSON.parse(savedAccountsReceivable));
        } catch (e) {
          console.error('Error loading accounts receivable:', e);
        }
      }
      
      if (savedExpenses) {
        try {
          setExpenses(JSON.parse(savedExpenses));
        } catch (e) {
          console.error('Error loading expenses:', e);
        }
      }
      
      if (savedRevenues) {
        try {
          setRevenues(JSON.parse(savedRevenues));
        } catch (e) {
          console.error('Error loading revenues:', e);
        }
      }
    }
  }, []);

  // Save invoices to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined' && invoices.length > 0) {
      localStorage.setItem('cfo_invoices', JSON.stringify(invoices));
    }
  }, [invoices]);

  // Save accounts receivable to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined' && accountsReceivable.length > 0) {
      localStorage.setItem('cfo_accounts_receivable', JSON.stringify(accountsReceivable));
    }
  }, [accountsReceivable]);

  // Save expenses to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined' && expenses.length > 0) {
      localStorage.setItem('cfo_expenses', JSON.stringify(expenses));
    }
  }, [expenses]);

  // Save revenues to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined' && revenues.length > 0) {
      localStorage.setItem('cfo_revenues', JSON.stringify(revenues));
    }
  }, [revenues]);

  // Bank balance checking function
  const checkBankBalance = async () => {
    try {
      // TODO: Replace with actual API credentials from environment variables
      const bearerToken = process.env.NEXT_PUBLIC_BANK_API_TOKEN || 'demo_token';
      const clientSecret = process.env.NEXT_PUBLIC_BANK_CLIENT_SECRET || 'demo_secret';
      const consentToken = process.env.NEXT_PUBLIC_BANK_CONSENT_TOKEN || 'demo_consent';
      const idempotencyKey = Date.now().toString();
      
      // Create signature (simplified - implement proper SHA-256 in production)
      const signature = `SHA-256(${idempotencyKey};${bearerToken})`;
      
      const response = await fetch(`https://666ab640-8d6a-491b-be32-e06642d051cf.mock.pstmn.io/accounts/${bankAccount}/balances`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${bearerToken}`,
          'idempotency_key': idempotencyKey,
          'signature': signature,
          'consent_token': consentToken,
        },
      });

      if (response.ok) {
        const result = await response.json();
        const newBalance = result.data.available_balance;
        
        // Calculate inflow
        const savedLastBalance = localStorage.getItem('last_bank_balance');
        const previousBalance = savedLastBalance ? parseFloat(savedLastBalance) : newBalance;
        const inflow = newBalance - previousBalance;
        
        console.log('Bank balance check:', {
          previousBalance,
          newBalance,
          inflow,
          timestamp: new Date().toISOString(),
        });
        
        // If there's a positive inflow, match it to unpaid invoices
        if (inflow > 0) {
          matchInflowToInvoices(inflow);
        }
        
        // Update balances
        setLastBalance(previousBalance);
        setCurrentBalance(newBalance);
        localStorage.setItem('last_bank_balance', newBalance.toString());
      }
    } catch (error) {
      console.error('Error checking bank balance:', error);
    }
  };

  // Match bank inflows to unpaid invoices
  const matchInflowToInvoices = (inflowAmount: number) => {
    const unpaidReceivables = accountsReceivable.filter(ar => !ar.isPaid);
    
    // Try to match the inflow amount to invoice amounts (with 1% tolerance for fees)
    for (const receivable of unpaidReceivables) {
      const invoiceAmount = receivable.amountNumeric;
      const tolerance = invoiceAmount * 0.01; // 1% tolerance
      
      if (Math.abs(inflowAmount - invoiceAmount) <= tolerance) {
        const paidDate = new Date().toISOString().split('T')[0];
        
        // Mark invoice as paid in accounts receivable
        const updatedReceivables = accountsReceivable.map(ar => 
          ar.invoiceId === receivable.invoiceId 
            ? { ...ar, isPaid: true, paidDate, status: 'paid' }
            : ar
        );
        setAccountsReceivable(updatedReceivables);
        
        // Create revenue record from paid invoice
        const newRevenue = {
          id: Date.now().toString(),
          invoiceId: receivable.invoiceId,
          invoiceNumber: receivable.invoiceNumber,
          client: receivable.client,
          amount: invoiceAmount,
          amountFormatted: `₦${invoiceAmount.toLocaleString()}`,
          category: 'Invoice Payment',
          date: paidDate,
          description: `Payment received for Invoice ${receivable.invoiceNumber} from ${receivable.client}`,
        };
        setRevenues([newRevenue, ...revenues]);
        
        console.log(`Invoice ${receivable.invoiceNumber} marked as paid. Amount: ₦${invoiceAmount.toLocaleString()}`);
        console.log('Revenue recorded:', newRevenue);
        alert(`Payment received for Invoice ${receivable.invoiceNumber} - ₦${invoiceAmount.toLocaleString()}\nRevenue recorded successfully!`);
        break;
      }
    }
  };

  // Payroll Calculation Functions
  const calculatePayrollBreakdown = (employee: any) => {
    // CONTRACT STAFF: Paid per ATM machine
    if (employee.employeeType === 'contract') {
      const atmCount = parseFloat(employee.atmCount) || 0;
      const ratePerAtm = parseFloat(employee.ratePerAtm) || 0;
      const monthlyGross = atmCount * ratePerAtm;
      
      // Contract staff - simplified calculation (no pension, no tax withholding)
      // They are responsible for their own taxes as independent contractors
      const hmo = parseFloat(employee.hmo) || 0;
      const loan = parseFloat(employee.loan) || 0;
      const penalty = parseFloat(employee.penalty) || 0;
      
      const totalDeductions = hmo + loan + penalty;
      const netPay = monthlyGross - totalDeductions;
      
      return {
        employeeType: 'contract',
        atmCount,
        ratePerAtm,
        annualGross: monthlyGross * 12,
        monthlyGross,
        basic: 0,
        transport: 0,
        housing: 0,
        others: 0,
        craMonthly: 0,
        pensionEmployee: 0,
        pensionEmployer: 0,
        totalReliefs: 0,
        taxablePay: 0,
        taxPayable: 0,
        minimumTax: 0,
        taxDue: 0,
        hmo,
        hmoCompany: 0,
        loan,
        wht: 0,
        penalty,
        netPay,
        totalDeductions
      };
    }
    
    // PERMANENT STAFF: Regular salary with Nigerian tax structure
    const annualGross = parseFloat(employee.annualGross) || 0;
    const monthlyGross = annualGross / 12;
    
    // Salary breakdown (Nigerian standard split)
    // Basic: 15% - Base salary component
    // Transport: 15% - Transportation allowance (non-taxable up to certain limit)
    // Housing: 15% - Accommodation allowance (non-taxable up to certain limit)
    // Others: 55% - Other allowances (meal, entertainment, utility, medical, etc.)
    //         This includes: meal allowance, entertainment allowance, utility allowance,
    //         leave allowance, medical allowance, and any other benefits
    const basic = (monthlyGross * employee.basicPercent) / 100;
    const transport = (monthlyGross * employee.transportPercent) / 100;
    const housing = (monthlyGross * employee.housingPercent) / 100;
    const others = (monthlyGross * employee.othersPercent) / 100;
    
    // CRA (Consolidated Relief Allowance) - Higher of 1% of gross annual or ₦200,000 + 20% of gross
    const craOption1 = annualGross * 0.01;
    const craOption2 = 200000 + (annualGross * 0.20);
    const craAnnual = Math.max(craOption1, craOption2);
    const craMonthly = craAnnual / 12;
    
    // Pension contributions
    const pensionEmployee = monthlyGross * 0.08; // 8% employee
    const pensionEmployer = monthlyGross * 0.10; // 10% employer
    
    // Total reliefs
    const totalReliefs = craMonthly + pensionEmployee;
    
    // Taxable pay
    const taxablePay = monthlyGross - totalReliefs;
    
    // Nigerian PAYE Tax calculation (2024 rates)
    let taxPayable = 0;
    let remaining = taxablePay * 12; // Annual taxable
    
    if (remaining > 0) {
      // First ₦300,000 at 7%
      const bracket1 = Math.min(remaining, 300000);
      taxPayable += bracket1 * 0.07;
      remaining -= bracket1;
    }
    if (remaining > 0) {
      // Next ₦300,000 at 11%
      const bracket2 = Math.min(remaining, 300000);
      taxPayable += bracket2 * 0.11;
      remaining -= bracket2;
    }
    if (remaining > 0) {
      // Next ₦500,000 at 15%
      const bracket3 = Math.min(remaining, 500000);
      taxPayable += bracket3 * 0.15;
      remaining -= bracket3;
    }
    if (remaining > 0) {
      // Next ₦500,000 at 19%
      const bracket4 = Math.min(remaining, 500000);
      taxPayable += bracket4 * 0.19;
      remaining -= bracket4;
    }
    if (remaining > 0) {
      // Next ₦1,600,000 at 21%
      const bracket5 = Math.min(remaining, 1600000);
      taxPayable += bracket5 * 0.21;
      remaining -= bracket5;
    }
    if (remaining > 0) {
      // Above ₦3,200,000 at 24%
      taxPayable += remaining * 0.24;
    }
    
    const monthlyTaxPayable = taxPayable / 12;
    
    // Minimum tax (0.5% of gross income)
    const minimumTax = (monthlyGross * 0.005);
    
    // Tax due is higher of calculated tax or minimum tax
    const taxDue = Math.max(monthlyTaxPayable, minimumTax);
    
    // Additional deductions
    const hmo = parseFloat(employee.hmo) || 0;
    const hmoCompany = parseFloat(employee.hmoCompany) || 0;
    const loan = parseFloat(employee.loan) || 0;
    const wht = monthlyGross * 0.05; // WHT 5%
    const penalty = parseFloat(employee.penalty) || 0;
    
    // Net pay calculation
    const totalDeductions = pensionEmployee + taxDue + hmo + loan + penalty;
    const netPay = monthlyGross - totalDeductions;
    
    return {
      employeeType: 'permanent',
      atmCount: 0,
      ratePerAtm: 0,
      annualGross,
      monthlyGross,
      basic,
      transport,
      housing,
      others,
      craMonthly,
      pensionEmployee,
      pensionEmployer,
      totalReliefs,
      taxablePay,
      taxPayable: monthlyTaxPayable,
      minimumTax,
      taxDue,
      hmo,
      hmoCompany,
      loan,
      wht,
      penalty,
      netPay,
      totalDeductions
    };
  };

  // Delete/Cancel Invoice function
  const handleDeleteInvoice = (invoiceToDelete: any) => {
    if (window.confirm(`Are you sure you want to cancel/delete Invoice ${invoiceToDelete.invoiceNumber}?\n\nThis will remove the invoice and its accounts receivable entry.`)) {
      // Remove from invoices list
      const updatedInvoices = invoices.filter(inv => inv.id !== invoiceToDelete.invoiceId);
      setInvoices(updatedInvoices);
      
      // Remove from accounts receivable
      const updatedReceivables = accountsReceivable.filter(ar => ar.invoiceId !== invoiceToDelete.invoiceId);
      setAccountsReceivable(updatedReceivables);
      
      // Close modal
      setShowInvoiceDetailsModal(false);
      
      console.log(`Invoice ${invoiceToDelete.invoiceNumber} cancelled/deleted`);
      alert(`Invoice ${invoiceToDelete.invoiceNumber} has been cancelled and removed.`);
    }
  };

  // Set up hourly bank balance checking
  useEffect(() => {
    // Check balance immediately on mount
    checkBankBalance();
    
    // Set up interval to check every hour (3600000 ms)
    const intervalId = setInterval(() => {
      checkBankBalance();
    }, 3600000); // 1 hour
    
    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [bankAccount, accountsReceivable]);

  // Client email mapping
  const clientEmails: { [key: string]: string } = {
    'First Bank': 'accounts@firstbank.ng',
    'Union Bank': 'finance@unionbank.ng',
    'Polaris Bank': 'billing@polarisbank.ng',
    'Sterling Bank': 'accounts@sterlingbank.ng',
    'GTBank': 'finance@gtbank.com',
    'Access Bank': 'accounts@accessbank.ng',
    'Zenith Bank': 'billing@zenithbank.com',
    'UBA': 'finance@ubagroup.com',
    'Fidelity Bank': 'accounts@fidelitybank.ng',
    'Stanbic IBTC': 'finance@stanbicibtc.com',
  };

  const handleSendInvoice = (invoice: any) => {
    setSelectedInvoice(invoice);
    setEmailData({
      to: clientEmails[invoice.client] || '',
      subject: `Invoice ${invoice.invoiceNumber} from ATM Solutions Ltd`,
      message: `Dear ${invoice.client} Team,\n\nPlease find attached invoice ${invoice.invoiceNumber} for the amount of ${formatCurrency(invoice.amount)}.\n\nDue Date: ${invoice.dueDate}\n\nThank you for your business.\n\nBest regards,\nATM Solutions Ltd`,
    });
    setShowEmailModal(true);
  };

  const sendInvoiceEmail = async () => {
    try {
      setIsSendingEmail(true);
      console.log('Starting to send email...');
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('Your session has expired. Please log in again.');
        window.location.href = '/login';
        return;
      }

      // Find the full invoice data
      const fullInvoice = invoices.find(inv => inv.invoiceNumber === selectedInvoice?.invoiceNumber);
      
      if (!fullInvoice) {
        alert('Invoice not found');
        setIsSendingEmail(false);
        return;
      }

      // Prepare invoice data for email (with items from invoiceData if it's the current invoice)
      const invoicePayload = {
        invoiceNumber: fullInvoice.invoiceNumber,
        client: fullInvoice.client,
        amount: fullInvoice.amount,
        issueDate: fullInvoice.issueDate,
        dueDate: fullInvoice.dueDate,
        items: invoiceData.items.filter(item => item.description).length > 0 
          ? invoiceData.items.filter(item => item.description)
          : [{ description: 'ATM Maintenance Services', quantity: 1, rate: fullInvoice.amount, amount: fullInvoice.amount }],
        vat: invoiceData.vat || 7.5,
        notes: invoiceData.notes || '',
      };

      console.log('Sending to:', emailData.to);
      console.log('Invoice payload:', invoicePayload);

      // Try to send via backend, with fallback
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await fetch(`${apiUrl}/email/send-invoice`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            to: emailData.to,
            subject: emailData.subject,
            message: emailData.message,
            invoice: invoicePayload,
          }),
        });

        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response data:', data);

        if (data.success) {
          alert(`✅ Invoice sent successfully to ${emailData.to}${data.previewUrl ? '\n\nPreview URL (for testing): ' + data.previewUrl : ''}`);
          setShowEmailModal(false);
          setSelectedInvoice(null);
          setEmailData({ to: '', subject: '', message: '' });
        } else {
          throw new Error(data.message || data.error || 'Failed to send email');
        }
      } catch (fetchError) {
        // Backend not available - show email preview instead
        console.warn('Email backend not available, showing preview:', fetchError);
        
        const emailPreview = `
📧 EMAIL PREVIEW (Backend not running)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TO: ${emailData.to}
SUBJECT: ${emailData.subject}

MESSAGE:
${emailData.message}

INVOICE DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Invoice #: ${invoicePayload.invoiceNumber}
Client: ${invoicePayload.client}
Amount: ${formatCurrency(invoicePayload.amount)}
Issue Date: ${new Date(invoicePayload.issueDate).toLocaleDateString()}
Due Date: ${new Date(invoicePayload.dueDate).toLocaleDateString()}

⚠️ NOTE: Email backend is not running. To send actual emails:
1. Start the backend server: npm run dev (in backend folder)
2. Or copy the above content and send manually

The invoice has been saved in the system.
        `;
        
        alert(emailPreview);
        setShowEmailModal(false);
        setSelectedInvoice(null);
        setEmailData({ to: '', subject: '', message: '' });
      }
    } catch (error: any) {
      console.error('Error sending invoice email:', error);
      alert(`Error sending email: ${error.message}`);
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Client data from sales database
  // Get clients who have legal documents (confirmed they have necessary docs)
  const getClientsWithLegalDocs = (): string[] => {
    try {
      const legalDocs = localStorage.getItem('legal_documents');
      if (legalDocs) {
        const documents = JSON.parse(legalDocs);
        // Get unique client names who have Award Letter or Purchase Order
        const clientsWithDocs = documents
          .filter((doc: any) => 
            doc.clientName && 
            (doc.type === 'Award Letter' || doc.type === 'Purchase Order' || doc.category === 'Award Letter')
          )
          .map((doc: any) => doc.clientName);
        return Array.from(new Set<string>(clientsWithDocs)).sort();
      }
    } catch (error) {
      console.error('Error loading clients from Legal:', error);
    }
    return [];
  };

  const clients = getClientsWithLegalDocs();

  // Calculate asset values
  const totalAssetValue = assets.reduce((sum, asset) => sum + (asset.currentValue * asset.quantity), 0);
  const totalAssetPurchase = assets.reduce((sum, asset) => sum + (asset.purchasePrice * asset.quantity), 0);
  const assetAppreciation = totalAssetValue - totalAssetPurchase;

  // Calculate financial metrics from actual data
  const totalRevenue = revenues.reduce((sum, rev) => sum + rev.amount, 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const cashFlow = currentBalance - lastBalance;
  
  // Total equity = Cash + Assets - Liabilities
  const totalEquity = currentBalance + totalAssetValue;

  const financialMetrics = [
    { label: 'Total Revenue', value: formatCurrency(totalRevenue), change: '0%', trend: 'up' },
    { label: 'Operating Costs', value: formatCurrency(totalExpenses), change: '0%', trend: 'up' },
    { label: 'Net Profit', value: formatCurrency(netProfit), change: '0%', trend: netProfit >= 0 ? 'up' : 'down' },
    { label: 'Cash Flow', value: formatCurrency(cashFlow), change: '0%', trend: cashFlow >= 0 ? 'up' : 'down' },
    { label: 'Total Assets', value: formatCurrency(totalAssetValue), change: '0%', trend: 'up', subtitle: `${assets.length} assets` },
    { label: 'Total Equity', value: formatCurrency(totalEquity), change: '0%', trend: 'up', subtitle: 'Cash + Assets' },
  ];

  const revenueStreams: any[] = [];

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Finance Dashboard</h1>
              <p className="mt-1 text-sm text-gray-600">Financial overview and metrics</p>
            </div>
            <div className="flex gap-2 items-start">
              {/* Currency Toggle */}
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-md p-1 h-[42px]">
                  <button
                    onClick={() => setCurrency('NGN')}
                    className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                      currency === 'NGN' 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    ₦ NGN
                  </button>
                  <button
                    onClick={() => setCurrency('USD')}
                    className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                      currency === 'USD' 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    $ USD
                  </button>
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  Rate: $1 = ₦{exchangeRate.toFixed(2)}
                </span>
              </div>
              
              <button 
                onClick={() => setShowInvoiceModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                + Create Invoice
              </button>
              <button 
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                + Record Expense
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
          {/* Financial Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {financialMetrics.map((metric) => (
              <div key={metric.label} className="bg-white rounded-lg shadow p-6">
                <div className="text-sm font-medium text-gray-600">{metric.label}</div>
                <div className="mt-2 flex items-baseline">
                  <div className="text-3xl font-bold text-gray-900">{metric.value}</div>
                  <div className={`ml-2 text-sm font-semibold ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {metric.change}
                  </div>
                </div>
                {(metric as any).subtitle && (
                  <div className="text-xs text-gray-500 mt-1">{(metric as any).subtitle}</div>
                )}
              </div>
            ))}
          </div>

          {/* Invoices Section - Removed, now accessible via Accounts Receivable */}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Streams */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Streams</h3>
              <div className="space-y-4">
                {revenueStreams.map((stream) => (
                  <div key={stream.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{stream.name}</span>
                      <span className="text-gray-900 font-semibold">{stream.amount}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className={`h-2 rounded-full ${stream.color}`} style={{ width: `${stream.percentage}%` }}></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{stream.percentage}% of total</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Accounts Receivable */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Accounts Receivable (Unpaid)</h3>
              {accountsReceivable.filter(ar => !ar.isPaid).length === 0 ? (
                <p className="text-gray-500 text-sm">No outstanding invoices</p>
              ) : (
                <div className="space-y-4">
                  {accountsReceivable.filter(ar => !ar.isPaid).map((account) => (
                    <div 
                      key={account.invoiceId} 
                      className="flex justify-between items-center border-b pb-3 last:border-b-0 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                      onClick={() => {
                        setSelectedInvoice(account);
                        setShowInvoiceDetailsModal(true);
                      }}
                    >
                      <div>
                        <div className="font-medium text-gray-900">{account.client}</div>
                        <div className="text-sm text-gray-500">Due: {account.dueDate}</div>
                        <div className="text-xs text-gray-400">Invoice: {account.invoiceNumber}</div>
                        {account.isPartialPayment && (
                          <div className="text-xs text-blue-600 font-medium mt-1">
                            Initial Payment: {formatCurrency(account.initialPayment || 0)} received
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">{formatCurrency(account.amountNumeric || 0)}</div>
                        {account.isPartialPayment && (
                          <div className="text-xs text-gray-500">
                            (Total: {formatCurrency(account.totalAmount || 0)})
                          </div>
                        )}
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          account.status === 'overdue' ? 'bg-red-100 text-red-800' : 
                          account.status === 'due-today' ? 'bg-orange-100 text-orange-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {account.status === 'overdue' ? 'OVERDUE' :
                           account.status === 'due-today' ? 'DUE TODAY' :
                           'UPCOMING'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Assets Summary Section */}
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Company Assets</h3>
                <p className="text-sm text-gray-600">Total asset portfolio value</p>
              </div>
              <a 
                href="/assets"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View All Assets →
              </a>
            </div>
            
            {assets.length > 0 ? (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="text-sm text-blue-600 font-medium">Total Assets</div>
                    <div className="text-2xl font-bold text-blue-700 mt-1">{assets.length}</div>
                    <div className="text-xs text-blue-600 mt-1">Items tracked</div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="text-sm text-green-600 font-medium">Current Value</div>
                    <div className="text-2xl font-bold text-green-700 mt-1">{formatCurrency(totalAssetValue)}</div>
                    <div className="text-xs text-green-600 mt-1">Market value</div>
                  </div>
                  <div className={`border rounded-lg p-4 ${assetAppreciation >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className={`text-sm font-medium ${assetAppreciation >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      Appreciation
                    </div>
                    <div className={`text-2xl font-bold mt-1 ${assetAppreciation >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                      {formatCurrency(assetAppreciation)}
                    </div>
                    <div className={`text-xs mt-1 ${assetAppreciation >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {((assetAppreciation / totalAssetPurchase) * 100).toFixed(1)}% change
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asset Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Purchase Value</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Current Value</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Change</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {assets.slice(0, 5).map((asset: any) => {
                        const change = ((asset.currentValue - asset.purchasePrice) / asset.purchasePrice * 100);
                        return (
                          <tr key={asset.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{asset.name}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{asset.assetClass}</td>
                            <td className="px-4 py-3 text-sm text-right text-gray-900">
                              {formatCurrency(asset.purchasePrice * asset.quantity)}
                            </td>
                            <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                              {formatCurrency(asset.currentValue * asset.quantity)}
                            </td>
                            <td className={`px-4 py-3 text-sm text-right font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {change >= 0 ? '+' : ''}{change.toFixed(1)}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                
                {assets.length > 5 && (
                  <div className="mt-4 text-center">
                    <a 
                      href="/assets"
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      View all {assets.length} assets →
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">🏢</div>
                <p className="text-sm">No assets tracked yet</p>
                <a 
                  href="/assets"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 inline-block"
                >
                  Add your first asset →
                </a>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <button 
              onClick={() => alert('P&L Report feature coming soon!')}
              className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg text-sm font-medium"
            >
              P&L Report
            </button>
            <button 
              onClick={() => setShowCashFlowModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg text-sm font-medium"
            >
              Cash Flow
            </button>
            <button 
              onClick={() => setShowBudgetModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg text-sm font-medium"
            >
              Budget Review
            </button>
            <button 
              onClick={() => setShowPayrollModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg text-sm font-medium"
            >
              Payroll
            </button>
          </div>

          {/* Procurement Approvals Section */}
          <div className="mt-6">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📦</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">Procurement Approvals</h3>
                    <p className="text-sm text-gray-600">
                      {procurementRequests.filter(r => r.status === 'pending-finance').length} requests pending approval
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowProcurementModal(true)}
                  className="bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg text-sm font-medium"
                >
                  Review Requests
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-[10000]" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Record Expense</h2>
            <p className="text-sm text-gray-600 mb-4">Revenue is automatically tracked through invoices. Use this form to record business expenses only.</p>
            <form onSubmit={(e) => {
              e.preventDefault();
              // TODO: Submit to backend API
              const newExpense = {
                id: Date.now(),
                ...formData,
                amount: parseFloat(formData.amount.replace(/,/g, '')),
                date: formData.date || new Date().toISOString().split('T')[0],
              };
              setExpenses([newExpense, ...expenses]);
              console.log('New expense:', newExpense);
              setShowAddModal(false);
              setFormData({
                type: 'expense',
                category: '',
                amount: '',
                description: '',
                date: '',
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expense Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    required
                  >
                    <option value="">Select expense category</option>
                    <option value="Spare Parts">Spare Parts</option>
                    <option value="Salaries">Salaries & Wages</option>
                    <option value="Transport">Transport & Logistics</option>
                    <option value="Office">Office Supplies</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Equipment">Equipment & Tools</option>
                    <option value="Marketing">Marketing & Advertising</option>
                    <option value="Professional">Professional Services</option>
                    <option value="Other">Other Expenses</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount ({currencySymbol})</label>
                  <input
                    type="text"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    placeholder="e.g., 1,500,000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    placeholder="Transaction details..."
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
                >
                  Record Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Invoice Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={() => setShowInvoiceModal(false)}>
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto relative z-[10000]" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Create Invoice</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const total = invoiceData.items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0) * (1 + invoiceData.vat / 100);
              const initialPaymentAmount = parseFloat(invoiceData.initialPayment) || 0;
              const balanceAmount = total - initialPaymentAmount;
              
              const newInvoice = {
                id: Date.now().toString(),
                invoiceNumber: invoiceData.invoiceNumber,
                client: invoiceData.client,
                amount: total,
                initialPayment: initialPaymentAmount,
                initialPaymentDate: invoiceData.initialPaymentDate || null,
                balanceAmount: balanceAmount,
                balancePaymentDate: invoiceData.balancePaymentDate || invoiceData.dueDate,
                issueDate: invoiceData.issueDate,
                dueDate: invoiceData.dueDate,
                status: initialPaymentAmount >= total ? 'paid' : 'pending' as 'pending' | 'paid' | 'overdue',
                paymentType: initialPaymentAmount > 0 && initialPaymentAmount < total ? 'partial' : initialPaymentAmount >= total ? 'full' : 'none',
              };
              setInvoices([newInvoice, ...invoices]);
              
              // Add to accounts receivable if unpaid (includes future and past-due)
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const dueDate = new Date(invoiceData.balancePaymentDate || invoiceData.dueDate);
              dueDate.setHours(0, 0, 0, 0);
              
              // Determine status based on due date
              let invoiceStatus = 'upcoming';
              if (dueDate < today) {
                invoiceStatus = 'overdue';
              } else if (dueDate.getTime() === today.getTime()) {
                invoiceStatus = 'due-today';
              }
              
              // Only add to accounts receivable if there's a balance due
              if (balanceAmount > 0) {
                const newReceivable = {
                  client: invoiceData.client,
                  amount: formatCurrency(balanceAmount),
                  amountNumeric: balanceAmount,
                  totalAmount: total,
                  initialPayment: initialPaymentAmount,
                  dueDate: invoiceData.balancePaymentDate || invoiceData.dueDate,
                  status: invoiceStatus,
                  invoiceNumber: invoiceData.invoiceNumber,
                  invoiceId: newInvoice.id,
                  isPaid: false,
                  isPartialPayment: initialPaymentAmount > 0,
                };
                setAccountsReceivable([newReceivable, ...accountsReceivable]);
              }
              
              console.log('New invoice:', invoiceData);
              setShowInvoiceModal(false);
              setInvoiceData({
                client: '',
                invoiceNumber: '',
                category: '',
                issueDate: '',
                dueDate: '',
                items: [{ description: '', quantity: 1, rate: '', amount: '' }],
                vat: 7.5,
                notes: '',
                initialPayment: '',
                initialPaymentDate: '',
                balancePaymentDate: '',
              });
            }}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                    <select
                      value={invoiceData.client}
                      onChange={(e) => setInvoiceData({...invoiceData, client: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      required
                    >
                      <option value="">Select client with legal documents</option>
                      {clients.length > 0 ? (
                        clients.map((client) => (
                          <option key={client} value={client}>{client}</option>
                        ))
                      ) : (
                        <option disabled>No clients with legal documents available</option>
                      )}
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                      Only clients with Award Letter/Purchase Order in Legal module
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
                    <input
                      type="text"
                      required
                      value={invoiceData.invoiceNumber}
                      onChange={(e) => setInvoiceData({...invoiceData, invoiceNumber: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      placeholder="e.g., INV-2024-001"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Category</label>
                  <select
                    value={invoiceData.category}
                    onChange={(e) => setInvoiceData({...invoiceData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    required
                  >
                    <option value="">Select business category</option>
                    <option value="Software">Software</option>
                    <option value="ATM Maintenance">ATM Maintenance</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
                    <input
                      type="date"
                      required
                      value={invoiceData.issueDate}
                      onChange={(e) => setInvoiceData({...invoiceData, issueDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                    <input
                      type="date"
                      required
                      value={invoiceData.dueDate}
                      onChange={(e) => setInvoiceData({...invoiceData, dueDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Line Items</label>
                  {invoiceData.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 mb-2">
                      <input
                        type="text"
                        required
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => {
                          const newItems = [...invoiceData.items];
                          newItems[index].description = e.target.value;
                          setInvoiceData({...invoiceData, items: newItems});
                        }}
                        className="col-span-5 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      />
                      <input
                        type="number"
                        required
                        min="1"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => {
                          const newItems = [...invoiceData.items];
                          newItems[index].quantity = parseInt(e.target.value);
                          const rate = parseFloat(newItems[index].rate) || 0;
                          newItems[index].amount = (newItems[index].quantity * rate).toFixed(2);
                          setInvoiceData({...invoiceData, items: newItems});
                        }}
                        className="col-span-2 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      />
                      <input
                        type="text"
                        required
                        placeholder={`Rate (${currencySymbol})`}
                        value={item.rate}
                        onChange={(e) => {
                          const newItems = [...invoiceData.items];
                          newItems[index].rate = e.target.value;
                          const rate = parseFloat(e.target.value) || 0;
                          newItems[index].amount = (newItems[index].quantity * rate).toFixed(2);
                          setInvoiceData({...invoiceData, items: newItems});
                        }}
                        className="col-span-2 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      />
                      <input
                        type="text"
                        readOnly
                        placeholder="Amount"
                        value={item.amount}
                        className="col-span-2 px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newItems = invoiceData.items.filter((_, i) => i !== index);
                          setInvoiceData({...invoiceData, items: newItems.length ? newItems : [{ description: '', quantity: 1, rate: '', amount: '' }]});
                        }}
                        className="col-span-1 text-red-600 hover:text-red-800"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setInvoiceData({...invoiceData, items: [...invoiceData.items, { description: '', quantity: 1, rate: '', amount: '' }]});
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    + Add Line Item
                  </button>
                </div>

                <div className="border-t pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(invoiceData.items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0))}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <label className="text-sm text-gray-600">VAT (%):</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={invoiceData.vat}
                        onChange={(e) => setInvoiceData({...invoiceData, vat: parseFloat(e.target.value) || 0})}
                        className="w-24 px-3 py-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-right bg-white text-gray-900"
                      />
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">VAT Amount:</span>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(
                          invoiceData.items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0) * 
                          (invoiceData.vat / 100)
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span className="text-gray-900">Total Amount:</span>
                      <span className="text-gray-900">
                        {formatCurrency(
                          invoiceData.items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0) * 
                          (1 + invoiceData.vat / 100)
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    rows={3}
                    value={invoiceData.notes}
                    onChange={(e) => setInvoiceData({...invoiceData, notes: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    placeholder="Additional notes or payment terms..."
                  />
                </div>

                {/* Partial Payment Section */}
                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Payment Schedule (Optional)</h3>
                  <p className="text-xs text-gray-500 mb-3">If client pays an initial deposit, enter the amount and dates below</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Initial Payment Amount ({currencySymbol})</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={invoiceData.initialPayment}
                        onChange={(e) => setInvoiceData({...invoiceData, initialPayment: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                        placeholder="Enter deposit amount"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Initial Payment Date</label>
                      <input
                        type="date"
                        value={invoiceData.initialPaymentDate}
                        onChange={(e) => setInvoiceData({...invoiceData, initialPaymentDate: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Balance Payment Due Date</label>
                      <input
                        type="date"
                        value={invoiceData.balancePaymentDate}
                        onChange={(e) => setInvoiceData({...invoiceData, balancePaymentDate: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      />
                      <p className="mt-1 text-xs text-gray-500">Leave empty to use due date</p>
                    </div>

                    {invoiceData.initialPayment && parseFloat(invoiceData.initialPayment) > 0 && (
                      <div className="bg-blue-50 p-3 rounded-md">
                        <p className="text-xs font-medium text-blue-900 mb-1">Payment Summary:</p>
                        <p className="text-xs text-blue-800">
                          Initial: {formatCurrency(parseFloat(invoiceData.initialPayment))}
                        </p>
                        <p className="text-xs text-blue-800">
                          Balance: {formatCurrency(
                            (invoiceData.items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0) * (1 + invoiceData.vat / 100)) - 
                            parseFloat(invoiceData.initialPayment)
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowInvoiceModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium"
                >
                  Create Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Send Invoice Email Modal */}
      {showEmailModal && selectedInvoice && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={() => setShowEmailModal(false)}>
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-[10000]" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Send Invoice via Email</h2>
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="text-sm text-blue-800">
                <strong>Invoice:</strong> {selectedInvoice.invoiceNumber} | <strong>Client:</strong> {selectedInvoice.client} | <strong>Amount:</strong> {formatCurrency(selectedInvoice.amount)}
              </div>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              sendInvoiceEmail();
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Email</label>
                  <input
                    type="email"
                    required
                    value={emailData.to}
                    onChange={(e) => setEmailData({...emailData, to: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    placeholder="recipient@company.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    value={emailData.subject}
                    onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    required
                    rows={8}
                    value={emailData.message}
                    onChange={(e) => setEmailData({...emailData, message: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                  />
                </div>

                <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    <span>Invoice PDF will be automatically attached</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingEmail}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md font-medium flex items-center justify-center"
                >
                  {isSendingEmail ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Send Email
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Details Modal */}
      {showInvoiceDetailsModal && selectedInvoice && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={() => setShowInvoiceDetailsModal(false)}>
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-[10000]" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Invoice Details</h2>
              <button 
                onClick={() => setShowInvoiceDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Client</label>
                  <div className="text-lg font-semibold text-gray-900">{selectedInvoice.client}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Amount</label>
                  <div className="text-lg font-semibold text-gray-900">{selectedInvoice.amount}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Due Date</label>
                  <div className="text-base text-gray-900">{selectedInvoice.dueDate}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      selectedInvoice.status === 'overdue' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedInvoice.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {selectedInvoice.invoiceNumber && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Invoice Number</label>
                  <div className="text-base text-gray-900">{selectedInvoice.invoiceNumber}</div>
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setShowInvoiceDetailsModal(false);
                  handleSendInvoice(selectedInvoice);
                }}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md font-medium"
              >
                Send Invoice
              </button>
              <button
                onClick={() => handleDeleteInvoice(selectedInvoice)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium"
              >
                Cancel Invoice
              </button>
              <button
                onClick={() => setShowInvoiceDetailsModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payroll Approval - Nigerian System */}
      {showPayrollModal && (
        <PayrollApproval
          payrolls={payrollSubmissions}
          onApprove={handleApprove}
          onReject={handleReject}
          onMarkPaid={handleMarkPaid}
          onClose={() => setShowPayrollModal(false)}
        />
      )}

      {/* Cash Flow Modal */}
      {showCashFlowModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Cash Flow Statement</h2>
                  <p className="text-sm text-gray-600 mt-1">Track money in and out of your business</p>
                </div>
                <button onClick={() => setShowCashFlowModal(false)} className="text-gray-500 hover:text-gray-700">
                  <span className="text-2xl">×</span>
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-sm text-green-600 font-medium">Cash Inflows</div>
                  <div className="text-2xl font-bold text-green-700 mt-1">
                    {formatCurrency(revenues.reduce((sum, rev) => sum + rev.amount, 0))}
                  </div>
                  <div className="text-xs text-green-600 mt-1">{revenues.length} transactions</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="text-sm text-red-600 font-medium">Cash Outflows</div>
                  <div className="text-2xl font-bold text-red-700 mt-1">
                    {formatCurrency(expenses.reduce((sum, exp) => sum + exp.amount, 0))}
                  </div>
                  <div className="text-xs text-red-600 mt-1">{expenses.length} transactions</div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-sm text-blue-600 font-medium">Net Cash Flow</div>
                  <div className={`text-2xl font-bold mt-1 ${cashFlow >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                    {formatCurrency(cashFlow)}
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    Current: {formatCurrency(currentBalance)}
                  </div>
                </div>
              </div>

              {/* Cash Inflows */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">💰 Cash Inflows (Revenue)</h3>
                <div className="bg-white border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {revenues.length > 0 ? revenues.map((rev) => (
                        <tr key={rev.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{new Date(rev.date).toLocaleDateString()}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{rev.category}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{rev.description}</td>
                          <td className="px-4 py-3 text-sm text-right text-green-600 font-medium">
                            +{formatCurrency(rev.amount)}
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-gray-500">No revenue transactions</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Cash Outflows */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">💸 Cash Outflows (Expenses)</h3>
                <div className="bg-white border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {expenses.length > 0 ? expenses.map((exp) => (
                        <tr key={exp.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{new Date(exp.date).toLocaleDateString()}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{exp.category}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{exp.description}</td>
                          <td className="px-4 py-3 text-sm text-right text-red-600 font-medium">
                            -{formatCurrency(exp.amount)}
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-gray-500">No expense transactions</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Budget Review Modal */}
      {showBudgetModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={() => setShowBudgetModal(false)}>
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto relative z-[10000]" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Budget Review & Planning</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const budgetData = {
                period: formData.get('period'),
                category: formData.get('category'),
                budgetedAmount: formData.get('budgetedAmount'),
                actualAmount: formData.get('actualAmount'),
                notes: formData.get('notes'),
              };
              console.log('Budget data:', budgetData);
              // TODO: Submit to backend API
              alert('Budget updated successfully!');
              setShowBudgetModal(false);
            }}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Budget Period</label>
                    <select
                      name="period"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    >
                      <option value="">Select period</option>
                      <option value="January 2025">January 2025</option>
                      <option value="February 2025">February 2025</option>
                      <option value="March 2025">March 2025</option>
                      <option value="Q1 2025">Q1 2025</option>
                      <option value="Q2 2025">Q2 2025</option>
                      <option value="Q3 2025">Q3 2025</option>
                      <option value="Q4 2025">Q4 2025</option>
                      <option value="2025">Full Year 2025</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      name="category"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    >
                      <option value="">Select category</option>
                      <option value="Revenue">Revenue</option>
                      <option value="Operating Expenses">Operating Expenses</option>
                      <option value="Salaries & Wages">Salaries & Wages</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Equipment">Equipment</option>
                      <option value="Office Expenses">Office Expenses</option>
                      <option value="Transport">Transport</option>
                      <option value="Utilities">Utilities</option>
                      <option value="Professional Services">Professional Services</option>
                      <option value="Capital Expenditure">Capital Expenditure</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Budgeted Amount ({currencySymbol})</label>
                    <input
                      type="number"
                      name="budgetedAmount"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      placeholder="5000000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Actual Amount ({currencySymbol}) - Auto-calculated from Expenses</label>
                    <input
                      type="number"
                      name="actualAmount"
                      value={(() => {
                        const category = (document.querySelector('select[name="category"]') as HTMLSelectElement)?.value;
                        if (!category) return '';
                        
                        // Map budget categories to expense categories
                        const categoryMap: { [key: string]: string[] } = {
                          'Salaries & Wages': ['Salaries'],
                          'Marketing': ['Marketing'],
                          'Equipment': ['Equipment'],
                          'Office Expenses': ['Office'],
                          'Transport': ['Transport'],
                          'Utilities': ['Utilities'],
                          'Professional Services': ['Professional'],
                          'Operating Expenses': ['Spare Parts', 'Other'],
                        };
                        
                        const expenseCategories = categoryMap[category] || [];
                        const total = expenses
                          .filter(exp => expenseCategories.includes(exp.category))
                          .reduce((sum, exp) => sum + exp.amount, 0);
                        
                        return total || '';
                      })()}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-900 cursor-not-allowed"
                      placeholder="Auto-calculated from expenses"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    name="notes"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    placeholder="Budget notes, variance explanation, or action items..."
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <h3 className="text-sm font-semibold text-blue-900 mb-2">Budget Summary</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-blue-700">Variance:</div>
                    <div className="text-blue-900 font-medium">Will be calculated</div>
                    <div className="text-blue-700">Status:</div>
                    <div className="text-blue-900 font-medium">Under/Over Budget</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowBudgetModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
                >
                  Save Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Procurement Approval Modal */}
      {showProcurementModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Procurement Approvals</h2>
                  <p className="text-sm text-gray-600 mt-1">Review and approve purchase requests from Procurement</p>
                </div>
                <button onClick={() => setShowProcurementModal(false)} className="text-gray-500 hover:text-gray-700">
                  <span className="text-2xl">×</span>
                </button>
              </div>
            </div>

            <div className="p-6">
              {procurementRequests.filter(r => r.status === 'pending-finance').length > 0 ? (
                <div className="space-y-4">
                  {procurementRequests.filter(r => r.status === 'pending-finance').map((request) => (
                    <div key={request.id} className="border rounded-lg p-6 hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">{request.item}</h3>
                          <p className="text-sm text-gray-600 mt-1">{request.description}</p>
                          
                          <div className="grid grid-cols-2 gap-4 mt-4">
                            <div>
                              <span className="text-xs text-gray-500">Requesting Department:</span>
                              <p className="font-medium text-gray-900">{request.department}</p>
                            </div>
                            <div>
                              <span className="text-xs text-gray-500">Category:</span>
                              <p className="font-medium text-gray-900">{request.category}</p>
                            </div>
                            <div>
                              <span className="text-xs text-gray-500">Quantity:</span>
                              <p className="font-medium text-gray-900">{request.quantity}</p>
                            </div>
                            <div>
                              <span className="text-xs text-gray-500">Requested By:</span>
                              <p className="font-medium text-gray-900">{request.requestedBy}</p>
                            </div>
                            <div>
                              <span className="text-xs text-gray-500">Initial Budget:</span>
                              <p className="font-medium text-gray-900">₦{request.budget?.toLocaleString()}</p>
                            </div>
                            <div>
                              <span className="text-xs text-gray-500">Vendor:</span>
                              <p className="font-medium text-green-700">{request.vendor}</p>
                            </div>
                            <div className="col-span-2">
                              <span className="text-xs text-gray-500">Negotiated Price:</span>
                              <p className="text-xl font-bold text-purple-700">₦{request.negotiatedPrice?.toLocaleString()}</p>
                              {request.negotiatedPrice < request.budget && (
                                <p className="text-xs text-green-600 mt-1">
                                  ✓ Savings: ₦{(request.budget - request.negotiatedPrice).toLocaleString()} 
                                  ({(((request.budget - request.negotiatedPrice) / request.budget) * 100).toFixed(1)}%)
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Display Invoices */}
                      {request.invoices && request.invoices.length > 0 && (
                        <div className="mt-4 pt-4 border-t">
                          <h4 className="font-semibold text-gray-900 mb-3">📄 Attached Invoices ({request.invoices.length})</h4>
                          <div className="space-y-2">
                            {request.invoices.map((invoice: any, index: number) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl">📄</span>
                                  <div>
                                    <p className="font-medium text-gray-900 text-sm">{invoice.name}</p>
                                    <p className="text-xs text-gray-500">
                                      {(invoice.size / 1024).toFixed(2)} KB • Uploaded: {new Date(invoice.uploadedAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                                <a
                                  href={invoice.data}
                                  download={invoice.name}
                                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium"
                                >
                                  Download
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-3 pt-4 border-t mt-4">
                        <button
                          onClick={() => {
                            const updatedRequests = procurementRequests.map(r =>
                              r.id === request.id ? { ...r, status: 'approved', approvedBy: 'Finance', approvedAt: new Date().toISOString() } : r
                            );
                            setProcurementRequests(updatedRequests);
                            localStorage.setItem('procurement_requests', JSON.stringify(updatedRequests));
                            alert('✅ Purchase request approved!');
                          }}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium"
                        >
                          ✓ Approve Purchase
                        </button>
                        <button
                          onClick={() => {
                            const reason = prompt('Enter rejection reason:');
                            if (reason) {
                              const updatedRequests = procurementRequests.map(r =>
                                r.id === request.id ? { ...r, status: 'rejected', rejectionReason: reason, rejectedBy: 'Finance', rejectedAt: new Date().toISOString() } : r
                              );
                              setProcurementRequests(updatedRequests);
                              localStorage.setItem('procurement_requests', JSON.stringify(updatedRequests));
                              alert('❌ Purchase request rejected');
                            }
                          }}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium"
                        >
                          ✗ Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-6xl mb-4">📦</div>
                  <p className="text-lg font-medium">No pending procurement requests</p>
                  <p className="text-sm mt-2">Approved and rejected requests are visible in Procurement</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

