import express from 'express';
import { analyzeContent } from '../services/aiService.js';
import { generateInterviewQuestion } from '../services/interviewService.js';

const router = express.Router();

router.post('/analyze', async (req, res) => {
  try {
    const { code, language } = req.body;
    if (!code?.trim()) return res.status(400).json({ message: 'Missing code' });
    const result = await analyzeContent(code, language);
    return res.status(200).json({ success: true, result });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Generate a real interview question via AI
router.post('/interview/question', async (req, res) => {
  try {
    const { difficulty = 'medium', company = 'general', category = 'DSA', language = 'javascript' } = req.body;
    const question = await generateInterviewQuestion({ difficulty, company, category, language });
    return res.status(200).json({ success: true, question });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
