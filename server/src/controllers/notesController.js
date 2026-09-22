import { Note, Highlight, ActivityLog } from '../models/Note.js';

export async function getNotes(req, res, next) {
  try {
    const { documentId, spaceId } = req.query;
    const filter = {};
    if (documentId) filter.documentId = documentId;
    if (spaceId) filter.spaceId = spaceId;

    const notes = await Note.find(filter);
    notes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ success: true, notes });
  } catch (err) {
    next(err);
  }
}

export async function createNote(req, res, next) {
  try {
    const { documentId, spaceId, title, content, pageNumber = 1, selectedText = '', color = 'yellow', tags = [] } = req.body;
    if (!content || !spaceId || !documentId) {
      return res.status(400).json({ success: false, message: 'Document ID, Space ID, and note content are required.' });
    }

    const note = await Note.create({
      documentId,
      spaceId,
      userId: req.user._id || req.user.id,
      title: title || 'Document Note',
      content: content.trim(),
      pageNumber,
      selectedText,
      color,
      tags
    });

    await ActivityLog.create({
      spaceId,
      userId: req.user._id || req.user.id,
      userName: req.user.name,
      action: 'create_note',
      details: `Added note on page ${pageNumber}.`
    });

    res.status(201).json({ success: true, note });
  } catch (err) {
    next(err);
  }
}

export async function deleteNote(req, res, next) {
  try {
    const { id } = req.params;
    await Note.findByIdAndDelete(id);
    res.json({ success: true, message: 'Note deleted.' });
  } catch (err) {
    next(err);
  }
}

export async function getHighlights(req, res, next) {
  try {
    const { documentId, spaceId } = req.query;
    const filter = {};
    if (documentId) filter.documentId = documentId;
    if (spaceId) filter.spaceId = spaceId;

    const highlights = await Highlight.find(filter);
    res.json({ success: true, highlights });
  } catch (err) {
    next(err);
  }
}

export async function createHighlight(req, res, next) {
  try {
    const { documentId, spaceId, text, pageNumber = 1, color = '#FEF08A' } = req.body;
    if (!documentId || !spaceId || !text) {
      return res.status(400).json({ success: false, message: 'Document ID, Space ID, and highlighted text are required.' });
    }

    const highlight = await Highlight.create({
      documentId,
      spaceId,
      userId: req.user._id || req.user.id,
      text: text.trim(),
      pageNumber,
      color
    });

    res.status(201).json({ success: true, highlight });
  } catch (err) {
    next(err);
  }
}

export async function deleteHighlight(req, res, next) {
  try {
    const { id } = req.params;
    await Highlight.findByIdAndDelete(id);
    res.json({ success: true, message: 'Highlight deleted.' });
  } catch (err) {
    next(err);
  }
}

export async function getActivityLogs(req, res, next) {
  try {
    const { spaceId } = req.query;
    const filter = {};
    if (spaceId) filter.spaceId = spaceId;

    const logs = await ActivityLog.find(filter);
    logs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ success: true, logs: logs.slice(0, 30) });
  } catch (err) {
    next(err);
  }
}
