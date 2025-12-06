import { Request, Response } from 'express';

// Payroll submission interface
interface PayrollEmployee {
  id: string;
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
}

interface PayrollSubmission {
  id: string;
  month: string;
  year: string;
  employees: PayrollEmployee[];
  totalGross: number;
  totalNet: number;
  totalDeductions: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'paid';
  submittedBy: string;
  submittedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  paidAt?: string;
  companyId: string;
}

// In-memory storage (replace with database in production)
let payrollSubmissions: PayrollSubmission[] = [];

/**
 * Get all payroll submissions for a company
 */
export const getPayrolls = async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    
    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: 'Company ID not found'
      });
    }

    const companyPayrolls = payrollSubmissions.filter(p => p.companyId === companyId);

    return res.status(200).json({
      success: true,
      payrolls: companyPayrolls
    });
  } catch (error) {
    console.error('Error fetching payrolls:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching payrolls'
    });
  }
};

/**
 * Get a single payroll by ID
 */
export const getPayrollById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.user?.companyId;

    const payroll = payrollSubmissions.find(p => p.id === id && p.companyId === companyId);

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: 'Payroll not found'
      });
    }

    return res.status(200).json({
      success: true,
      payroll
    });
  } catch (error) {
    console.error('Error fetching payroll:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching payroll'
    });
  }
};

/**
 * Create/Submit a new payroll
 */
export const createPayroll = async (req: Request, res: Response) => {
  try {
    const companyId = (req.user as any)?.companyId;
    const userId = (req.user as any)?.id;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: 'Company ID not found'
      });
    }

    const payrollData: PayrollSubmission = {
      ...req.body,
      companyId,
      submittedBy: userId,
      submittedAt: new Date().toISOString()
    };

    payrollSubmissions.push(payrollData);

    return res.status(201).json({
      success: true,
      message: 'Payroll created successfully',
      payroll: payrollData
    });
  } catch (error) {
    console.error('Error creating payroll:', error);
    return res.status(500).json({
      success: false,
      message: 'Error creating payroll'
    });
  }
};

/**
 * Update payroll (for drafts)
 */
export const updatePayroll = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.user?.companyId;

    const payrollIndex = payrollSubmissions.findIndex(
      p => p.id === id && p.companyId === companyId
    );

    if (payrollIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Payroll not found'
      });
    }

    const currentPayroll = payrollSubmissions[payrollIndex];

    // Only allow updates to draft payrolls
    if (currentPayroll.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Only draft payrolls can be updated'
      });
    }

    payrollSubmissions[payrollIndex] = {
      ...currentPayroll,
      ...req.body,
      id: currentPayroll.id, // Preserve ID
      companyId: currentPayroll.companyId, // Preserve company ID
      submittedBy: currentPayroll.submittedBy, // Preserve submitter
      submittedAt: currentPayroll.submittedAt // Preserve submission date
    };

    return res.status(200).json({
      success: true,
      message: 'Payroll updated successfully',
      payroll: payrollSubmissions[payrollIndex]
    });
  } catch (error) {
    console.error('Error updating payroll:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating payroll'
    });
  }
};

/**
 * Approve payroll (Finance only)
 */
export const approvePayroll = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = (req.user as any)?.companyId;
    const userId = (req.user as any)?.id;

    const payrollIndex = payrollSubmissions.findIndex(
      p => p.id === id && p.companyId === companyId
    );

    if (payrollIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Payroll not found'
      });
    }

    const currentPayroll = payrollSubmissions[payrollIndex];

    if (currentPayroll.status !== 'submitted') {
      return res.status(400).json({
        success: false,
        message: 'Only submitted payrolls can be approved'
      });
    }

    payrollSubmissions[payrollIndex] = {
      ...currentPayroll,
      status: 'approved',
      approvedBy: userId,
      approvedAt: new Date().toISOString()
    };

    return res.status(200).json({
      success: true,
      message: 'Payroll approved successfully',
      payroll: payrollSubmissions[payrollIndex]
    });
  } catch (error) {
    console.error('Error approving payroll:', error);
    return res.status(500).json({
      success: false,
      message: 'Error approving payroll'
    });
  }
};

/**
 * Reject payroll (Finance only)
 */
export const rejectPayroll = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const companyId = (req.user as any)?.companyId;
    const userId = (req.user as any)?.id;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const payrollIndex = payrollSubmissions.findIndex(
      p => p.id === id && p.companyId === companyId
    );

    if (payrollIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Payroll not found'
      });
    }

    const currentPayroll = payrollSubmissions[payrollIndex];

    if (currentPayroll.status !== 'submitted') {
      return res.status(400).json({
        success: false,
        message: 'Only submitted payrolls can be rejected'
      });
    }

    payrollSubmissions[payrollIndex] = {
      ...currentPayroll,
      status: 'rejected',
      rejectedBy: userId,
      rejectedAt: new Date().toISOString(),
      rejectionReason: reason
    };

    return res.status(200).json({
      success: true,
      message: 'Payroll rejected',
      payroll: payrollSubmissions[payrollIndex]
    });
  } catch (error) {
    console.error('Error rejecting payroll:', error);
    return res.status(500).json({
      success: false,
      message: 'Error rejecting payroll'
    });
  }
};

/**
 * Mark payroll as paid (Finance only)
 */
export const markPayrollAsPaid = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.user?.companyId;

    const payrollIndex = payrollSubmissions.findIndex(
      p => p.id === id && p.companyId === companyId
    );

    if (payrollIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Payroll not found'
      });
    }

    const currentPayroll = payrollSubmissions[payrollIndex];

    if (currentPayroll.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Only approved payrolls can be marked as paid'
      });
    }

    payrollSubmissions[payrollIndex] = {
      ...currentPayroll,
      status: 'paid',
      paidAt: new Date().toISOString()
    };

    return res.status(200).json({
      success: true,
      message: 'Payroll marked as paid',
      payroll: payrollSubmissions[payrollIndex]
    });
  } catch (error) {
    console.error('Error marking payroll as paid:', error);
    return res.status(500).json({
      success: false,
      message: 'Error marking payroll as paid'
    });
  }
};

/**
 * Delete payroll (drafts only)
 */
export const deletePayroll = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.user?.companyId;

    const payrollIndex = payrollSubmissions.findIndex(
      p => p.id === id && p.companyId === companyId
    );

    if (payrollIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Payroll not found'
      });
    }

    const currentPayroll = payrollSubmissions[payrollIndex];

    if (currentPayroll.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Only draft payrolls can be deleted'
      });
    }

    payrollSubmissions.splice(payrollIndex, 1);

    return res.status(200).json({
      success: true,
      message: 'Payroll deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting payroll:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting payroll'
    });
  }
};
