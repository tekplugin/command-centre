import { Router, Request, Response } from 'express';
import * as emailController from '../controllers/email.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Get incoming emails
router.get('/inbox', authenticate, emailController.getIncomingEmails);

// Get single email
router.get('/inbox/:id', authenticate, emailController.getSingleEmail);

// Mark email as read/unread
router.patch('/inbox/:id/read', authenticate, emailController.markEmailAsRead);

// Archive email
router.patch('/inbox/:id/archive', authenticate, emailController.archiveEmail);

// Star/unstar email
router.patch('/inbox/:id/star', authenticate, emailController.starEmail);

// Mark as spam
router.patch('/inbox/:id/spam', authenticate, emailController.markSpam);

// Delete email
router.delete('/inbox/:id', authenticate, emailController.deleteEmail);

// Restore email
router.patch('/inbox/:id/restore', authenticate, emailController.restoreEmail);

// Move to folder
router.patch('/inbox/:id/folder', authenticate, emailController.moveToFolder);

// Add/remove label
router.patch('/inbox/:id/label', authenticate, emailController.addLabel);
router.patch('/inbox/:id/label/remove', authenticate, emailController.removeLabel);

// Bulk actions
router.post('/inbox/bulk', authenticate, emailController.bulkUpdate);

// Drafts CRUD
router.get('/drafts', authenticate, emailController.getDrafts);
router.post('/drafts', authenticate, emailController.saveDraft);
router.put('/drafts/:id', authenticate, emailController.updateDraft);
router.delete('/drafts/:id', authenticate, emailController.deleteDraft);

// Scheduling (send later)
router.post('/send-scheduled', authenticate, emailController.scheduleEmail);

// Read receipts
router.get('/inbox/:id/receipt', authenticate, emailController.getReadReceipt);
router.patch('/inbox/:id/receipt', authenticate, emailController.updateReadReceipt);

// Signature management
router.get('/signature', authenticate, emailController.getSignature);
router.put('/signature', authenticate, emailController.updateSignature);

// Attachment download
router.get('/inbox/:id/attachment/:attId', authenticate, emailController.getAttachmentUrl);

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
