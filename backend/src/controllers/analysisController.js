import Analysis from '../models/Analysis.js';
import User from '../models/User.js';
import { analyzeContent, normalizeMode } from '../services/aiService.js';
import { updateStreak } from '../services/streakService.js';
import { getEnabledRuleTexts } from './rulesController.js';
import EngagementService from '../services/engagementService.js';

/* ─── Normalize raw AI result to full schema ─────── */
const normalizeResult = (raw, code) => ({
  correctedCode:          raw.correctedCode || code,
  explanation:            raw.explanation   || '',
  errors:                 Array.isArray(raw.errors)      ? raw.errors      : [],
  suggestions:            Array.isArray(raw.suggestions) ? raw.suggestions : [],
  questions:              Array.isArray(raw.questions)   ? raw.questions   : [],
  mistakes:               Array.isArray(raw.mistakes)    ? raw.mistakes    : [],
  steps:                  Array.isArray(raw.steps)       ? raw.steps       : [],
  tips:                   Array.isArray(raw.tips)        ? raw.tips        : [],
  modeOutput:             raw.modeOutput || '',
  degraded:               Boolean(raw.degraded),
  isCorrect:              typeof raw.isCorrect === 'boolean' ? raw.isCorrect : false,
  // Interviewer-specific
  verdict:                raw.verdict   || (raw.isCorrect ? 'PASS' : 'FAIL'),
  score:                  typeof raw.score === 'number' ? raw.score : 0,
  timeComplexity:         raw.timeComplexity         || '',
  spaceComplexity:        raw.spaceComplexity        || '',
  optimizationSuggestion: raw.optimizationSuggestion || '',
  commonMistakes:         Array.isArray(raw.commonMistakes)  ? raw.commonMistakes  : [],
  strengths:              Array.isArray(raw.strengths)       ? raw.strengths       : [],
  weaknesses:             Array.isArray(raw.weaknesses)      ? raw.weaknesses      : [],
  missedEdgeCases:        Array.isArray(raw.missedEdgeCases) ? raw.missedEdgeCases : [],
  interviewerRemark:      raw.interviewerRemark || '',
  // Developer-specific
  productionReady:        typeof raw.productionReady === 'boolean' ? raw.productionReady : false,
  securityIssues:         Array.isArray(raw.securityIssues)    ? raw.securityIssues    : [],
  performanceIssues:      Array.isArray(raw.performanceIssues) ? raw.performanceIssues : [],
  designPatterns:         Array.isArray(raw.designPatterns)    ? raw.designPatterns    : [],
  // Student-specific
  codeScore:              typeof raw.codeScore === 'number' ? raw.codeScore : 0,
  conceptsToLearn:        Array.isArray(raw.conceptsToLearn) ? raw.conceptsToLearn : [],
});

/* ─── Compute AI score (mode-aware) ──────────────── */
const computeScore = (result, mode) => {
  // Interviewer: use AI-provided score
  if (mode === 'interviewer' && result.score > 0) return result.score;
  // Student: use codeScore
  if (mode === 'student' && result.codeScore > 0) return result.codeScore;
  // Developer: deduct from errors
  let score = 100;
  (result.errors || []).forEach(e => {
    const sev = String(e.severity || '').toLowerCase();
    if (sev.includes('critical')) score -= 25;
    else if (sev.includes('high')) score -= 15;
    else if (sev.includes('medium')) score -= 8;
    else score -= 3;
  });
  return Math.max(0, Math.min(100, score));
};

/* ─── POST /api/analysis ──────────────────────────── */
export const runAnalysis = async (req, res) => {
  try {
    const { text, mode, language, workspaceId, context, explanationLevel } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({ message: 'Code text is required' });
    }

    const finalMode = normalizeMode(mode);
    const finalLang = language || 'javascript';

    const customRules = await getEnabledRuleTexts(req.user._id);

    // Build enhanced context
    let enhancedContext = context || '';
    if (finalMode === 'student' && explanationLevel) {
      const levelMap = {
        easy:   'EXPLANATION LEVEL: EASY — Use very simple language, avoid jargon, explain every concept like a beginner.',
        medium: 'EXPLANATION LEVEL: MEDIUM — Use moderate technical detail with clear explanations.',
        hard:   'EXPLANATION LEVEL: HARD — Use advanced technical depth, Big-O analysis, design patterns, architecture.',
      };
      enhancedContext = levelMap[explanationLevel] || enhancedContext;
    }

    const raw = await analyzeContent(text, finalMode, customRules, enhancedContext);
    const result = normalizeResult(raw, text);
    const aiScore = computeScore(result, finalMode);

    const saved = await Analysis.create({
      user:      req.user._id,
      workspace: workspaceId || undefined,
      inputText: text,
      result,
      mode:      finalMode,
      language:  finalLang,
    });

    const userDoc = await User.findById(req.user._id);
    const streakData = userDoc ? await updateStreak(userDoc) : null;

    const engagementUpdate = await EngagementService.updateUserStats(req.user._id, {
      aiScore,
      errors: result.errors,
      input: text,
      mode: finalMode,
      language: finalLang,
    });

    res.status(201).json({
      success:   true,
      _id:       saved._id,
      result,
      aiScore,
      mode:      finalMode,
      language:  finalLang,
      createdAt: saved.createdAt,
      streak:    streakData,
      engagement: engagementUpdate,
    });
  } catch (err) {
    console.error('Analysis error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* ─── GET /api/analysis ───────────────────────────── */
export const getAnalyses = async (req, res) => {
  try {
    const data = await Analysis.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .lean();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─── DELETE /api/analysis/:id ────────────────────── */
export const deleteAnalysis = async (req, res) => {
  try {
    await Analysis.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─── DELETE /api/analysis (clear all) ───────────── */
export const clearAllAnalyses = async (req, res) => {
  try {
    const r = await Analysis.deleteMany({ user: req.user._id });
    res.json({ success: true, deletedCount: r.deletedCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─── PUT /api/analysis/:id/bookmark ─────────────── */
export const toggleBookmark = async (req, res) => {
  try {
    const analysis = await Analysis.findOne({ _id: req.params.id, user: req.user._id });
    if (!analysis) return res.status(404).json({ message: 'Not found' });
    analysis.isBookmarked = !analysis.isBookmarked;
    await analysis.save();
    res.json({ isBookmarked: analysis.isBookmarked, _id: analysis._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
