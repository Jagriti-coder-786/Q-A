import express from 'express';
import { getOverviewAnalytics, getDocumentAnalytics } from '../controllers/analyticsController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);
router.get('/overview', getOverviewAnalytics);
router.get('/document/:id', getDocumentAnalytics);

export default router;
