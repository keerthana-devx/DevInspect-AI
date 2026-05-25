import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  generateQuestions,
  evaluateAnswer,
  saveSession,
  getHistory,
  getSession,
} from '../controllers/interviewController.js';

const router = express.Router();

// Public — question generation & evaluation (no auth needed for quick use)
router.post('/generate',  generateQuestions);
router.post('/evaluate',  evaluateAnswer);

// Protected — session persistence
router.post('/session',        protect, saveSession);
router.get('/history',         protect, getHistory);
router.get('/session/:id',     protect, getSession);

export default router;
