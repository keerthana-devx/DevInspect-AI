import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import analysisRoutes from './routes/analysisRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import testRoutes from './routes/testRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import { analyzeContent } from './services/aiService.js';
import History from './models/History.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/review', reviewRoutes);
app.use('/api/test', testRoutes);
app.use('/api/ai', aiRoutes);

// Alias: POST /api/analyze-code (spec-compatible path)
app.post('/api/analyze-code', async (req, res) => {
  try {
    const { code, mode } = req.body;
    if (!code || !String(code).trim()) {
      return res.status(400).json({ message: 'Missing code in request' });
    }
    const aiResult = await analyzeContent(code, mode);
    try {
      await History.create({
        userId: req.user?.id || req.user?._id || 'guest',
        action: 'analysis',
        data: { input: code, mode: mode || 'developer', result: aiResult },
      });
    } catch (e) {
      console.warn('Could not save history:', e.message);
    }
    return res.status(200).json({
      correctedCode: aiResult.correctedCode || '',
      explanation: aiResult.explanation || '',
      modeOutput: aiResult.modeOutput || '',
      errors: Array.isArray(aiResult.errors) ? aiResult.errors : [],
      degraded: Boolean(aiResult.degraded),
    });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'AI analysis failed' });
  }
});

export default app;