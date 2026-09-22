import { createModel } from './createModel.js';

export const User = createModel('User', {
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  avatar: { type: String, default: '' },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  plan: { type: String, enum: ['free', 'pro', 'business', 'enterprise'], default: 'pro' },
  storageLimitBytes: { type: Number, default: 2 * 1024 * 1024 * 1024 }, // 2 GB for Pro
  storageUsedBytes: { type: Number, default: 48 * 1024 * 1024 }, // sample 48MB
  aiQueryLimit: { type: Number, default: 500 },
  aiQueryCount: { type: Number, default: 42 },
  memoryPreferences: {
    language: { type: String, default: 'English' },
    tone: { type: String, default: 'concise and practical' },
    customInstructions: { type: String, default: 'Explain technical concepts clearly with bullet points and concrete examples.' }
  },
  theme: { type: String, default: 'light' }
}, 'users');
