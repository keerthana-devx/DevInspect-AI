import Analysis from '../models/Analysis.js';
import { analyzeContent, normalizeMode } from '../services/aiService.js';

/* ---------------- Normalize AI Result ---------------- */
const normalizeResult = (raw, code) => ({
  correctedCode: raw.correctedCode || code,
  explanation: raw.explanation || "",
  aiScore: raw.aiScore ?? 80,
  errors: raw.errors || [],
  suggestions: raw.suggestions || [],
  questions: raw.questions || [],
  modeOutput: raw.modeOutput || ""
});

/* ---------------- RUN ANALYSIS ---------------- */
export const runAnalysis = async (req, res) => {
  try {
    const { text, mode, language, workspaceId } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Code required" });
    }

    const finalMode = normalizeMode(mode);

    const raw = await analyzeContent(text, finalMode);
    const result = normalizeResult(raw, text);

    const saved = await Analysis.create({
      user: req.user._id,
      workspace: workspaceId,
      inputText: text,
      result,
      mode: finalMode,
      language: language || "javascript"
    });

    res.json({
      success: true,
      result,
      id: saved._id
    });

  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

/* ---------------- GET ALL ANALYSES ---------------- */
export const getAnalyses = async (req, res) => {
  try {
    const data = await Analysis.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.json(data);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

/* ---------------- DELETE ONE ---------------- */
export const deleteAnalysis = async (req, res) => {
  try {
    await Analysis.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

/* ---------------- CLEAR ALL (IMPORTANT FIX) ---------------- */
export const clearAllAnalyses = async (req, res) => {
  try {
    await Analysis.deleteMany({ user: req.user._id });
    res.json({ success: true, message: "All analyses cleared" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

/* ---------------- TOGGLE BOOKMARK ---------------- */
export const toggleBookmark = async (req, res) => {
  try {
    const analysis = await Analysis.findById(req.params.id);

    if (!analysis) {
      return res.status(404).json({ message: "Not found" });
    }

    analysis.bookmarked = !analysis.bookmarked;
    await analysis.save();

    res.json(analysis);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};