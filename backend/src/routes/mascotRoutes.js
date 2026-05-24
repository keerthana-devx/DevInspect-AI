import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  generateMascotImage,
  getCachedMascot,
  clearMascotCache,
  getMascotTypes,
  MASCOT_PROMPTS,
} from '../services/mascotService.js';

const router = express.Router();

const isBedrockConfigured = () =>
  Boolean(
    process.env.AWS_REGION &&
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY
  );

// GET /api/mascot/types — list all mascot types + labels
router.get('/types', (req, res) => {
  const types = Object.entries(MASCOT_PROMPTS).map(([id, def]) => ({
    id,
    label: def.label,
    cached: Boolean(getCachedMascot(id)),
  }));
  res.json({ success: true, configured: isBedrockConfigured(), types });
});

// GET /api/mascot/:type — get one mascot (generate if not cached)
router.get('/:type', protect, async (req, res) => {
  const { type } = req.params;

  if (!MASCOT_PROMPTS[type]) {
    return res.status(404).json({ message: `Unknown mascot type: ${type}` });
  }

  // If Bedrock not configured, return null so frontend uses SVG fallback
  if (!isBedrockConfigured()) {
    return res.json({ success: true, dataUri: null, cached: false, type, fallback: true,
                      message: 'Mascot feature disabled (missing AWS credentials)' });
  }

  try {
    const result = await generateMascotImage(type);
    res.json({ success: true, ...result });
  } catch (err) {
    // Log only unexpected errors, not credential errors (already guarded above)
    if (!err.message?.includes('credentials')) {
      console.error(`Mascot generation failed [${type}]:`, err.message);
    }
    res.json({ success: true, dataUri: null, cached: false, type, fallback: true });
  }
});

// POST /api/mascot/generate-all — pre-generate all mascots (admin use)
router.post('/generate-all', protect, async (req, res) => {
  if (!isBedrockConfigured()) {
    return res.status(400).json({ message: 'AWS_REGION not configured' });
  }
  // Fire-and-forget — respond immediately
  res.json({ success: true, message: 'Generation started for all mascot types', types: getMascotTypes() });

  for (const type of getMascotTypes()) {
    try { await generateMascotImage(type); }
    catch (err) { console.warn(`Mascot [${type}] failed:`, err.message); }
  }
});

// DELETE /api/mascot/cache — clear cache
router.delete('/cache', protect, (req, res) => {
  clearMascotCache();
  res.json({ success: true, message: 'Mascot cache cleared' });
});

export default router;
