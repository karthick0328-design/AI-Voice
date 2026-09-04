import mongoose from 'mongoose';

const toolCallSubSchema = new mongoose.Schema({
  toolName: { type: String, required: true },
  input: { type: mongoose.Schema.Types.Mixed },
  output: { type: mongoose.Schema.Types.Mixed },
  status: { type: String, enum: ['pending', 'running', 'completed', 'failed', 'cancelled'], default: 'completed' },
  duration: { type: Number, default: 0 }
}, { _id: false });

const sourceSubSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  snippet: { type: String, default: '' },
  domain: { type: String, default: '' }
}, { _id: false });

const messageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
  role: { type: String, enum: ['user', 'assistant', 'system', 'tool'], required: true },
  content: { type: String, default: '' },
  toolCalls: [toolCallSubSchema],
  sources: [sourceSubSchema],
  memoriesUsed: [{ type: String }],
  tokens: {
    prompt: { type: Number, default: 0 },
    completion: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },
  aiState: { type: String, default: 'IDLE' },
  createdAt: { type: Date, default: Date.now }
});

export const Message = mongoose.model('Message', messageSchema);
