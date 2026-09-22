import express from 'express';
import { getSpaces, getSpaceById, createSpace, updateSpace, deleteSpace, inviteMember } from '../controllers/spaceController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getSpaces);
router.post('/', createSpace);
router.get('/:id', getSpaceById);
router.patch('/:id', updateSpace);
router.delete('/:id', deleteSpace);
router.post('/:id/invite', inviteMember);

export default router;
