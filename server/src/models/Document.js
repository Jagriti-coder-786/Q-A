import { createModel } from './createModel.js';

export const Document = createModel('Document', {
  title: { type: String, required: true },
  originalName: { type: String, required: true },
  fileType: { type: String, required: true }, // pdf, docx, csv, xlsx, txt, md
  fileSize: { type: Number, required: true },
  filePath: { type: String, required: true },
  spaceId: { type: String, required: true },
  ownerId: { type: String, required: true },
  status: {
    type: String,
    enum: ['uploading', 'extracting', 'analyzing', 'indexing', 'ready', 'failed'],
    default: 'ready'
  },
  processingProgress: { type: Number, default: 100 }, // 0 to 100
  pageCount: { type: Number, default: 1 },
  wordCount: { type: Number, default: 0 },
  readingTimeMinutes: { type: Number, default: 1 },
  complexity: { type: String, enum: ['Basic', 'Intermediate', 'Advanced'], default: 'Intermediate' },
  category: { type: String, default: 'General' },
  topics: [{ type: String }],
  detectedEntities: [{ type: String }],
  summary: { type: String, default: '' },
  language: { type: String, default: 'English' },
  metadata: {
    tablesCount: { type: Number, default: 0 },
    imagesCount: { type: Number, default: 0 },
    sectionsCount: { type: Number, default: 0 }
  },
  rawText: { type: String, default: '' },
  errorMessage: { type: String, default: '' }
}, 'documents');
