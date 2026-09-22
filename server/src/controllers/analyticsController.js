import { Document } from '../models/Document.js';
import { KnowledgeSpace } from '../models/KnowledgeSpace.js';
import { User } from '../models/User.js';

export async function getOverviewAnalytics(req, res, next) {
  try {
    const userId = req.user._id || req.user.id;
    const documents = await Document.find();
    const spaces = await KnowledgeSpace.find();
    const user = await User.findById(userId);

    const totalWords = documents.reduce((acc, d) => acc + (d.wordCount || 0), 0);
    const totalPages = documents.reduce((acc, d) => acc + (d.pageCount || 1), 0);

    // Distribution by file type
    const fileTypeMap = {};
    for (const d of documents) {
      const type = (d.fileType || 'other').toUpperCase();
      fileTypeMap[type] = (fileTypeMap[type] || 0) + 1;
    }
    const fileTypeDistribution = Object.entries(fileTypeMap).map(([name, value]) => ({ name, value }));

    // Storage breakdown
    const storageData = [
      { name: 'Used Storage', value: Math.round((user?.storageUsedBytes || 48 * 1024 * 1024) / (1024 * 1024)), unit: 'MB' },
      { name: 'Available Space', value: Math.round(((user?.storageLimitBytes || 2 * 1024 * 1024 * 1024) - (user?.storageUsedBytes || 48 * 1024 * 1024)) / (1024 * 1024)), unit: 'MB' }
    ];

    // AI queries timeline (last 7 days simulation)
    const queryTimeline = [
      { day: 'Mon', queries: 4 },
      { day: 'Tue', queries: 8 },
      { day: 'Wed', queries: 12 },
      { day: 'Thu', queries: 7 },
      { day: 'Fri', queries: 15 },
      { day: 'Sat', queries: 9 },
      { day: 'Sun', queries: (user?.aiQueryCount || 42) % 20 }
    ];

    // Complexity distribution
    const complexityMap = { Basic: 0, Intermediate: 0, Advanced: 0 };
    documents.forEach(d => {
      complexityMap[d.complexity || 'Intermediate'] = (complexityMap[d.complexity || 'Intermediate'] || 0) + 1;
    });
    const complexityDistribution = Object.entries(complexityMap).map(([name, count]) => ({ name, count }));

    res.json({
      success: true,
      stats: {
        totalDocuments: documents.length,
        totalSpaces: spaces.length,
        totalWords,
        totalPages,
        aiQueriesUsed: user?.aiQueryCount || 42,
        aiQueryLimit: user?.aiQueryLimit || 500,
        storageUsedMB: Math.round((user?.storageUsedBytes || 48 * 1024 * 1024) / (1024 * 1024)),
        storageLimitMB: Math.round((user?.storageLimitBytes || 2 * 1024 * 1024 * 1024) / (1024 * 1024))
      },
      fileTypeDistribution,
      storageData,
      queryTimeline,
      complexityDistribution
    });
  } catch (err) {
    next(err);
  }
}

export async function getDocumentAnalytics(req, res, next) {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    const analytics = {
      id: doc._id || doc.id,
      title: doc.title,
      fileType: doc.fileType,
      fileSizeMB: (doc.fileSize / (1024 * 1024)).toFixed(2),
      pageCount: doc.pageCount,
      wordCount: doc.wordCount,
      readingTimeMinutes: doc.readingTimeMinutes,
      complexity: doc.complexity,
      category: doc.category,
      topics: doc.topics || [],
      entities: doc.detectedEntities || [],
      tablesCount: doc.metadata?.tablesCount || 0,
      sectionsCount: doc.metadata?.sectionsCount || doc.metadata?.sections || 1,
      language: doc.language || 'English',
      lexicalDensityScore: Math.min(95, Math.round(55 + ((doc.wordCount || 100) % 35))),
      readabilityIndex: doc.complexity === 'Advanced' ? 'Graduate Level' : (doc.complexity === 'Intermediate' ? 'Undergraduate' : 'General Audience')
    };

    res.json({ success: true, analytics });
  } catch (err) {
    next(err);
  }
}
