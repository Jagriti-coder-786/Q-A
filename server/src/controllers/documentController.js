import path from 'path';
import fs from 'fs';
import { Document } from '../models/Document.js';
import { DocumentChunk } from '../models/DocumentChunk.js';
import { KnowledgeSpace } from '../models/KnowledgeSpace.js';
import { User } from '../models/User.js';
import { ActivityLog } from '../models/Note.js';
import { parseDocument } from '../services/parserService.js';
import { createSemanticChunks } from '../services/chunkingService.js';
import { generateEmbedding } from '../services/vectorStoreService.js';

export async function getDocuments(req, res, next) {
  try {
    const { spaceId, category, search } = req.query;
    const filter = {};
    if (spaceId) filter.spaceId = spaceId;
    if (category) filter.category = category;

    let documents = await Document.find(filter);

    if (search) {
      const q = search.toLowerCase();
      documents = documents.filter(d =>
        d.title.toLowerCase().includes(q) ||
        (d.topics && d.topics.some(t => t.toLowerCase().includes(q)))
      );
    }

    res.json({ success: true, documents });
  } catch (err) {
    next(err);
  }
}

export async function getDocumentById(req, res, next) {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }
    res.json({ success: true, document });
  } catch (err) {
    next(err);
  }
}

export async function uploadDocuments(req, res, next) {
  try {
    const files = req.files || (req.file ? [req.file] : []);
    const { spaceId } = req.body;

    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, message: 'Please select at least one document to upload.' });
    }

    if (!spaceId) {
      return res.status(400).json({ success: false, message: 'Please specify target Knowledge Space ID.' });
    }

    const userId = req.user._id || req.user.id;
    const createdDocs = [];

    for (const file of files) {
      const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
      const doc = await Document.create({
        title: file.originalname.replace(/\.[^/.]+$/, ''),
        originalName: file.originalname,
        fileType: ext,
        fileSize: file.size,
        filePath: file.path,
        spaceId,
        ownerId: userId,
        status: 'uploading',
        processingProgress: 15
      });

      createdDocs.push(doc);

      // Trigger ingestion pipeline asynchronously
      processIngestionPipeline(doc._id || doc.id, file.path, file.originalname, file.mimetype, spaceId, userId);
    }

    // Update space count
    const totalDocsInSpace = await Document.countDocuments({ spaceId });
    await KnowledgeSpace.findByIdAndUpdate(spaceId, { documentCount: totalDocsInSpace });

    // Update user storage
    const addedBytes = files.reduce((acc, f) => acc + f.size, 0);
    const currentUser = await User.findById(userId);
    if (currentUser) {
      await User.findByIdAndUpdate(userId, {
        storageUsedBytes: (currentUser.storageUsedBytes || 0) + addedBytes
      });
    }

    res.status(202).json({
      success: true,
      message: `Received ${files.length} document(s). Processing pipeline started.`,
      documents: createdDocs
    });
  } catch (err) {
    next(err);
  }
}

