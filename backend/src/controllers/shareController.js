import Analysis from '../models/Analysis.js';
import ShareToken from '../models/ShareToken.js';

/* POST /api/share — create share link for an analysis */
export const createShareLink = async (req, res) => {
  try {
    const { analysisId } = req.body;
    if (!analysisId) return res.status(400).json({ message: 'analysisId required' });

    const analysis = await Analysis.findOne({ _id: analysisId, user: req.user._id });
    if (!analysis) return res.status(404).json({ message: 'Analysis not found' });

    // Reuse existing token if present
    let share = await ShareToken.findOne({ analysis: analysisId, owner: req.user._id });
    if (!share) {
      share = await ShareToken.create({ analysis: analysisId, owner: req.user._id });
    }

    res.json({ token: share.token, shareUrl: `/shared/${share.token}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* GET /api/share/:token — public view-only access */
export const getSharedAnalysis = async (req, res) => {
  try {
    const share = await ShareToken.findOne({ token: req.params.token }).populate('analysis');
    if (!share) return res.status(404).json({ message: 'Share link not found or expired' });
    if (share.expiresAt < new Date()) return res.status(410).json({ message: 'Share link has expired' });
    if (!share.isPublic) return res.status(403).json({ message: 'This link is private' });

    const a = share.analysis;
    res.json({
      mode:         a.mode,
      language:     a.language,
      result:       a.result,
      createdAt:    a.createdAt,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
