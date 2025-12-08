import mongoose, { Document, Schema } from 'mongoose';

export interface IDraftEmail extends Document {
  user: string; // user id or email
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  htmlBody?: string;
  attachments?: Array<{
    filename: string;
    contentType: string;
    size: number;
    url?: string;
  }>;
  labels?: string[];
  folder?: string;
  scheduledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DraftEmailSchema = new Schema<IDraftEmail>({
  user: { type: String, required: true, index: true },
  to: [{ type: String, required: true }],
  cc: [{ type: String }],
  bcc: [{ type: String }],
  subject: { type: String, required: true },
  body: { type: String, required: true },
  htmlBody: { type: String },
  attachments: [{ filename: String, contentType: String, size: Number, url: String }],
  labels: [{ type: String }],
  folder: { type: String, default: 'Drafts' },
  scheduledAt: { type: Date },
}, { timestamps: true });

export default mongoose.model<IDraftEmail>('DraftEmail', DraftEmailSchema);
