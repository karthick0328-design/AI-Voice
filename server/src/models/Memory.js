import mongoose from 'mongoose';

const memorySchema = new mongoose.Schema({
  userId: { type: String, default: 'default-user', index: true },
  type: {
    type: String,
    enum: ['FACT', 'PREFERENCE', 'PROJECT', 'GOAL', 'SUMMARY', 'INSTRUCTION'],
    default: 'FACT'
  },
  content: { type: String, required: true },
  importance: { type: Number, min: 1, max: 10, default: 5 },
  tags: [{ type: String }],
  sourceConversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', default: null },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

memorySchema.index({ content: 'text', tags: 'text' });

memorySchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export const Memory = mongoose.model('Memory', memorySchema);
