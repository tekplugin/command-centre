import express from 'express';
import {
  getPayrolls,
  getPayrollById,
  createPayroll,
  updatePayroll,
  approvePayroll,
  rejectPayroll,
  markPayrollAsPaid,
  deletePayroll
} from '../controllers/payroll.controller';
import { authenticate } from '../middleware/auth';
import { requireDepartmentAccess } from '../middleware/department';
import { Department } from '../models/User';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/v1/payroll
 * Get all payroll submissions for the company
 * Access: HR, Finance, Admin, Executive
 */
router.get('/', getPayrolls);

/**
 * GET /api/v1/payroll/:id
 * Get a specific payroll by ID
 * Access: HR, Finance, Admin, Executive
 */
router.get('/:id', getPayrollById);

/**
 * POST /api/v1/payroll
 * Create a new payroll submission
 * Access: HR only
 */
router.post('/', requireDepartmentAccess(Department.HR), createPayroll);

/**
 * PUT /api/v1/payroll/:id
 * Update a payroll (draft only)
 * Access: HR only
 */
router.put('/:id', requireDepartmentAccess(Department.HR), updatePayroll);

/**
 * POST /api/v1/payroll/:id/approve
 * Approve a payroll submission
 * Access: Finance only
 */
router.post('/:id/approve', requireDepartmentAccess(Department.FINANCE), approvePayroll);

/**
 * POST /api/v1/payroll/:id/reject
 * Reject a payroll submission
 * Access: Finance only
 */
router.post('/:id/reject', requireDepartmentAccess(Department.FINANCE), rejectPayroll);

/**
 * POST /api/v1/payroll/:id/mark-paid
 * Mark a payroll as paid
 * Access: Finance only
 */
router.post('/:id/mark-paid', requireDepartmentAccess(Department.FINANCE), markPayrollAsPaid);

/**
 * DELETE /api/v1/payroll/:id
 * Delete a payroll (draft only)
 * Access: HR only
 */
router.delete('/:id', requireDepartmentAccess(Department.HR), deletePayroll);

export default router;
