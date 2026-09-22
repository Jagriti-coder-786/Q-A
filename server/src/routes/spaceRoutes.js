import express from 'express';
import {
  getSpaces,
  getSpaceById,
  createSpace,
  updateSpace,
  deleteSpace,
  inviteMember,
  updateMemberRole,
  removeMember
} from '../controllers/spaceController.js';
import { authenticate } from '../middleware/auth.js';
import { requireSpaceRole } from '../middleware/rbac.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getSpaces);
router.post('/', createSpace);
router.get('/:id', requireSpaceRole('viewer'), getSpaceById);
router.patch('/:id', requireSpaceRole('admin'), updateSpace);
router.delete('/:id', requireSpaceRole('owner'), deleteSpace);

// Team & Collaborators
router.post('/:id/invite', requireSpaceRole('admin'), inviteMember);
router.patch('/:id/members/:memberId', requireSpaceRole('admin'), updateMemberRole);
router.delete('/:id/members/:memberId', requireSpaceRole('admin'), removeMember);

export default router;
