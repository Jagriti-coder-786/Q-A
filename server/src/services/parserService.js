import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';

export async function parseDocument(filePath, originalName, mimeType) {
  const ext = path.extname(originalName).toLowerCase();
  let extractedText = '';
  let pages = [];
  let tablesCount = 0;
  let metadata = {};

  try {
    if (ext === '.pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      extractedText = pdfData.text || '';
      
      // Attempt splitting text into pages by form feed (\x0c) or synthetic page markers
      const rawPages = extractedText.split(/\x0c/);
      if (rawPages.length > 1) {
        pages = rawPages.map((txt, idx) => ({
          pageNumber: idx + 1,
          text: txt.trim()
        })).filter(p => p.text.length > 0);
      } else {
        // Approximate 400 words per page if no form-feeds
        const words = extractedText.split(/\s+/);
        const pageSize = 350;
        const totalEstimatedPages = Math.max(1, Math.ceil(words.length / pageSize));
        for (let i = 0; i < totalEstimatedPages; i++) {
          const chunkWords = words.slice(i * pageSize, (i + 1) * pageSize);
          pages.push({
            pageNumber: i + 1,
            text: chunkWords.join(' ')
          });
        }
      }
      metadata = {
        info: pdfData.info,
        numpages: pdfData.numpages || pages.length
      };

    } else if (ext === '.docx' || ext === '.doc') {
      const result = await mammoth.extractRawText({ path: filePath });
      extractedText = result.value || '';
      
      const paragraphs = extractedText.split(/\n\n+/);
      let currentPage = 1;
      let buffer = [];
      for (const p of paragraphs) {
        buffer.push(p);
        if (buffer.join(' ').split(/\s+/).length >= 400) {
          pages.push({ pageNumber: currentPage++, text: buffer.join('\n\n') });
          buffer = [];
        }
      }
      if (buffer.length > 0) {
        pages.push({ pageNumber: currentPage, text: buffer.join('\n\n') });
      }

    } else if (ext === '.csv' || ext === '.xlsx' || ext === '.xls') {
      const workbook = XLSX.readFile(filePath);
      const sheetNames = workbook.SheetNames;
      tablesCount = sheetNames.length;
      let fullCsvText = '';

      sheetNames.forEach((sheetName, idx) => {
        const sheet = workbook.Sheets[sheetName];
        const csvData = XLSX.utils.sheet_to_csv(sheet);
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        
        fullCsvText += `\n### Sheet: ${sheetName}\n` + csvData;
        pages.push({
          pageNumber: idx + 1,
          text: `Sheet: ${sheetName}\n\n` + csvData,
          structuredData: jsonData.slice(0, 50) // sample rows for table calculation
        });
      });
      extractedText = fullCsvText;
      metadata.sheetNames = sheetNames;

    } else {
      // Default: Plain text or Markdown
      extractedText = fs.readFileSync(filePath, 'utf-8');
      const paragraphs = extractedText.split(/\n\s*\n/);
      let pageNum = 1;
      let currentBuffer = [];

      for (const p of paragraphs) {
        currentBuffer.push(p);
        if (currentBuffer.join(' ').split(/\s+/).length >= 350) {
          pages.push({ pageNumber: pageNum++, text: currentBuffer.join('\n\n') });
          currentBuffer = [];
        }
      }
      if (currentBuffer.length > 0 || pages.length === 0) {
        pages.push({ pageNumber: pageNum, text: currentBuffer.join('\n\n') || extractedText });
      }
    }

    if (pages.length === 0 && extractedText.trim()) {
      pages.push({ pageNumber: 1, text: extractedText });
    }

    // Heuristics: word count, reading time, topics, entities, complexity
    const wordList = extractedText.trim().split(/\s+/).filter(Boolean);
    const wordCount = wordList.length;
    const readingTimeMinutes = Math.max(1, Math.round(wordCount / 200));

    // Detect section headings
    const headingMatches = extractedText.match(/^(?:#{1,4}\s+|[0-9]+\.[0-9]*\s+|[A-Z][A-Za-z\s]{3,30}:)/gm) || [];
    const sectionsCount = Math.max(1, headingMatches.length);

    // Topic & Entity extraction
    const detectedTopics = extractTopics(extractedText);
    const detectedEntities = extractEntities(extractedText);
    const complexity = assessComplexity(extractedText, wordCount);

    return {
      success: true,
      extractedText,
      pages,
      pageCount: pages.length || 1,
      wordCount,
      readingTimeMinutes,
      sectionsCount,
      tablesCount,
      topics: detectedTopics,
      entities: detectedEntities,
      complexity,
      metadata
    };
  } catch (err) {
    console.error(`❌ Parser error for ${originalName}:`, err.message);
    throw new Error(`Could not extract readable text from ${originalName}. Ensure file is not password-protected.`);
  }
}

function extractTopics(text) {
  const commonKeywords = [
    'Operating Systems', 'Process Management', 'Deadlock', 'Memory Allocation',
    'Database Management', 'SQL', 'Transactions', 'ACID', 'Normalization',
    'Machine Learning', 'Neural Networks', 'Transformers', 'Embeddings', 'Retrieval',
    'Distributed Systems', 'Architecture', 'API Design', 'Security', 'Authentication',
    'Financial Analysis', 'Revenue', 'Profit Margin', 'Q1 Performance', 'Quarterly Growth'
  ];
  const found = commonKeywords.filter(k => new RegExp(`\\b${k}\\b`, 'i').test(text));
  return found.length > 0 ? found.slice(0, 6) : ['General Concepts', 'Core Documentation'];
}

function extractEntities(text) {
  const words = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
  const freq = {};
  for (const w of words) {
    if (w.length > 3 && !['This', 'That', 'With', 'From', 'Then', 'When', 'What', 'There', 'Here'].includes(w)) {
      freq[w] = (freq[w] || 0) + 1;
    }
  }
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([entity]) => entity);
}

function assessComplexity(text, wordCount) {
  if (wordCount < 300) return 'Basic';
  const avgWordLen = text.length / (wordCount || 1);
  if (avgWordLen > 6.2) return 'Advanced';
  return 'Intermediate';
}
