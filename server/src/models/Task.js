import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  userId: { type: String, default: 'default-user', index: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  status: {
    type: String,
    enum: ['TODO', 'IN_PROGRESS', 'WAITING', 'COMPLETED', 'FAILED', 'CANCELLED'],
    default: 'TODO',
    index: true
  },
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
    default: 'MEDIUM'
  },
  category: { type: String, default: 'General' },
  dueDate: { type: Date, default: null },
  completedAt: { type: Date, default: null },
  source: { type: String, enum: ['manual', 'ai-agent', 'automation'], default: 'ai-agent' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

taskSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  if (this.status === 'COMPLETED' && !this.completedAt) {
    this.completedAt = new Date();
  } else if (this.status !== 'COMPLETED') {
    this.completedAt = null;
  }
  next();
});

export const Task = mongoose.model('Task', taskSchema);
