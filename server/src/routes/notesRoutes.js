import express from 'express';
import { getNotes, createNote, deleteNote, getHighlights, createHighlight, deleteHighlight, getActivityLogs } from '../controllers/notesController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getNotes);
router.post('/', createNote);
router.delete('/:id', deleteNote);

router.get('/highlights', getHighlights);
router.post('/highlights', createHighlight);
router.delete('/highlights/:id', deleteHighlight);

router.get('/activity', getActivityLogs);

export default router;
