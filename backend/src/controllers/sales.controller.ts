import { Request, Response } from 'express';
import SalesLead from '../models/SalesLead';
import { logger } from '../utils/logger';
import { UserRole } from '../models/User';

interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  companyId: string;
}

interface AuthRequest extends Request {
  user?: JwtPayload;
}

/**
 * @route GET /api/v1/sales/closed-clients
 * @desc Get all closed-won clients for project dropdown
 */
export const getClosedClients = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { companyId } = req.user!;

    const closedClients = await SalesLead.find({
      companyId,
      stage: 'closed-won'
    })
    .select('clientName company email phone value actualCloseDate')
    .sort({ actualCloseDate: -1 });

    res.json({
      success: true,
      count: closedClients.length,
      data: closedClients
    });
  } catch (error) {
    logger.error('Error fetching closed clients:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch closed clients'
    });
  }
};

/**
 * @route GET /api/v1/sales
 * @desc Get all sales leads
 */
export const getAllLeads = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { companyId } = req.user!;
    const { stage } = req.query;

    const query: any = { companyId };
    if (stage) query.stage = stage;

    const leads = await SalesLead.find(query)
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: leads.length,
      data: leads
    });
  } catch (error) {
    logger.error('Error fetching leads:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch leads'
    });
  }
};

/**
 * @route POST /api/v1/sales
 * @desc Create new sales lead
 */
export const createLead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId, companyId } = req.user!;

    const lead = await SalesLead.create({
      ...req.body,
      createdBy: userId,
      companyId
    });

    logger.info('Sales lead created:', {
      leadId: lead._id,
      clientName: lead.clientName,
      userId
    });

    res.status(201).json({
      success: true,
      data: lead
    });
  } catch (error: any) {
    logger.error('Error creating lead:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to create lead'
    });
  }
};

/**
 * @route PUT /api/v1/sales/:id
 * @desc Update sales lead
 */
export const updateLead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { companyId } = req.user!;

    const lead = await SalesLead.findOneAndUpdate(
      { _id: id, companyId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!lead) {
      res.status(404).json({
        success: false,
        error: 'Lead not found'
      });
      return;
    }

    res.json({
      success: true,
      data: lead
    });
  } catch (error: any) {
    logger.error('Error updating lead:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to update lead'
    });
  }
};
