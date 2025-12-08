import nodemailer from 'nodemailer';
import PDFDocument from 'pdfkit';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content?: string | Buffer;
    path?: string;
  }>;
}

class EmailService {
  private transporter!: nodemailer.Transporter;

  constructor() {
    // Initialize transporter without blocking constructor
    this.initializeTransporter().catch(err => {
      console.error('❌ Failed to initialize email service:', err.message);
    });
  }

  private async initializeTransporter() {
    // Use production SMTP credentials
    const smtpHost = process.env.SMTP_HOST || 'smtp.ethereal.email';
    const smtpPort = parseInt(process.env.SMTP_PORT || '587');
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpUser || !smtpPass) {
      console.error('❌ SMTP credentials not configured');
      throw new Error('SMTP credentials required');
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465, // true for 465, false for other ports
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
        requireTLS: true, // Always require TLS
        tls: {
          rejectUnauthorized: false, // Allow self-signed certificates
          minVersion: 'TLSv1.2',
          ciphers: 'SSLv3',
        },
        debug: true, // Enable debug output
        logger: true, // Enable logging
      });

      console.log('✅ Email service initialized');
      console.log(`📧 SMTP: ${smtpUser}@${smtpHost}:${smtpPort}`);
    } catch (error: any) {
      console.error('❌ Failed to initialize email service:', error.message);
      // Don't throw - allow server to continue without email
    }
  }

  async sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; previewUrl?: string; error?: string }> {
    try {
      const info = await this.transporter.sendMail({
        from: process.env.SMTP_FROM || '"ATM Solutions Ltd" <noreply@atmsolutions.com>',
        to: options.to,
        subject: options.subject,
        html: options.html,
        attachments: options.attachments,
      });

      console.log('✅ Email sent:', info.messageId);
      
      // Generate preview URL for test emails
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log('📧 Preview URL:', previewUrl);
      }

      return {
        success: true,
        messageId: info.messageId,
        previewUrl: previewUrl || undefined,
      };
    } catch (error: any) {
      console.error('❌ Failed to send email:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async sendInvoiceEmail(
    to: string,
    subject: string,
    message: string,
    invoice: {
      invoiceNumber: string;
      client: string;
      amount: number;
      issueDate: string;
      dueDate: string;
      items: Array<{ description: string; quantity: number; rate: number; amount: number }>;
      vat: number;
      notes: string;
    }
  ): Promise<{ success: boolean; messageId?: string; previewUrl?: string; error?: string }> {
    const subtotal = invoice.items.reduce((sum, item) => sum + item.amount, 0);
    const vatAmount = (subtotal * invoice.vat) / 100;
    const total = subtotal + vatAmount;

    // Generate PDF
    const pdfBuffer = await this.generateInvoicePDF(invoice, subtotal, vatAmount, total);

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
          .message { white-space: pre-line; padding: 15px; background: #fef3c7; border-left: 4px solid #f59e0b; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 0.875em; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>ATM Solutions Ltd</h1>
            <p>Professional ATM Maintenance Services</p>
          </div>
          
          <div class="message">
            ${message}
          </div>

          <p>Please find your invoice (${invoice.invoiceNumber}) attached as a PDF.</p>

          <div class="footer">
            <p>Thank you for your business!</p>
            <p>ATM Solutions Ltd | Email: accounts@atmsolutions.com | Phone: +234 123 456 7890</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to,
      subject,
      html,
      attachments: [
        {
          filename: `Invoice_${invoice.invoiceNumber}.pdf`,
          content: pdfBuffer,
        },
      ],
    });
  }

  private async generateInvoicePDF(
    invoice: {
      invoiceNumber: string;
      client: string;
      issueDate: string;
      dueDate: string;
      items: Array<{ description: string; quantity: number; rate: number; amount: number }>;
      vat: number;
      notes: string;
    },
    subtotal: number,
    vatAmount: number,
    total: number
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc.fontSize(24).fillColor('#4F46E5').text('ATM Solutions Ltd', { align: 'center' });
      doc.fontSize(12).fillColor('#666').text('Professional ATM Maintenance Services', { align: 'center' });
      doc.moveDown(2);

      // Invoice Details
      doc.fontSize(18).fillColor('#000').text(`Invoice ${invoice.invoiceNumber}`);
      doc.moveDown();
      doc.fontSize(11);
      doc.text(`Client: ${invoice.client}`);
      doc.text(`Issue Date: ${invoice.issueDate}`);
      doc.text(`Due Date: ${invoice.dueDate}`);
      doc.moveDown(2);

      // Items Table Header
      const tableTop = doc.y;
      doc.fontSize(10).fillColor('#4F46E5');
      doc.text('Description', 50, tableTop, { width: 200 });
      doc.text('Qty', 260, tableTop, { width: 50 });
      doc.text('Rate (₦)', 320, tableTop, { width: 100 });
      doc.text('Amount (₦)', 430, tableTop, { width: 100 });
      doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();
      
      // Items
      let y = tableTop + 25;
      doc.fillColor('#000').fontSize(9);
      invoice.items.forEach((item) => {
        doc.text(item.description, 50, y, { width: 200 });
        doc.text(item.quantity.toString(), 260, y, { width: 50 });
        doc.text(item.rate.toLocaleString(), 320, y, { width: 100 });
        doc.text(item.amount.toLocaleString(), 430, y, { width: 100 });
        y += 25;
      });

      // Totals
      doc.moveDown(2);
      const totalsX = 400;
      y = doc.y;
      doc.fontSize(10);
      doc.text('Subtotal:', totalsX, y);
      doc.text(`₦${subtotal.toLocaleString()}`, totalsX + 100, y, { align: 'right' });
      y += 20;
      doc.text(`VAT (${invoice.vat}%):`, totalsX, y);
      doc.text(`₦${vatAmount.toLocaleString()}`, totalsX + 100, y, { align: 'right' });
      y += 25;
      doc.fontSize(12).fillColor('#4F46E5');
      doc.text('Total:', totalsX, y);
      doc.text(`₦${total.toLocaleString()}`, totalsX + 100, y, { align: 'right' });

      // Notes
      if (invoice.notes) {
        doc.moveDown(2);
        doc.fontSize(10).fillColor('#000');
        doc.text('Notes:', { underline: true });
        doc.text(invoice.notes);
      }

      // Footer
      doc.moveDown(3);
      doc.fontSize(9).fillColor('#666');
      doc.text('Thank you for your business!', { align: 'center' });
      doc.text('ATM Solutions Ltd | Email: accounts@atmsolutions.com | Phone: +234 123 456 7890', { align: 'center' });

      doc.end();
    });
  }

  async scheduleEmail(options: EmailOptions & { scheduledAt: Date }): Promise<any> {
    // Logic to queue email for future send
  }
  async starEmail(emailId: string, starred: boolean): Promise<any> {
    // Logic to star/unstar email
  }
  async markSpam(emailId: string, spam: boolean): Promise<any> {
    // Logic to mark email as spam
  }
  async deleteEmail(emailId: string): Promise<any> {
    // Logic to delete email
  }
  async restoreEmail(emailId: string): Promise<any> {
    // Logic to restore deleted email
  }
  async moveToFolder(emailId: string, folder: string): Promise<any> {
    // Logic to move email to folder
  }
  async addLabel(emailId: string, label: string): Promise<any> {
    // Logic to add label
  }
  async removeLabel(emailId: string, label: string): Promise<any> {
    // Logic to remove label
  }
  async bulkUpdate(emailIds: string[], updates: any): Promise<any> {
    // Logic for bulk actions
  }
  async saveDraft(draft: any): Promise<any> {
    // Logic to save draft
  }
  async updateDraft(draftId: string, updates: any): Promise<any> {
    // Logic to update draft
  }
  async deleteDraft(draftId: string): Promise<any> {
    // Logic to delete draft
  }
  async getDrafts(userId: string): Promise<any> {
    // Logic to get drafts for user
  }
  async getSignature(userId: string): Promise<any> {
    // Logic to get user signature
  }
  async updateSignature(userId: string, signature: string): Promise<any> {
    // Logic to update user signature
  }
  async getAttachmentUrl(emailId: string, attId: string): Promise<string> {
    // Logic to get attachment download URL
  }
}

export default new EmailService();
