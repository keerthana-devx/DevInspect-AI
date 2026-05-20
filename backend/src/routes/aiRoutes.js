import express from "express";
import analyzeCode from "../services/aiService.js";

const router = express.Router();

router.post("/analyze", async (req, res) => {
  try {
    const { code, language } = req.body;

    const result = await analyzeCode(code, language);

    return res.status(200).json({
      success: true,
      result: result
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

export default router;