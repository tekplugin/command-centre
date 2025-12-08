import mongoose, { Document, Schema } from 'mongoose';

export interface IIncomingEmail extends Document {
  messageId: string;
  from: string;
  to: string[];
  subject: string;
  textBody: string;
  htmlBody: string;
  receivedAt: Date;
  headers: Record<string, any>;
  attachments: Array<{
    filename: string;
    contentType: string;
    size: number;
    url?: string;
  }>;
  inReplyTo?: string;
  references?: string;
  isRead: boolean;
  isArchived: boolean;
  labels: string[];
  relatedTo?: {
    type: 'deal' | 'ticket' | 'project' | 'client';
    id: string;
  };
  createdAt: Date;
  updatedAt: Date;
  starred: {
    type: Boolean,
    default: false,
    index: true,
  };
  spam: {
    type: Boolean,
    default: false,
    index: true,
  };
  deleted: {
    type: Boolean,
    default: false,
    index: true,
  };
  folder: {
    type: String,
    default: 'Inbox',
    index: true,
  };
  draft: {
    type: Boolean,
    default: false,
    index: true,
  };
  readReceipt: {
    type: String,
    default: 'unrequested', // 'unrequested', 'requested', 'read', 'failed'
    index: true,
  };
}

const IncomingEmailSchema = new Schema<IIncomingEmail>(
  {
    messageId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    from: {
      type: String,
      required: true,
      index: true,
    },
    to: [{
      type: String,
      required: true,
    }],
    subject: {
      type: String,
      required: true,
    },
    textBody: {
      type: String,
      default: '',
    },
    htmlBody: {
      type: String,
      default: '',
    },
    receivedAt: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    headers: {
      type: Schema.Types.Mixed,
      default: {},
    },
    attachments: [{
      filename: String,
      contentType: String,
      size: Number,
      url: String,
    }],
    inReplyTo: {
      type: String,
      index: true,
    },
    references: {
      type: String,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
    labels: [{
      type: String,
      index: true,
    }],
    relatedTo: {
      type: {
        type: String,
        enum: ['deal', 'ticket', 'project', 'client'],
      },
      id: String,
    },
    starred: {
      type: Boolean,
      default: false,
      index: true,
    },
    spam: {
      type: Boolean,
      default: false,
      index: true,
    },
    deleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    folder: {
      type: String,
      default: 'Inbox',
      index: true,
    },
    draft: {
      type: Boolean,
      default: false,
      index: true,
    },
    readReceipt: {
      type: String,
      default: 'unrequested', // 'unrequested', 'requested', 'read', 'failed'
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
IncomingEmailSchema.index({ receivedAt: -1 });
IncomingEmailSchema.index({ from: 1, receivedAt: -1 });
IncomingEmailSchema.index({ isRead: 1, receivedAt: -1 });
IncomingEmailSchema.index({ isArchived: 1, receivedAt: -1 });
IncomingEmailSchema.index({ starred: 1, receivedAt: -1 });
IncomingEmailSchema.index({ spam: 1, receivedAt: -1 });
IncomingEmailSchema.index({ deleted: 1, receivedAt: -1 });
IncomingEmailSchema.index({ folder: 1, receivedAt: -1 });
IncomingEmailSchema.index({ draft: 1, receivedAt: -1 });
IncomingEmailSchema.index({ readReceipt: 1, receivedAt: -1 });

export default mongoose.model<IIncomingEmail>('IncomingEmail', IncomingEmailSchema);
