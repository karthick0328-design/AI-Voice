import mongoose from 'mongoose';

const toolExecutionSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', default: null, index: true },
  messageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null },
  toolName: { type: String, required: true },
  input: { type: mongoose.Schema.Types.Mixed },
  outputSummary: { type: String, default: '' },
  status: {
    type: String,
    enum: ['PENDING', 'RUNNING', 'WAITING_CONFIRMATION', 'APPROVED', 'REJECTED', 'COMPLETED', 'FAILED'],
    default: 'COMPLETED'
  },
  permissionLevel: {
    type: String,
    enum: ['READ_ONLY', 'LOW_RISK', 'REQUIRES_CONFIRMATION'],
    default: 'READ_ONLY'
  },
  duration: { type: Number, default: 0 }, // in milliseconds
  error: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

export const ToolExecution = mongoose.model('ToolExecution', toolExecutionSchema);
