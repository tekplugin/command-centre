import mongoose, { Document, Schema } from 'mongoose';

export interface ISignature extends Document {
  user: string; // user id or email
  signature: string;
  createdAt: Date;
  updatedAt: Date;
}

const SignatureSchema = new Schema<ISignature>({
  user: { type: String, required: true, index: true, unique: true },
  signature: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model<ISignature>('Signature', SignatureSchema);
