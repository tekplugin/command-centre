import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export enum UserRole {
  ADMIN = 'admin',          // Global admin - access to everything
  EXECUTIVE = 'executive',  // Executive - access to all departments
  MANAGER = 'manager',      // Department manager - manage department users
  STAFF = 'staff',          // Staff - access only to assigned departments
}

export enum Department {
  FINANCE = 'finance',
  LEGAL = 'legal',
  HR = 'hr',
  MARKETING = 'marketing',
  SALES = 'sales',
  ENGINEERING = 'engineering',
  OPERATIONS = 'operations',
  CUSTOMER_SERVICE = 'customer_service',
  IT = 'it',
  PROCUREMENT = 'procurement',
}

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roles: UserRole[];              // Multiple roles support
  departments: Department[];      // Departments user has access to
  companyId: mongoose.Types.ObjectId;
  phoneNumber?: string;
  avatarUrl?: string;
  isActive: boolean;
  lastLogin?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  hasRole(role: UserRole): boolean;
  hasDepartmentAccess(department: Department): boolean;
  isGlobalAdmin(): boolean;
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
    roles: [{
      type: String,
      enum: Object.values(UserRole),
      required: true,
    }],
    departments: [{
      type: String,
      enum: Object.values(Department),
    }],
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
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
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

// Check if user has a specific role
userSchema.methods.hasRole = function (role: UserRole): boolean {
  return this.roles.includes(role);
};

// Check if user has access to a department
userSchema.methods.hasDepartmentAccess = function (department: Department): boolean {
  // Admins and executives have access to all departments
  if (this.hasRole(UserRole.ADMIN) || this.hasRole(UserRole.EXECUTIVE)) {
    return true;
  }
  return this.departments.includes(department);
};

// Check if user is global admin
userSchema.methods.isGlobalAdmin = function (): boolean {
  return this.hasRole(UserRole.ADMIN);
};

const User = mongoose.model<IUser>('User', userSchema);

export default User;
