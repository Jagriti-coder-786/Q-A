import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { signToken } from '../middleware/auth.js';

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      plan: 'pro',
      storageLimitBytes: 2 * 1024 * 1024 * 1024,
      storageUsedBytes: 0,
      aiQueryLimit: 500,
      aiQueryCount: 0
    });

    const token = signToken(user);
    const safeUser = { ...user };
    delete safeUser.passwordHash;

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: safeUser
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = signToken(user);
    const safeUser = { ...user };
    delete safeUser.passwordHash;

    res.json({
      success: true,
      message: 'Welcome back to DocuMind AI.',
      token,
      user: safeUser
    });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res) {
  res.json({ success: true, user: req.user });
}

export async function updateProfile(req, res, next) {
  try {
    const { name, avatar, theme } = req.body;
    const userId = req.user._id || req.user.id;
    const update = {};
    if (name) update.name = name;
    if (avatar) update.avatar = avatar;
    if (theme) update.theme = theme;

    const updated = await User.findByIdAndUpdate(userId, update, { new: true });
    delete updated.passwordHash;
    res.json({ success: true, user: updated });
  } catch (err) {
    next(err);
  }
}

export async function updateMemory(req, res, next) {
  try {
    const { language, tone, customInstructions } = req.body;
    const userId = req.user._id || req.user.id;

    const updated = await User.findByIdAndUpdate(userId, {
      memoryPreferences: {
        language: language || 'English',
        tone: tone || 'concise and practical',
        customInstructions: customInstructions || ''
      }
    }, { new: true });

    res.json({
      success: true,
      message: 'AI memory preferences updated.',
      memoryPreferences: updated.memoryPreferences
    });
  } catch (err) {
    next(err);
  }
}
