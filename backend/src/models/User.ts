import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export enum UserRole {
  EXECUTIVE = 'executive',
  STAFF = 'staff',
  ADMIN = 'admin',
}

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  companyId: mongoose.Types.ObjectId;
  phoneNumber?: string;
  avatarUrl?: string;
  isActive: boolean;
  lastLogin?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.STAFF,
      required: true,
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    avatarUrl: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  const rounds = parseInt(process.env.BCRYPT_ROUNDS || '10');
  this.password = await bcrypt.hash(this.password, rounds);
  next();
});

// Method to check password
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model<IUser>('User', userSchema);

export default User;
