import express from 'express';
import { compareDocuments } from '../controllers/compareController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);
router.post('/', compareDocuments);

export default router;
