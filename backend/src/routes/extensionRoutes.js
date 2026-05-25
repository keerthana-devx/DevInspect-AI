import express        from 'express';
import crypto         from 'crypto';
import rateLimit      from 'express-rate-limit';
import { protect }   from '../middleware/authMiddleware.js';
import User          from '../models/User.js';
import Analysis      from '../models/Analysis.js';
import { analyzeContent } from '../services/aiService.js';

const router = express.Router();

/* ── Rate limiter: 30 analysis requests / 10 min per IP ── */
const analyzeLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  message: { success: false, message: 'Too many requests. Please wait before retrying.' },
});

/* ── Helper: resolve token from multiple header locations ── */
const resolveToken = (req) =>
  req.headers['x-extension-token'] ||
  req.headers['x-api-key']         ||
  req.headers['authorization']?.replace(/^Bearer\s+/i, '');

/* ── Helper: detect language from filename or content ── */
const detectLanguage = (filename = '', code = '') => {
  const ext = filename.split('.').pop()?.toLowerCase();
  const map = {
    js: 'javascript', ts: 'typescript', jsx: 'javascript', tsx: 'typescript',
    py: 'python', java: 'java', cpp: 'cpp', c: 'c', cs: 'csharp',
    go: 'go', rb: 'ruby', php: 'php', rs: 'rust', kt: 'kotlin',
    swift: 'swift', sql: 'sql', sh: 'bash', html: 'html', css: 'css',
  };
  if (map[ext]) return map[ext];
  if (code.includes('def ') && code.includes(':'))       return 'python';
  if (code.includes('public class') || code.includes('System.out')) return 'java';
  if (code.includes('func ') && code.includes('package')) return 'go';
  if (code.includes('fn ') && code.includes('let mut'))  return 'rust';
  return 'javascript';
};

