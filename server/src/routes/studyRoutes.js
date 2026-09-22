import express from 'express';
import { generateStudyPack } from '../controllers/studyController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);
router.post('/generate', generateStudyPack);

export default router;
