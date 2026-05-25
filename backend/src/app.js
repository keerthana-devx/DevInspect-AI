import express from 'express';
import cors from 'cors';
import session from 'express-session';
import rateLimit from 'express-rate-limit';
import passport from './config/passport.js';
import authRoutes      from './routes/authRoutes.js';
import analysisRoutes  from './routes/analysisRoutes.js';
import userRoutes      from './routes/userRoutes.js';
import workspaceRoutes from './routes/workspaceRoutes.js';
import adminRoutes     from './routes/adminRoutes.js';
import chatRoutes      from './routes/chatRoutes.js';
import reviewRoutes    from './routes/reviewRoutes.js';
import aiRoutes        from './routes/aiRoutes.js';
import testRoutes      from './routes/testRoutes.js';
import avatarRoutes    from './routes/avatarRoutes.js';
import shareRoutes     from './routes/shareRoutes.js';
import rulesRoutes     from './routes/rulesRoutes.js';
import extensionRoutes from './routes/extensionRoutes.js';
import ciRoutes        from './routes/ciRoutes.js';
import engagementRoutes  from './routes/engagementRoutes.js';
import uploadRoutes      from './routes/uploadRoutes.js';
import mascotRoutes      from './routes/mascotRoutes.js';
import interviewRoutes   from './routes/interviewRoutes.js';
import { protect }     from './middleware/authMiddleware.js';
import { isAdmin }     from './middleware/roleMiddleware.js';

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:5173').split(',');

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json({ limit: '2mb' }));

// Session required for Passport OAuth state verification (CSRF protection)
app.use(session({
  secret: process.env.JWT_SECRET || 'devinspect-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true, maxAge: 10 * 60 * 1000 }, // 10 min — only needed during OAuth handshake
}));
app.use(passport.initialize());
app.use(passport.session());

/* ─── Rate limiting ──────────────────────────────── */
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { message: 'Too many requests, please try again later.' } });
const analysisLimiter = rateLimit({ windowMs: 60 * 1000, max: 10, message: { message: 'Analysis rate limit exceeded. Please wait.' } });

/* ─── Public routes ──────────────────────────────── */
app.use('/api/auth',     authLimiter, authRoutes);
app.use('/api/review',   reviewRoutes);
app.use('/api/ai',       aiRoutes);
app.use('/api/test',     testRoutes);
app.use('/api/ci',          ciRoutes);
app.use('/api/upload-file', uploadRoutes);
app.use('/api/mascot',      mascotRoutes);
app.use('/api/interview',   interviewRoutes);

/* ─── Protected routes ───────────────────────────── */
app.use('/api/analysis',   analysisLimiter, analysisRoutes);
app.use('/api/user',       userRoutes);
app.use('/api/workspace',  workspaceRoutes);
app.use('/api/chat',       chatRoutes);
app.use('/api/avatar',     avatarRoutes);
app.use('/api/share',      shareRoutes);
app.use('/api/rules',      rulesRoutes);
app.use('/api/extension',  extensionRoutes);
app.use('/api/engagement', engagementRoutes);

/* ─── Admin routes (protect + isAdmin) ───────────── */
app.use('/api/admin', protect, isAdmin, adminRoutes);

/* ─── Health check ───────────────────────────────── */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    ready:  Boolean(process.env.GROQ_API_KEY),
    providers: {
      groq:   { configured: Boolean(process.env.GROQ_API_KEY) },
      gemini: { configured: Boolean(process.env.GEMINI_API_KEY) },
    },
  });
});

/* ─── 404 handler ────────────────────────────────── */
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.path} not found` });
});

/* ─── Error handler ──────────────────────────────── */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

export default app;
