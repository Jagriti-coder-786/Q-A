import { createModel } from './createModel.js';

export const Conversation = createModel('Conversation', {
  spaceId: { type: String, required: true },
  documentId: { type: String, default: null },
  userId: { type: String, required: true },
  title: { type: String, default: 'New Conversation' },
  isPinned: { type: Boolean, default: false },
  mode: {
    type: String,
    enum: ['ask', 'summarize', 'study', 'research', 'compare', 'analyze'],
    default: 'ask'
  },
  lastMessageAt: { type: Date, default: Date.now }
}, 'conversations');

export const Message = createModel('Message', {
  conversationId: { type: String, required: true },
  spaceId: { type: String, required: true },
  role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
  content: { type: String, required: true },
  mode: { type: String, default: 'ask' },
  citations: [{
    documentId: { type: String },
    documentTitle: { type: String },
    pageNumber: { type: Number },
    sectionTitle: { type: String },
    excerpt: { type: String }
  }],
  calculationData: { type: Object, default: null }
}, 'messages');
