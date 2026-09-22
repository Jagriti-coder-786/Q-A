import express from 'express';
import { getConversations, getConversationById, createConversation, sendMessage, deleteConversation, togglePinConversation } from '../controllers/chatController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/conversations', getConversations);
router.post('/conversations', createConversation);
router.get('/conversations/:id', getConversationById);
router.delete('/conversations/:id', deleteConversation);
router.patch('/conversations/:id/pin', togglePinConversation);
router.post('/message', sendMessage);

export default router;
