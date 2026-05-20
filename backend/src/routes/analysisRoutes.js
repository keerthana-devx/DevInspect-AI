import express from 'express';
import { runAnalysis } from '../controllers/analysisController.js';
import { protect } from '../middleware/authMiddleware.js';
const router = express.Router();

router.post('/', protect, runAnalysis);
export default router;