import { Router, Request, Response } from 'express';
import emailService from '../services/emailService';
import { authenticate } from '../middleware/auth';
import IncomingEmail from '../models/IncomingEmail';

const router = Router();

// Get incoming emails
router.get('/inbox', authenticate, async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      isRead, 
      isArchived = false 
    } = req.query;

    const query: any = { isArchived: isArchived === 'true' };
    
    if (isRead !== undefined) {
      query.isRead = isRead === 'true';
    }

    const emails = await IncomingEmail.find(query)
      .sort({ receivedAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .lean();

    const total = await IncomingEmail.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: emails,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    console.error('Error fetching inbox:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch emails',
      error: error.message,
    });
  }
});

// Get single email
router.get('/inbox/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const email = await IncomingEmail.findById(req.params.id);

    if (!email) {
      return res.status(404).json({
        success: false,
        message: 'Email not found',
      });
    }

    // Mark as read
    if (!email.isRead) {
      email.isRead = true;
      await email.save();
    }

    return res.status(200).json({
      success: true,
      data: email,
    });
  } catch (error: any) {
    console.error('Error fetching email:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch email',
      error: error.message,
    });
  }
});

// Mark email as read/unread
router.patch('/inbox/:id/read', authenticate, async (req: Request, res: Response) => {
  try {
    const { isRead } = req.body;
    
    const email = await IncomingEmail.findByIdAndUpdate(
      req.params.id,
      { isRead },
      { new: true }
    );

    if (!email) {
      return res.status(404).json({
        success: false,
        message: 'Email not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: email,
    });
  } catch (error: any) {
    console.error('Error updating email:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update email',
      error: error.message,
    });
  }
});

// Archive email
router.patch('/inbox/:id/archive', authenticate, async (req: Request, res: Response) => {
  try {
    const { isArchived } = req.body;
    
    const email = await IncomingEmail.findByIdAndUpdate(
      req.params.id,
      { isArchived },
      { new: true }
    );

    if (!email) {
      return res.status(404).json({
        success: false,
        message: 'Email not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: email,
    });
  } catch (error: any) {
    console.error('Error archiving email:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to archive email',
      error: error.message,
    });
  }
});

// Send invoice email
router.post('/send-invoice', authenticate, async (req: Request, res: Response) => {
  try {
    const { to, subject, message, invoice } = req.body;

    // Validate required fields
    if (!to || !subject || !message || !invoice) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: to, subject, message, invoice',
      });
    }

    // Validate invoice structure
    if (!invoice.invoiceNumber || !invoice.client || !invoice.items) {
      return res.status(400).json({
        success: false,
        message: 'Invalid invoice structure',
      });
    }

    // Send the email
    const result = await emailService.sendInvoiceEmail(
      to,
      subject,
      message,
      invoice
    );

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'Invoice email sent successfully',
        messageId: result.messageId,
        previewUrl: result.previewUrl, // For test emails
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to send email',
        error: result.error,
      });
    }
  } catch (error: any) {
    console.error('Error sending invoice email:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

// Send generic email
router.post('/send', authenticate, async (req: Request, res: Response) => {
  try {
    const { to, subject, html } = req.body;

    if (!to || !subject || !html) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: to, subject, html',
      });
    }

    const result = await emailService.sendEmail({ to, subject, html });

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'Email sent successfully',
        messageId: result.messageId,
        previewUrl: result.previewUrl,
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Failed to send email',
        error: result.error,
      });
    }
  } catch (error: any) {
    console.error('Error sending email:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

export default router;
