import mongoose, { Schema, Document } from 'mongoose';

export interface ITask {
  id: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  isCompleted: boolean;
  assignedTo?: string;
  dueDate?: Date;
  startDate?: Date;
  timeline?: {
    estimatedHours: number;
    actualHours?: number;
  };
}

export interface IMilestone {
  id: string;
  title: string;
  description: string;
  date: Date;
  status: 'upcoming' | 'pending' | 'completed';
}

export interface IProjectMethods {
  updateProgress(): number;
}

export interface IProject extends Document, IProjectMethods {
  name: string;
  description?: string;
  clientName: string; // From closed sales
  clientId?: mongoose.Types.ObjectId; // Reference to SalesLead
  scopeOfWork?: string;
  status: 'on-track' | 'delayed' | 'at-risk' | 'completed';
  progress: number;
  tasksCompleted: number;
  totalTasks: number;
  team: string[]; // Array of user IDs
  teamSize: number;
  deadline: Date;
  startDate: Date;
  budget?: number;
  client?: string; // Deprecated - use clientName
  tasks: ITask[];
  milestones: IMilestone[];
  risks: string[];
  recommendations: string[];
  createdBy: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema({
  id: { type: String, required: true },
  description: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending'
  },
  isCompleted: { type: Boolean, default: false },
  assignedTo: { type: String },
  dueDate: { type: Date },
  startDate: { type: Date },
  timeline: {
    estimatedHours: { type: Number, default: 0 },
    actualHours: { type: Number }
  }
});

const MilestoneSchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  date: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['upcoming', 'pending', 'completed'],
    default: 'upcoming'
  }
});

const ProjectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true },
    description: { type: String },
    clientName: { type: String, required: true },
    clientId: { type: Schema.Types.ObjectId, ref: 'SalesLead' },
    scopeOfWork: { type: String },
    status: { 
      type: String, 
      enum: ['on-track', 'delayed', 'at-risk', 'completed'],
      default: 'on-track'
    },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    tasksCompleted: { type: Number, default: 0 },
    totalTasks: { type: Number, required: true },
    team: [{ type: String }],
    teamSize: { type: Number, required: true },
    deadline: { type: Date, required: true },
    startDate: { type: Date, default: Date.now },
    budget: { type: Number },
    client: { type: String }, // Deprecated
    tasks: [TaskSchema],
    milestones: [MilestoneSchema],
    risks: [{ type: String }],
    recommendations: [{ type: String }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true }
  },
  { timestamps: true }
);

// Indexes for better query performance
ProjectSchema.index({ companyId: 1, status: 1 });
ProjectSchema.index({ createdBy: 1 });
ProjectSchema.index({ deadline: 1 });

// Virtual for calculating health
ProjectSchema.virtual('health').get(function() {
  const completionRate = this.totalTasks > 0 ? this.tasksCompleted / this.totalTasks : 0;
  const isOnTime = new Date(this.deadline) > new Date();
  
  if (completionRate > 0.8 && isOnTime) return 'Healthy';
  if (completionRate > 0.5 && isOnTime) return 'On Track';
  if (completionRate > 0.3) return 'At Risk';
  return 'Critical';
});

// Method to update progress
ProjectSchema.methods.updateProgress = function() {
  if (this.totalTasks > 0) {
    this.progress = Math.round((this.tasksCompleted / this.totalTasks) * 100);
  }
  return this.progress;
};

export default mongoose.model<IProject>('Project', ProjectSchema);
