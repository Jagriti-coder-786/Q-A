import { createModel } from './createModel.js';

export const Note = createModel('Note', {
  documentId: { type: String, required: true },
  spaceId: { type: String, required: true },
  userId: { type: String, required: true },
  title: { type: String, default: 'Document Note' },
  content: { type: String, required: true },
  pageNumber: { type: Number, default: 1 },
  selectedText: { type: String, default: '' },
  tags: [{ type: String }],
  color: { type: String, default: 'yellow' }
}, 'notes');

export const Highlight = createModel('Highlight', {
  documentId: { type: String, required: true },
  spaceId: { type: String, required: true },
  userId: { type: String, required: true },
  text: { type: String, required: true },
  pageNumber: { type: Number, default: 1 },
  color: { type: String, default: '#FEF08A' }, // subtle yellow
  noteId: { type: String, default: null }
}, 'highlights');

export const ActivityLog = createModel('ActivityLog', {
  spaceId: { type: String, required: true },
  userId: { type: String, required: true },
  userName: { type: String, default: 'Member' },
  action: { type: String, required: true }, // 'upload_document', 'delete_document', 'create_note', 'start_chat', 'invite_member'
  details: { type: String, required: true },
  metadata: { type: Object, default: {} }
}, 'activityLogs');
