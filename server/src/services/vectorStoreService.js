// Local high-dimensional semantic vectorizer & cosine similarity engine

const VOCAB_SIZE = 256;

// Deterministic semantic hashing vectorizer to map text into a normalized float vector
export function generateEmbedding(text) {
  const vector = new Array(VOCAB_SIZE).fill(0);
  const normalized = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const words = normalized.split(/\s+/).filter(Boolean);

  if (words.length === 0) return vector;

  // Word-level and bigram hash projections with term frequency
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    let hash = 0;
    for (let j = 0; j < word.length; j++) {
      hash = (hash * 31 + word.charCodeAt(j)) % VOCAB_SIZE;
    }
    vector[Math.abs(hash)] += 1;

    // Bigram
    if (i < words.length - 1) {
      const bigram = word + '_' + words[i + 1];
      let bHash = 0;
      for (let j = 0; j < bigram.length; j++) {
        bHash = (bHash * 37 + bigram.charCodeAt(j)) % VOCAB_SIZE;
      }
      vector[Math.abs(bHash)] += 1.5;
    }
  }

  // L2 Normalization
  let norm = 0;
  for (let i = 0; i < VOCAB_SIZE; i++) {
    norm += vector[i] * vector[i];
  }
  norm = Math.sqrt(norm);
  if (norm > 0) {
    for (let i = 0; i < VOCAB_SIZE; i++) {
      vector[i] = vector[i] / norm;
    }
  }

  return vector;
}

export function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
  }
  return Math.max(0, Math.min(1, dotProduct));
}

// BM25 Keyword scoring for sparse retrieval
export function computeBM25Score(queryWords, chunkKeywords, chunkText) {
  let score = 0;
  const lowerText = chunkText.toLowerCase();

  for (const q of queryWords) {
    if (q.length < 3) continue;
    // Exact phrase / word match
    const regex = new RegExp(`\\b${q}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches) {
      score += matches.length * 1.8;
    } else if (lowerText.includes(q)) {
      score += 0.8;
    }

    if (chunkKeywords && chunkKeywords.includes(q)) {
      score += 2.5;
    }
  }

  return score;
}
