import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import analysisRoutes from './routes/analysisRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import testRoutes from './routes/testRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import userRoutes from './routes/userRoutes.js';
import historyRoutes from './routes/historyRoutes.js';
import workspaceRoutes from './routes/workspaceRoutes.js';
import ciRoutes from './routes/ciRoutes.js';
import { analyzeContent, normalizeMode } from './services/aiService.js';
import History from './models/History.js';
import adminRoutes from "./routes/adminRoutes.js";

const app = express();

// CORS Configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',').map(o => o.trim()) 
    : ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Request logging (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/review', reviewRoutes);
app.use('/api/test', testRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/user', userRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/workspace', workspaceRoutes);
app.use('/api/ci', ciRoutes);
app.use("/api/admin", adminRoutes);

// Alias: POST /api/analyze-code (spec-compatible path)
app.post('/api/analyze-code', async (req, res) => {
  console.log('📥 Received /api/analyze-code request');
  console.log('   Body keys:', Object.keys(req.body || {}));
  console.log('   Has code:', Boolean(req.body?.code));
  console.log('   Has mode:', Boolean(req.body?.mode));
  
  try {
    const { code, mode } = req.body;
    if (!code || !String(code).trim()) {
      return res.status(400).json({ message: 'Missing code in request' });
    }
    
    const normalizedMode = normalizeMode(mode);
    console.log('🔍 Analyzing code with mode:', normalizedMode);
    
    const aiResult = await analyzeContent(code, normalizedMode);
    
    console.log('✅ Analysis complete, degraded:', aiResult.degraded);
    
    // Try to save to history (non-blocking)
    try {
      await History.create({
        userId: req.user?.id || req.user?._id || 'guest',
        action: 'analysis',
        data: { 
          input: code, 
          mode: normalizedMode, 
          result: aiResult 
        },
      });
    } catch (e) {
      console.warn('Could not save history:', e.message);
    }
    
    return res.status(200).json({
      correctedCode: aiResult.correctedCode || '',
      explanation: aiResult.explanation || '',
      modeOutput: aiResult.modeOutput || '',
      errors: Array.isArray(aiResult.errors) ? aiResult.errors : [],
      suggestions: aiResult.suggestions || [],
      questions: aiResult.questions || [],
      mode: normalizedMode,
      degraded: Boolean(aiResult.degraded),
    });
  } catch (err) {
    console.error('❌ Analyze-code error:', err);
    return res.status(500).json({ message: err.message || 'AI analysis failed' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'DevInspectAI API',
    version: '1.0.0',
  });
});

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({
    message: `Route ${req.method} ${req.path} not found`,
    availableRoutes: [
      '/api/auth/register',
      '/api/auth/login',
      '/api/analysis',
      '/api/analyze-code',
      '/api/ai/analyze-code',
      '/api/ai/health',
      '/api/review/analyze',
      '/api/user/profile',
      '/api/workspace',
      '/api/test/hello',
    ],
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

export default app;