/* ─────────────────────────────────────────────────────────
   POST /api/extension/token  — generate / regenerate token
───────────────────────────────────────────────────────── */
router.post('/token', protect, async (req, res) => {
  try {
    const token     = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
    await User.findByIdAndUpdate(req.user._id, {
      apiKey:           token,
      apiKeyExpiresAt:  expiresAt,
      apiKeyCreatedAt:  new Date(),
    });
    res.json({
      success:   true,
      token,
      expiresAt,
      hint: 'Paste this token into your VS Code settings.json as devinspectai.apiToken',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ─────────────────────────────────────────────────────────
   GET /api/extension/token  — fetch current token metadata
───────────────────────────────────────────────────────── */
router.get('/token', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('apiKey apiKeyExpiresAt apiKeyCreatedAt');
    if (!user.apiKey) return res.json({ success: true, token: null });
    const expired = user.apiKeyExpiresAt && new Date() > new Date(user.apiKeyExpiresAt);
    res.json({
      success:    true,
      token:      user.apiKey,
      expiresAt:  user.apiKeyExpiresAt || null,
      createdAt:  user.apiKeyCreatedAt || null,
      expired,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ─────────────────────────────────────────────────────────
   POST /api/extension/verify-token  — validate a token
───────────────────────────────────────────────────────── */
router.post('/verify-token', async (req, res) => {
  const token = resolveToken(req) || req.body?.token;
  if (!token) return res.status(401).json({ success: false, message: 'No token provided' });
  try {
    const user = await User.findOne({ apiKey: token }).select('name email apiKeyExpiresAt');
    if (!user) return res.status(401).json({ success: false, message: 'Invalid token' });
    if (user.apiKeyExpiresAt && new Date() > new Date(user.apiKeyExpiresAt)) {
      return res.status(401).json({ success: false, message: 'Token expired. Please regenerate.' });
    }
    res.json({
      success: true,
      user:    { name: user.name, email: user.email },
      message: `Connected as ${user.name}`,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ─────────────────────────────────────────────────────────
   POST /api/extension/analyze  — main analysis endpoint
   POST /api/vscode/analyze     — alias for settings.json URL
───────────────────────────────────────────────────────── */
const handleAnalyze = async (req, res) => {
  const token = resolveToken(req);
  if (!token) {
    return res.status(401).json({ success: false, message: 'Missing X-Extension-Token header' });
  }
  try {
    const user = await User.findOne({ apiKey: token }).select('_id name apiKeyExpiresAt customRules');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid extension token' });
    }
    if (user.apiKeyExpiresAt && new Date() > new Date(user.apiKeyExpiresAt)) {
      return res.status(401).json({ success: false, message: 'Token expired. Regenerate at DevInspectAI settings.' });
    }

    const {
      code,
      mode       = 'developer',
      language,
      filename   = '',
      context    = '',
    } = req.body;

    if (!code?.trim()) {
      return res.status(400).json({ success: false, message: 'code field is required' });
    }
    if (code.length > 50000) {
      return res.status(400).json({ success: false, message: 'Code exceeds 50,000 character limit' });
    }

    const detectedLang = language || detectLanguage(filename, code);
    const customRules  = Array.isArray(user.customRules) ? user.customRules : [];

    const raw    = await analyzeContent(code, mode, customRules, context);
    const aiScore = (() => {
      if (mode === 'interviewer' && raw.score > 0) return raw.score;
      if (mode === 'student'    && raw.codeScore > 0) return raw.codeScore;
      let s = 100;
      (raw.errors || []).forEach(e => {
        const sev = String(e.severity || '').toLowerCase();
        if (sev.includes('critical')) s -= 25;
        else if (sev.includes('high')) s -= 15;
        else if (sev.includes('medium')) s -= 8;
        else s -= 3;
      });
      return Math.max(0, Math.min(100, s));
    })();

    // Persist to Analysis collection so it appears in history
    await Analysis.create({
      user:      user._id,
      inputText: code,
      result:    raw,
      mode,
      language:  detectedLang,
    }).catch(() => {/* non-fatal */});

    res.json({
      success:  true,
      result:   raw,
      aiScore,
      mode,
      language: detectedLang,
      filename,
      analyzedBy: user.name,
    });
  } catch (err) {
    console.error('Extension analyze error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

router.post('/analyze',  analyzeLimiter, handleAnalyze);

/* ─────────────────────────────────────────────────────────
   POST /api/extension/webhook  — CI/CD webhook callback
───────────────────────────────────────────────────────── */
router.post('/webhook', analyzeLimiter, async (req, res) => {
  const token = resolveToken(req);
  if (!token) return res.status(401).json({ success: false, message: 'Missing token' });
  try {
    const user = await User.findOne({ apiKey: token }).select('_id name apiKeyExpiresAt customRules');
    if (!user) return res.status(401).json({ success: false, message: 'Invalid token' });
    if (user.apiKeyExpiresAt && new Date() > new Date(user.apiKeyExpiresAt)) {
      return res.status(401).json({ success: false, message: 'Token expired' });
    }

    const { code, mode = 'developer', language = 'javascript', callbackUrl } = req.body;
    if (!code?.trim()) return res.status(400).json({ success: false, message: 'code is required' });

    const raw     = await analyzeContent(code, mode, user.customRules || []);
    const aiScore = (() => {
      let s = 100;
      (raw.errors || []).forEach(e => {
        const sev = String(e.severity || '').toLowerCase();
        if (sev.includes('critical')) s -= 25;
        else if (sev.includes('high')) s -= 15;
        else if (sev.includes('medium')) s -= 8;
        else s -= 3;
      });
      return Math.max(0, Math.min(100, s));
    })();

    await Analysis.create({ user: user._id, inputText: code, result: raw, mode, language }).catch(() => {});

    const payload = { success: true, result: raw, aiScore, mode, language, timestamp: new Date().toISOString() };

    // Fire-and-forget callback if provided
    if (callbackUrl) {
      import('axios').then(({ default: axios }) =>
        axios.post(callbackUrl, payload, { timeout: 10000 }).catch(() => {})
      );
    }

    res.json(payload);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ─────────────────────────────────────────────────────────
   GET /api/extension/status  — health + connection check
───────────────────────────────────────────────────────── */
router.get('/status', (req, res) => {
  res.json({
    success: true,
    service: 'DevInspectAI VS Code Extension API',
    version: '2.0.0',
    status:  'online',
    aiReady: Boolean(process.env.OPENROUTER_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

export default router;
