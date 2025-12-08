import { Request, Response } from 'express';
// Removed unused JwtPayload and CustomJwtPayload
import emailService from '../services/emailService';
import Signature from '../models/Signature';
import IncomingEmail from '../models/IncomingEmail';
import DraftEmail from '../models/DraftEmail';
// Removed unused Signature import
// Drafts
export const getDrafts = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.email;
    const drafts = await DraftEmail.find({ user: userId }).sort({ updatedAt: -1 });
    return res.status(200).json({ success: true, data: drafts });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const saveDraft = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.email;
    const draft = new DraftEmail({ ...req.body, user: userId });
    await draft.save();
    return res.status(201).json({ success: true, data: draft });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const scheduleEmail = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.email;
    const draft = new DraftEmail({ ...req.body, user: userId, scheduledAt: req.body.scheduledAt });
    await draft.save();
    return res.status(201).json({ success: true, data: draft });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Signature
export const getSignature = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.email;
    const signature = await Signature.findOne({ user: userId });
    return res.status(200).json({ success: true, data: signature?.signature || '' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSignature = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.email;
    const { signature } = req.body;
    const updated = await Signature.findOneAndUpdate(
      { user: userId },
      { signature },
      { upsert: true, new: true }
    );
    return res.status(200).json({ success: true, data: updated.signature });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getIncomingEmails = async (req: Request, res: Response) => {
  try {
    res.set('Cache-Control', 'no-store');
    const { page = 1, limit = 50, isRead, isArchived = false } = req.query;
    const query: any = { isArchived: isArchived === 'true' };
    if (isRead !== undefined) query.isRead = isRead === 'true';
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
    return res.status(500).json({ success: false, message: 'Failed to fetch emails', error: error.message });
  }
};

export const getSingleEmail = async (req: Request, res: Response) => {
  try {
    const email = await IncomingEmail.findById(req.params.id);
    if (!email) {
      return res.status(404).json({ success: false, message: 'Email not found' });
    }
    if (!email.isRead) {
      email.isRead = true;
      await email.save();
    }
    return res.status(200).json({ success: true, data: email });
  } catch (error: any) {
    console.error('Error fetching email:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch email', error: error.message });
  }
};

export const markEmailAsRead = async (req: Request, res: Response) => {
  try {
    const { isRead } = req.body;
    const email = await IncomingEmail.findByIdAndUpdate(req.params.id, { isRead }, { new: true });
    if (!email) {
      return res.status(404).json({ success: false, message: 'Email not found' });
    }
    return res.status(200).json({ success: true, data: email });
  } catch (error: any) {
    console.error('Error updating email:', error);
    return res.status(500).json({ success: false, message: 'Failed to update email', error: error.message });
  }
};

export const archiveEmail = async (req: Request, res: Response) => {
  try {
    const { isArchived } = req.body;
    const email = await IncomingEmail.findByIdAndUpdate(req.params.id, { isArchived }, { new: true });
    if (!email) {
      return res.status(404).json({ success: false, message: 'Email not found' });
    }
    return res.status(200).json({ success: true, data: email });
  } catch (error: any) {
    console.error('Error archiving email:', error);
    return res.status(500).json({ success: false, message: 'Failed to archive email', error: error.message });
  }
};

export const sendInvoiceEmail = async (req: Request, res: Response) => {
  try {
    const { to, subject, message, invoice } = req.body;
    if (!to || !subject || !message || !invoice) {
      return res.status(400).json({ success: false, message: 'Missing required fields: to, subject, message, invoice' });
    }
    if (!invoice.invoiceNumber || !invoice.client || !invoice.items) {
      return res.status(400).json({ success: false, message: 'Invalid invoice structure' });
    }
    const result = await emailService.sendInvoiceEmail(to, subject, message, invoice);
    if (result.success) {
      return res.status(200).json({ success: true, message: 'Invoice email sent successfully', messageId: result.messageId, previewUrl: result.previewUrl });
    } else {
      return res.status(500).json({ success: false, message: 'Failed to send email', error: result.error });
    }
  } catch (error: any) {
    console.error('Error sending invoice email:', error);
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

export const sendEmail = async (req: Request, res: Response) => {
  try {
    const { to, subject, html } = req.body;
    if (!to || !subject || !html) {
      return res.status(400).json({ success: false, message: 'Missing required fields: to, subject, html' });
    }
    const result = await emailService.sendEmail({ to, subject, html });
    if (result.success) {
      return res.status(200).json({ success: true, message: 'Email sent successfully', messageId: result.messageId, previewUrl: result.previewUrl });
    } else {
      return res.status(500).json({ success: false, message: 'Failed to send email', error: result.error });
    }
  } catch (error: any) {
    console.error('Error sending email:', error);
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

export const starEmail = async (req: Request, res: Response) => {
  try {
    const { starred } = req.body;
    const email = await IncomingEmail.findByIdAndUpdate(req.params.id, { starred }, { new: true });
    if (!email) return res.status(404).json({ success: false, message: 'Email not found' });
    return res.status(200).json({ success: true, data: email });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
export const markSpam = async (req: Request, res: Response) => {
  try {
    const { spam } = req.body;
    const email = await IncomingEmail.findByIdAndUpdate(req.params.id, { spam }, { new: true });
    if (!email) return res.status(404).json({ success: false, message: 'Email not found' });
    return res.status(200).json({ success: true, data: email });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
export const deleteEmail = async (req: Request, res: Response) => {
  try {
    const email = await IncomingEmail.findByIdAndUpdate(req.params.id, { deleted: true }, { new: true });
    if (!email) return res.status(404).json({ success: false, message: 'Email not found' });
    return res.status(200).json({ success: true, data: email });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
export const restoreEmail = async (req: Request, res: Response) => {
  try {
    const email = await IncomingEmail.findByIdAndUpdate(req.params.id, { deleted: false }, { new: true });
    if (!email) return res.status(404).json({ success: false, message: 'Email not found' });
    return res.status(200).json({ success: true, data: email });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
export const moveToFolder = async (req: Request, res: Response) => {
  try {
    const { folder } = req.body;
    const email = await IncomingEmail.findByIdAndUpdate(req.params.id, { folder }, { new: true });
    if (!email) return res.status(404).json({ success: false, message: 'Email not found' });
    return res.status(200).json({ success: true, data: email });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
export const addLabel = async (req: Request, res: Response) => {
  try {
    const { label } = req.body;
    const email = await IncomingEmail.findById(req.params.id);
    if (!email) return res.status(404).json({ success: false, message: 'Email not found' });
    if (!email.labels.includes(label)) email.labels.push(label);
    await email.save();
    return res.status(200).json({ success: true, data: email });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
export const removeLabel = async (req: Request, res: Response) => {
  try {
    const { label } = req.body;
    const email = await IncomingEmail.findById(req.params.id);
    if (!email) return res.status(404).json({ success: false, message: 'Email not found' });
    email.labels = email.labels.filter(l => l !== label);
    await email.save();
    return res.status(200).json({ success: true, data: email });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
export const bulkUpdate = async (req: Request, res: Response) => {
  try {
    const { emailIds, updates } = req.body;
    const result = await IncomingEmail.updateMany({ _id: { $in: emailIds } }, updates);
    return res.status(200).json({ success: true, result });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
// ...existing code...
export const updateDraft = async (req: Request, res: Response) => {
  try {
    const draft = await DraftEmail.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!draft) return res.status(404).json({ success: false, message: 'Draft not found' });
    return res.status(200).json({ success: true, data: draft });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
export const deleteDraft = async (req: Request, res: Response) => {
  try {
    await DraftEmail.findByIdAndDelete(req.params.id);
    return res.status(200).json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
// ...existing code...
export const getReadReceipt = async (req: Request, res: Response) => {
  try {
    const email = await IncomingEmail.findById(req.params.id);
    if (!email) return res.status(404).json({ success: false, message: 'Email not found' });
    return res.status(200).json({ success: true, status: email.readReceipt });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
export const updateReadReceipt = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const email = await IncomingEmail.findByIdAndUpdate(req.params.id, { readReceipt: status }, { new: true });
    if (!email) return res.status(404).json({ success: false, message: 'Email not found' });
    return res.status(200).json({ success: true, data: email });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
// ...existing code...
export const getAttachmentUrl = async (req: Request, res: Response) => {
  try {
    const email = await IncomingEmail.findById(req.params.id);
    if (!email) return res.status(404).json({ success: false, message: 'Email not found' });
    const att = email.attachments.find(a => a.url === req.params.attId);
    if (!att || !att.url) return res.status(404).json({ success: false, message: 'Attachment not found' });
    return res.redirect(att.url);
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
