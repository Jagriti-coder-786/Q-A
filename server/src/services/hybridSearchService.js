import { DocumentChunk } from '../models/DocumentChunk.js';
import { Document } from '../models/Document.js';
import { generateEmbedding, cosineSimilarity, computeBM25Score } from './vectorStoreService.js';

export async function hybridSearch({ spaceId, documentId = null, query, topK = 5, minScore = 0.25 }) {
  // Query understanding and expansion
  const queryTokens = query.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 2);
  const queryVector = generateEmbedding(query);

  // Fetch candidate chunks
  const filter = { spaceId };
  if (documentId) {
    filter.documentId = documentId;
  }

  const allChunks = await DocumentChunk.find(filter);
  if (!allChunks || allChunks.length === 0) {
    return [];
  }

  // Preload document titles for instant citation mapping
  const docIds = [...new Set(allChunks.map(c => c.documentId))];
  const docs = await Document.find({ _id: { $in: docIds } });
  const docMap = new Map(docs.map(d => [d._id || d.id, d]));

  // Score each chunk using hybrid formula: (0.6 * DenseVectorScore) + (0.4 * NormalizedBM25Score)
  const scoredChunks = allChunks.map(chunk => {
    const denseScore = cosineSimilarity(queryVector, chunk.embedding || []);
    const sparseRaw = computeBM25Score(queryTokens, chunk.keywords, chunk.content);
    // Sigmoid normalization for sparse score
    const sparseScore = sparseRaw / (sparseRaw + 10);

    const hybridScore = (0.55 * denseScore) + (0.45 * sparseScore);

    const doc = docMap.get(chunk.documentId) || { title: 'Document' };

    // Extract most relevant snippet / sentence for citation
    const excerpt = extractRelevantExcerpt(queryTokens, chunk.content);

    return {
      chunkId: chunk._id || chunk.id,
      documentId: chunk.documentId,
      documentTitle: doc.title,
      spaceId: chunk.spaceId,
      pageNumber: chunk.pageNumber,
      sectionTitle: chunk.sectionTitle,
      content: chunk.content,
      excerpt,
      score: hybridScore,
      denseScore,
      sparseScore
    };
  });

  // Reranking: Sort descending by hybridScore
  scoredChunks.sort((a, b) => b.score - a.score);

  // Filter out low relevance to avoid hallucinating
  const relevantChunks = scoredChunks.filter(c => c.score >= minScore).slice(0, topK);

  return relevantChunks;
}

function extractRelevantExcerpt(tokens, text) {
  const sentences = text.split(/(?<=[.?!])\s+/);
  let bestSentence = sentences[0] || text.slice(0, 180);
  let maxMatches = -1;

  for (const s of sentences) {
    const lower = s.toLowerCase();
    let matches = 0;
    for (const t of tokens) {
      if (lower.includes(t)) matches++;
    }
    if (matches > maxMatches) {
      maxMatches = matches;
      bestSentence = s.trim();
    }
  }

  if (bestSentence.length > 250) {
    return bestSentence.slice(0, 247) + '...';
  }
  return bestSentence;
}
