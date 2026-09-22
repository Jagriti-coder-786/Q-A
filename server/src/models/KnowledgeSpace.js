import { createModel } from './createModel.js';

export const KnowledgeSpace = createModel('KnowledgeSpace', {
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  icon: { type: String, default: 'Folder' },
  color: { type: String, default: 'indigo' },
  ownerId: { type: String, required: true },
  members: [{
    userId: { type: String },
    email: { type: String },
    name: { type: String },
    role: { type: String, enum: ['owner', 'admin', 'editor', 'viewer'], default: 'viewer' }
  }],
  tags: [{ type: String }],
  aiInstructions: { type: String, default: '' },
  isArchived: { type: Boolean, default: false },
  isFavorite: { type: Boolean, default: false },
  documentCount: { type: Number, default: 0 },
  conversationCount: { type: Number, default: 0 }
}, 'spaces');
