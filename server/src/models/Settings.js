import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  userId: { type: String, default: 'default-user', unique: true },
  assistantName: { type: String, default: 'Aether' },
  personality: {
    type: String,
    enum: ['Helpful & Intelligent', 'Technical & Precise', 'Creative & Visionary', 'Concise & Direct'],
    default: 'Helpful & Intelligent'
  },
  systemPrompt: {
    type: String,
    default: 'You are Aether, a sophisticated local-first personal AI assistant. You think critically, use tools wisely, remember preferences, and prioritize truth and precision.'
  },
  responseStyle: { type: String, enum: ['balanced', 'creative', 'precise'], default: 'balanced' },
  responseLength: { type: String, enum: ['short', 'medium', 'long'], default: 'medium' },
  preferredLanguage: { type: String, default: 'en-US' },
  selectedModel: { type: String, default: 'llama3.1:8b' },
  // Voice & Audio settings
  voiceName: { type: String, default: '' },
  speechSpeed: { type: Number, default: 1.0 },
  autoSpeak: { type: Boolean, default: false },
  // Feature toggles
  memoryEnabled: { type: Boolean, default: true },
  webSearchEnabled: { type: Boolean, default: true },
  browserAutomationEnabled: { type: Boolean, default: true },
  ragEnabled: { type: Boolean, default: true },
  updatedAt: { type: Date, default: Date.now }
});

settingsSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export const Settings = mongoose.model('Settings', settingsSchema);
