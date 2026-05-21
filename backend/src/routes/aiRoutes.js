import express from "express";
import { analyzeContent } from "../services/aiService.js";
import  geminiService  from "../services/geminiService.js";
import History from "../models/History.js";

const router = express.Router();

const mapAnalyzeResponse = (aiResult) => ({
  correctedCode: aiResult.correctedCode || "",
  explanation: aiResult.explanation || "",
  modeOutput: aiResult.modeOutput || "",
  errors: Array.isArray(aiResult.errors) ? aiResult.errors : [],
  degraded: Boolean(aiResult.degraded),
});

const handleAnalyzeCode = async (req, res) => {
  try {
    const { code, mode } = req.body;

    if (!code || !String(code).trim()) {
      return res.status(400).json({ message: "Missing code in request" });
    }

    const aiResult = await analyzeContent(code, mode);

    try {
      await History.create({
        userId: req.user?.id || req.user?._id || "guest",
        action: "analysis",
        data: {
          input: code,
          mode: mode || "developer",
          result: aiResult,
        },
      });
    } catch (e) {
      console.warn("Could not save history:", e.message);
    }

    return res.status(200).json(mapAnalyzeResponse(aiResult));
  } catch (err) {
    console.error("analyze-code error:", err.message);
    return res.status(500).json({ message: err.message || "AI analysis failed" });
  }
};

router.post("/analyze", async (req, res) => {
  try {
    const { code, language } = req.body;
    const result = await analyzeContent(code, language);
    return res.status(200).json({ success: true, result });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/analyze-code", handleAnalyzeCode);

router.get("/health", async (_req, res) => {
  const hasOpenAI = Boolean(process.env.OPENAI_API_KEY?.trim());
  const hasGemini = Boolean(process.env.GEMINI_API_KEY?.trim());

  const gemini = {
    configured: hasGemini,
    models: hasGemini ? geminiService() : [],
  };

  return res.status(200).json({
    status: "ok",
    providers: {
      openai: hasOpenAI,
      gemini,
    },
    ready: hasOpenAI || hasGemini,
  });
});

export default router;
