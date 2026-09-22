import express from 'express';
import { getDocuments, getDocumentById, uploadDocuments, deleteDocument, getDocumentPages } from '../controllers/documentController.js';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getDocuments);
router.post('/upload', upload.array('files', 10), uploadDocuments);
router.get('/:id', getDocumentById);
router.get('/:id/pages', getDocumentPages);
router.delete('/:id', deleteDocument);

export default router;
