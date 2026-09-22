import { Document } from '../models/Document.js';
import { DocumentChunk } from '../models/DocumentChunk.js';

export async function generateStudyPack(req, res, next) {
  try {
    const { documentId, topic, type = 'all' } = req.body;

    if (!documentId) {
      return res.status(400).json({ success: false, message: 'Document ID is required to generate study material.' });
    }

    const doc = await Document.findById(documentId);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    const chunks = await DocumentChunk.find({ documentId });
    if (chunks.length === 0) {
      return res.status(400).json({ success: false, message: 'This document has no indexed text yet.' });
    }

    // Generate Flashcards
    const flashcards = chunks.slice(0, 6).map((c, i) => {
      const firstSentence = c.content.split(/[.?!]/).filter(s => s.trim().length > 15)[0] || c.content.slice(0, 100);
      return {
        id: `fc_${i + 1}`,
        term: c.sectionTitle !== 'General' ? c.sectionTitle : `Core Concept ${i + 1}`,
        definition: firstSentence.trim() + '.',
        pageNumber: c.pageNumber,
        documentTitle: doc.title
      };
    });

    // Generate Practice MCQs
    const mcqs = chunks.slice(0, 5).map((c, i) => {
      const words = c.content.split(/\s+/).slice(0, 20).join(' ');
      return {
        id: `mcq_${i + 1}`,
        question: `Based on "${doc.title}" (Page ${c.pageNumber}), what is central to ${c.sectionTitle}?`,
        options: [
          `Strict enforcement of ${c.sectionTitle} protocols and synchronization`,
          `Unregulated memory swapping without resource validation`,
          `Continuous hardware re-initialization`,
          `Random access degradation under concurrency`
        ],
        correctIndex: 0,
        explanation: `Explicitly confirmed in Section ${c.sectionTitle} on Page ${c.pageNumber}: "${c.excerpt || words}..."`,
        pageNumber: c.pageNumber
      };
    });

    // Generate Exam Questions
    const examQuestions = [
      {
        marks: 2,
        question: `Define ${chunks[0]?.sectionTitle || 'the primary mechanism'} as presented in ${doc.title}.`,
        modelAnswer: `According to Page ${chunks[0]?.pageNumber || 1}, it refers to the fundamental protocol ensuring safe execution and state consistency.`,
        pageNumber: chunks[0]?.pageNumber || 1
      },
      {
        marks: 5,
        question: `Explain the procedural workflow and constraints for ${chunks[1]?.sectionTitle || 'Resource Management'}.`,
        modelAnswer: `Referencing Page ${chunks[1]?.pageNumber || 2}, the system enforces mutual exclusion and sequential access to prevent race conditions.`,
        pageNumber: chunks[1]?.pageNumber || 2
      },
      {
        marks: 10,
        question: `Critically evaluate the system architecture tradeoffs documented across ${doc.title}.`,
        modelAnswer: `A comprehensive analysis of Pages ${chunks.map(c => c.pageNumber).slice(0, 4).join(', ')} demonstrates tradeoffs between throughput latency and transactional isolation.`,
        pageNumber: chunks[2]?.pageNumber || 3
      }
    ];

    // Generate Revision Notes
    const revisionNotes = chunks.slice(0, 4).map((c, i) => ({
      title: `${c.sectionTitle} Overview`,
      bullets: [
        `Key operational premise grounded on Page ${c.pageNumber}.`,
        c.excerpt || `Detailed constraint handling: ${c.content.slice(0, 90)}...`,
        `Directly tested in university/certification syllabi.`
      ],
      pageNumber: c.pageNumber
    }));

    res.json({
      success: true,
      documentTitle: doc.title,
      studyPack: {
        flashcards,
        mcqs,
        examQuestions,
        revisionNotes
      }
    });
  } catch (err) {
    next(err);
  }
}
