
import { Request, Response } from 'express';
import Payroll from '../models/Payroll';



// Remove in-memory storage. All payrolls are now stored in MongoDB.

/**
 * Get all payroll submissions for a company
 */
export const getPayrolls = async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      return res.status(400).json({ success: false, message: 'Company ID not found' });
    }
    const payrolls = await Payroll.find({ companyId });
    return res.status(200).json({ success: true, payrolls });
  } catch (error) {
    console.error('Error fetching payrolls:', error);
    return res.status(500).json({ success: false, message: 'Error fetching payrolls' });
  }
};

/**
 * Get a single payroll by ID
 */
export const getPayrollById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.user?.companyId;
    const payroll = await Payroll.findOne({ _id: id, companyId });
    if (!payroll) {
      return res.status(404).json({ success: false, message: 'Payroll not found' });
    }
    return res.status(200).json({ success: true, payroll });
  } catch (error) {
    console.error('Error fetching payroll:', error);
    return res.status(500).json({ success: false, message: 'Error fetching payroll' });
  }
};

/**
 * Create/Submit a new payroll
 */
export const createPayroll = async (req: Request, res: Response) => {
  try {
    const companyId = (req.user as any)?.companyId;
    if (!companyId) {
      return res.status(400).json({ success: false, message: 'Company ID not found' });
    }
    const { status } = req.body;
    // If creating a master payroll, ensure only one per company
    if (status === 'master') {
      const existingMaster = await Payroll.findOne({ companyId, status: 'master' });
      if (existingMaster) {
        return res.status(400).json({ success: false, message: 'Master payroll already exists' });
      }
    }
    // If creating a monthly payroll, copy from master if exists
    let payrollData = req.body;
    if (status !== 'master') {
      const master = await Payroll.findOne({ companyId, status: 'master' });
      if (master) {
        payrollData.employees = master.employees;
      }
    }
    const payroll = await Payroll.create({ ...payrollData, companyId });
    return res.status(201).json({ success: true, message: 'Payroll created successfully', payroll });
  } catch (error) {
    console.error('Error creating payroll:', error);
    return res.status(500).json({ success: false, message: 'Error creating payroll' });
  }
};

/**
 * Update payroll (for drafts)
 */
export const updatePayroll = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.user?.companyId;
    const payroll = await Payroll.findOne({ _id: id, companyId });
    if (!payroll) {
      return res.status(404).json({ success: false, message: 'Payroll not found' });
    }
    if (payroll.status !== 'draft') {
      return res.status(400).json({ success: false, message: 'Only draft payrolls can be updated' });
    }
    Object.assign(payroll, req.body);
    await payroll.save();
    return res.status(200).json({ success: true, message: 'Payroll updated successfully', payroll });
  } catch (error) {
    console.error('Error updating payroll:', error);
    return res.status(500).json({ success: false, message: 'Error updating payroll' });
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
    const payroll = await Payroll.findOne({ _id: id, companyId });
    if (!payroll) {
      return res.status(404).json({ success: false, message: 'Payroll not found' });
    }
    if (payroll.status !== 'submitted') {
      return res.status(400).json({ success: false, message: 'Only submitted payrolls can be approved' });
    }
    payroll.status = 'approved';
    payroll.approvedBy = userId;
    payroll.approvedAt = new Date();
    await payroll.save();
    return res.status(200).json({ success: true, message: 'Payroll approved successfully', payroll });
  } catch (error) {
    console.error('Error approving payroll:', error);
    return res.status(500).json({ success: false, message: 'Error approving payroll' });
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
      return res.status(400).json({ success: false, message: 'Rejection reason is required' });
    }
    const payroll = await Payroll.findOne({ _id: id, companyId });
    if (!payroll) {
      return res.status(404).json({ success: false, message: 'Payroll not found' });
    }
    if (payroll.status !== 'submitted') {
      return res.status(400).json({ success: false, message: 'Only submitted payrolls can be rejected' });
    }
    payroll.status = 'rejected';
    payroll.rejectedBy = userId;
    payroll.rejectedAt = new Date();
    payroll.rejectionReason = reason;
    await payroll.save();
    return res.status(200).json({ success: true, message: 'Payroll rejected', payroll });
  } catch (error) {
    console.error('Error rejecting payroll:', error);
    return res.status(500).json({ success: false, message: 'Error rejecting payroll' });
  }
};

/**
 * Mark payroll as paid (Finance only)
 */
export const markPayrollAsPaid = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.user?.companyId;
    const payroll = await Payroll.findOne({ _id: id, companyId });
    if (!payroll) {
      return res.status(404).json({ success: false, message: 'Payroll not found' });
    }
    if (payroll.status !== 'approved') {
      return res.status(400).json({ success: false, message: 'Only approved payrolls can be marked as paid' });
    }
    payroll.status = 'paid';
    payroll.paidAt = new Date();
    await payroll.save();
    return res.status(200).json({ success: true, message: 'Payroll marked as paid', payroll });
  } catch (error) {
    console.error('Error marking payroll as paid:', error);
    return res.status(500).json({ success: false, message: 'Error marking payroll as paid' });
  }
};

/**
 * Delete payroll (drafts only)
 */
export const deletePayroll = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.user?.companyId;
    const payroll = await Payroll.findOne({ _id: id, companyId });
    if (!payroll) {
      return res.status(404).json({ success: false, message: 'Payroll not found' });
    }
    if (payroll.status !== 'draft') {
      return res.status(400).json({ success: false, message: 'Only draft payrolls can be deleted' });
    }
    await Payroll.deleteOne({ _id: id, companyId });
    return res.status(200).json({ success: true, message: 'Payroll deleted successfully' });
  } catch (error) {
    console.error('Error deleting payroll:', error);
    return res.status(500).json({ success: false, message: 'Error deleting payroll' });
  }
};
