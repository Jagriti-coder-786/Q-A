import express from 'express';
import { register, login, getMe, updateProfile, updateMemory } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getMe);
router.patch('/profile', authenticate, updateProfile);
router.patch('/memory', authenticate, updateMemory);

export default router;
