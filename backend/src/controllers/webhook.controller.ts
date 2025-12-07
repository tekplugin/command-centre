import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import IncomingEmail from '../models/IncomingEmail';
// import crypto from 'crypto'; // Temporarily disabled

/**
 * Verify Resend webhook signature
 * TEMPORARILY DISABLED FOR TESTING
 */
/*
const verifyResendSignature = (payload: string, signature: string, secret: string): boolean => {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    logger.error('Error verifying webhook signature', error);
    return false;
  }
};
*/

/**
 * Handle incoming emails from Resend webhook
 * @route POST /api/v1/webhooks/resend/incoming
 */
export const handleIncomingEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    // SIGNATURE CHECK TEMPORARILY DISABLED FOR TESTING
    // In production, enable signature verification
    
    const webhookData = req.body;
    // Check if this is a domain event (not an email)
    if (webhookData.type && (webhookData.type === 'domain.created' || webhookData.type === 'domain.updated')) {
      logger.info('Received domain event, ignoring', {
        type: webhookData.type,
        domain: webhookData.data?.name,
        status: webhookData.data?.status,
      });
      // Return success but don't process as email
      res.status(200).json({ 
        success: true, 
        message: 'Domain event received',
        type: webhookData.type,
      });
      return;
    }

    // Extract email fields from webhookData.data (Resend format)
    const email = webhookData.data || {};
    if (!email.from || !email.subject) {
      logger.warn('Webhook received without required email fields', {
        hasFrom: !!email.from,
        hasSubject: !!email.subject,
        type: webhookData.type,
        data: JSON.stringify(webhookData).substring(0, 200),
      });
      res.status(400).json({ 
        success: false, 
        error: 'Invalid email data - missing required fields' 
      });
      return;
    }

    logger.info('Received incoming email webhook', {
      from: email.from,
      to: email.to,
      subject: email.subject,
    });

    // Extract email data from webhook
    const emailData = {
      messageId: email.message_id || email.id,
      from: email.from,
      to: email.to,
      subject: email.subject || '(No Subject)',
      textBody: email.text || email.plain_text || '',
      htmlBody: email.html || email.html_body || '',
      receivedAt: new Date(email.created_at || Date.now()),
      headers: email.headers || {},
      attachments: email.attachments || [],
      inReplyTo: email.in_reply_to || null,
      references: email.references || null,
    };

    // Save to database
    const incomingEmail = new IncomingEmail(emailData);
    await incomingEmail.save();

    logger.info('Incoming email saved successfully', {
      id: incomingEmail._id,
      from: emailData.from,
      subject: emailData.subject,
    });

    // Emit socket event for real-time notification
    const io = req.app.get('io');
    if (io) {
      io.emit('new_email', {
        id: incomingEmail._id,
        from: emailData.from,
        subject: emailData.subject,
        receivedAt: emailData.receivedAt,
      });
    }

    // Send success response to Resend
    res.status(200).json({ 
      success: true, 
      message: 'Email received and processed',
      emailId: incomingEmail._id,
    });

  } catch (error) {
    logger.error('Error processing incoming email webhook', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to process incoming email' 
    });
  }
};
