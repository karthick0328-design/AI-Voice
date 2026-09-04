import mongoose from 'mongoose';

const automationActionSchema = new mongoose.Schema({
  type: { type: String, required: true }, // e.g. 'webSearch', 'summarizeContent', 'saveMemory', 'createTask', 'generateDocument'
  params: { type: mongoose.Schema.Types.Mixed, default: {} },
  order: { type: Number, default: 0 }
}, { _id: false });

const executionRecordSchema = new mongoose.Schema({
  executedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['SUCCESS', 'FAILED', 'PARTIAL'], default: 'SUCCESS' },
  outputSummary: { type: String, default: '' },
  error: { type: String, default: null }
}, { _id: false });

const automationSchema = new mongoose.Schema({
  userId: { type: String, default: 'default-user', index: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  trigger: {
    type: { type: String, enum: ['SCHEDULE', 'EVENT', 'MANUAL'], default: 'SCHEDULE' },
    cronExpression: { type: String, default: '0 9 * * 1' }, // e.g., Every Monday at 9 AM
    humanSchedule: { type: String, default: 'Every Monday at 9:00 AM' }
  },
  actions: [automationActionSchema],
  status: { type: String, enum: ['ACTIVE', 'PAUSED', 'DRAFT'], default: 'ACTIVE' },
  lastExecutedAt: { type: Date, default: null },
  nextExecutionAt: { type: Date, default: null },
  executionHistory: [executionRecordSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

automationSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export const Automation = mongoose.model('Automation', automationSchema);
