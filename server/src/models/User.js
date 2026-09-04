import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, default: 'User' },
  email: { type: String, default: 'user@local.ai' },
  avatar: { type: String, default: '' },
  preferences: {
    theme: { type: String, default: 'dark' },
    soundEnabled: { type: Boolean, default: true },
    voiceAutoplay: { type: Boolean, default: false }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

userSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export const User = mongoose.model('User', userSchema);