async function processIngestionPipeline(documentId, filePath, originalName, mimeType, spaceId, userId) {
  try {
    // 1. Stage: Extracting
    await Document.findByIdAndUpdate(documentId, {
      status: 'extracting',
      processingProgress: 35
    });

    const parsed = await parseDocument(filePath, originalName, mimeType);

    // 2. Stage: Analyzing structure
    await Document.findByIdAndUpdate(documentId, {
      status: 'analyzing',
      processingProgress: 65,
      pageCount: parsed.pageCount,
      wordCount: parsed.wordCount,
      readingTimeMinutes: parsed.readingTimeMinutes,
      sectionsCount: parsed.sectionsCount,
      topics: parsed.topics,
      detectedEntities: parsed.entities,
      complexity: parsed.complexity,
      rawText: parsed.extractedText.slice(0, 10000), // store preview buffer
      metadata: {
        tablesCount: parsed.tablesCount,
        sectionsCount: parsed.sectionsCount,
        ...parsed.metadata
      }
    });

    // 3. Stage: Semantic Chunking & Vector Indexing
    await Document.findByIdAndUpdate(documentId, {
      status: 'indexing',
      processingProgress: 85
    });

    const chunks = createSemanticChunks(parsed.pages, documentId, spaceId);

    const chunkDocs = chunks.map(chunk => ({
      ...chunk,
      embedding: generateEmbedding(chunk.content)
    }));

    if (chunkDocs.length > 0) {
      await DocumentChunk.insertMany(chunkDocs);
    }

    // 4. Stage: Ready
    await Document.findByIdAndUpdate(documentId, {
      status: 'ready',
      processingProgress: 100,
      summary: parsed.extractedText.slice(0, 300) + '...'
    });

    await ActivityLog.create({
      spaceId,
      userId,
      userName: 'Member',
      action: 'upload_document',
      details: `Processed and indexed "${originalName}" (${parsed.pageCount} pages, ${parsed.wordCount} words).`
    });

    console.log(`✅ [Pipeline] Successfully ingested and indexed ${originalName} into ${chunkDocs.length} chunks.`);
  } catch (err) {
    console.error(`❌ [Pipeline] Failed to process document ${documentId}:`, err.message);
    await Document.findByIdAndUpdate(documentId, {
      status: 'failed',
      processingProgress: 0,
      errorMessage: err.message || 'We could not extract readable content from this file.'
    });
  }
}

export async function deleteDocument(req, res, next) {
  try {
    const docId = req.params.id;
    const doc = await Document.findById(docId);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    // Delete chunks and physical file
    await DocumentChunk.deleteMany({ documentId: docId });
    if (doc.filePath && fs.existsSync(doc.filePath)) {
      try { fs.unlinkSync(doc.filePath); } catch (e) {}
    }

    await Document.findByIdAndDelete(docId);

    // Update space count
    const remainingInSpace = await Document.countDocuments({ spaceId: doc.spaceId });
    await KnowledgeSpace.findByIdAndUpdate(doc.spaceId, { documentCount: remainingInSpace });

    res.json({ success: true, message: 'Document removed successfully.' });
  } catch (err) {
    next(err);
  }
}

export async function retryDocumentProcessing(req, res, next) {
  try {
    const docId = req.params.id;
    const doc = await Document.findById(docId);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    if (!doc.filePath || !fs.existsSync(doc.filePath)) {
      return res.status(400).json({
        success: false,
        message: 'The original file was removed or is not available on disk. Please upload it again.'
      });
    }

    const userId = req.user._id || req.user.id;
    await Document.findByIdAndUpdate(docId, {
      status: 'uploading',
      processingProgress: 15,
      errorMessage: null
    });

    // Re-run pipeline asynchronously
    processIngestionPipeline(
      docId,
      doc.filePath,
      doc.originalName || doc.title,
      doc.fileType,
      doc.spaceId,
      userId
    );

    res.json({
      success: true,
      message: 'Ingestion pipeline restarted for this document.',
      documentId: docId
    });
  } catch (err) {
    next(err);
  }
}


export async function getDocumentPages(req, res, next) {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    // Fetch chunks to assemble document pages
    const chunks = await DocumentChunk.find({ documentId: doc._id || doc.id });
    chunks.sort((a, b) => a.chunkIndex - b.chunkIndex);

    // Group by page number
    const pageMap = {};
    for (const c of chunks) {
      if (!pageMap[c.pageNumber]) {
        pageMap[c.pageNumber] = [];
      }
      pageMap[c.pageNumber].push(c);
    }

    const pages = Object.entries(pageMap).map(([pageNum, pageChunks]) => ({
      pageNumber: parseInt(pageNum),
      text: pageChunks.map(c => c.content).join('\n\n'),
      sections: [...new Set(pageChunks.map(c => c.sectionTitle))]
    }));

    if (pages.length === 0 && doc.rawText) {
      pages.push({
        pageNumber: 1,
        text: doc.rawText,
        sections: ['General']
      });
    }

    res.json({ success: true, document: doc, pages });
  } catch (err) {
    next(err);
  }
}
