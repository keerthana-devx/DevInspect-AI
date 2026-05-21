import Analysis from "../models/Analysis.js";
import User from "../models/User.js";
import { analyzeContent, normalizeMode } from "../services/aiService.js";

/* =========================
   RUN ANALYSIS (FIXED SaaS LOGIC)
========================= */
export const runAnalysis = async (req, res) => {
  const { text, mode, language, workspaceId } = req.body;

  try {
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Code is required" });
    }

    const user = await User.findById(req.user._id);

    const finalMode = normalizeMode(
      mode || user?.currentMode || "developer"
    );

    const aiResponse = await analyzeContent(text, finalMode);

    /* =========================
       MODE-BASED OUTPUT FIX
    ========================= */

    let result = {
      correctedCode: aiResponse?.correctedCode || text,
      explanation: "",
      modeOutput: "",
      errors: Array.isArray(aiResponse?.errors) ? aiResponse.errors : [],
      suggestions: Array.isArray(aiResponse?.suggestions) ? aiResponse.suggestions : [],
      questions: Array.isArray(aiResponse?.questions) ? aiResponse.questions : [],
      mode: finalMode,
      degraded: aiResponse?.degraded || false,
    };

    /* =========================
       MODE LOGIC (IMPORTANT FIX)
    ========================= */

    if (finalMode === "student") {
      result.explanation =
        aiResponse?.explanation ||
        "Step-by-step beginner explanation generated.";

      result.modeOutput = `
📘 Explanation:
${result.explanation}

💡 Corrected Code:
${result.correctedCode}
`;
    }

    else if (finalMode === "interviewer") {
      result.explanation = "Interview Mode Active";

      result.modeOutput =
        aiResponse?.questions
          ?.map((q, i) =>
            `${i + 1}. ${q.question}\nAnswer: ${q.answer}\nDifficulty: ${q.difficulty}`
          )
          .join("\n\n") || "No questions generated.";
    }

    else {
      result.explanation =
        aiResponse?.explanation || "Code review completed.";

      result.modeOutput =
        `🔍 Developer Analysis:\n${result.explanation}`;
    }

    const analysis = await Analysis.create({
      user: req.user._id,
      workspace: workspaceId || null,
      inputText: text,
      result,
      mode: finalMode,
      language: language || "javascript",
    });

    return res.status(201).json({
      _id: analysis._id,
      result,
      mode: finalMode,
      language: analysis.language,
      createdAt: analysis.createdAt,
    });

  } catch (err) {
    console.error("Run Analysis Error:", err);
    return res.status(500).json({
      message: "Analysis failed",
      error: err.message,
    });
  }
};

/* =========================
   GET ANALYSES
========================= */
export const getAnalyses = async (req, res) => {
  try {
    const analyses = await Analysis.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    return res.json(analyses);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/* =========================
   TOGGLE BOOKMARK
========================= */
export const toggleBookmark = async (req, res) => {
  try {
    const analysis = await Analysis.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!analysis) {
      return res.status(404).json({ message: "Not found" });
    }

    analysis.isBookmarked = !analysis.isBookmarked;
    await analysis.save();

    return res.json(analysis);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/* =========================
   DELETE ANALYSIS
========================= */
export const deleteAnalysis = async (req, res) => {
  try {
    await Analysis.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/* =========================
   CLEAR ALL ANALYSES (FIX IMPORT ERROR)
========================= */
export const clearAllAnalyses = async (req, res) => {
  try {
    await Analysis.deleteMany({ user: req.user._id });

    return res.json({
      success: true,
      message: "All analyses cleared successfully",
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to clear analyses",
      error: err.message,
    });
  }
};