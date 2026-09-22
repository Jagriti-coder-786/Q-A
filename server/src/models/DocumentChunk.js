import { createModel } from './createModel.js';

export const DocumentChunk = createModel('DocumentChunk', {
  documentId: { type: String, required: true },
  spaceId: { type: String, required: true },
  chunkIndex: { type: Number, required: true },
  pageNumber: { type: Number, default: 1 },
  sectionTitle: { type: String, default: 'General' },
  content: { type: String, required: true },
  tokenCount: { type: Number, default: 0 },
  embedding: [{ type: Number }],
  keywords: [{ type: String }]
}, 'chunks');
