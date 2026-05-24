import express from 'express';
import crypto from 'crypto';
import { protect } from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import { analyzeContent } from '../services/aiService.js';

const router = express.Router();

/* POST /api/extension/token — generate a VS Code extension token */
router.post('/token', protect, async (req, res) => {
  try {
    const token = crypto.randomBytes(32).toString('hex');
    await User.findByIdAndUpdate(req.user._id, { apiKey: token });
    res.json({ token, hint: 'Use this token in your VS Code extension settings as DEVINSPECT_TOKEN' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* GET /api/extension/token — get current token */
router.get('/token', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('apiKey');
    res.json({ token: user.apiKey || null });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* POST /api/extension/analyze — webhook endpoint for VS Code extension */
router.post('/analyze', async (req, res) => {
  const apiKey = req.headers['x-extension-token'] || req.headers['x-api-key'];
  if (!apiKey) return res.status(401).json({ message: 'Missing X-Extension-Token header' });

  try {
    const user = await User.findOne({ apiKey });
    if (!user) return res.status(401).json({ message: 'Invalid extension token' });

    const { code, mode = 'developer', language = 'javascript' } = req.body;
    if (!code?.trim()) return res.status(400).json({ message: 'code is required' });

    const result = await analyzeContent(code, mode, []);
    res.json({ success: true, result, mode, language });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
