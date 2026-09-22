export function createSemanticChunks(pages, documentId, spaceId, options = {}) {
  const chunkSize = options.chunkSize || 300; // words per chunk
  const overlap = options.overlap || 50; // words overlap
  const chunks = [];
  let chunkIndex = 0;

  for (const page of pages) {
    const pageNum = page.pageNumber;
    const pageText = page.text;
    
    // Split into paragraphs first to avoid cutting midway across sentences
    const paragraphs = pageText.split(/\n+/).map(p => p.trim()).filter(Boolean);
    let currentWords = [];
    let currentSection = 'General';

    for (const paragraph of paragraphs) {
      // Check for section heading
      const headingMatch = paragraph.match(/^(?:#{1,4}\s+|[0-9]+\.[0-9]*\s+|[A-Z\s]{4,35}:?)(.+)$/);
      if (headingMatch && paragraph.length < 80) {
        currentSection = paragraph.replace(/^[#\s0-9.:]+/, '').trim() || 'General';
      }

      const words = paragraph.split(/\s+/);
      currentWords.push(...words);

      if (currentWords.length >= chunkSize) {
        const chunkText = currentWords.join(' ');
        chunks.push({
          documentId,
          spaceId,
          chunkIndex: chunkIndex++,
          pageNumber: pageNum,
          sectionTitle: currentSection,
          content: chunkText,
          tokenCount: Math.round(currentWords.length * 1.3),
          keywords: extractKeywords(chunkText)
        });

        // Retain overlap for continuity
        currentWords = currentWords.slice(-overlap);
      }
    }

    if (currentWords.length > 30) {
      const chunkText = currentWords.join(' ');
      chunks.push({
        documentId,
        spaceId,
        chunkIndex: chunkIndex++,
        pageNumber: pageNum,
        sectionTitle: currentSection,
        content: chunkText,
        tokenCount: Math.round(currentWords.length * 1.3),
        keywords: extractKeywords(chunkText)
      });
    }
  }

  return chunks;
}

function extractKeywords(text) {
  const stopwords = new Set([
    'the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'in', 'to', 'for', 'of', 'with', 'as',
    'by', 'that', 'this', 'it', 'from', 'be', 'are', 'was', 'were', 'or', 'an', 'will', 'my',
    'your', 'their', 'we', 'they', 'you', 'can', 'has', 'have', 'had', 'not', 'but', 'all'
  ]);
  const tokens = text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
  const map = {};
  for (const token of tokens) {
    if (!stopwords.has(token)) {
      map[token] = (map[token] || 0) + 1;
    }
  }
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([w]) => w);
}
