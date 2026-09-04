import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  userId: { type: String, default: 'default-user', index: true },
  title: { type: String, default: 'New Conversation' },
  pinned: { type: Boolean, default: false },
  archived: { type: Boolean, default: false },
  modelUsed: { type: String, default: 'llama3.1:8b' },
  summary: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

conversationSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export const Conversation = mongoose.model('Conversation', conversationSchema);
