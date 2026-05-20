import { GoogleGenerativeAI } from "@google/generative-ai";

const geminiService = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY missing");
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    generationConfig: {
      temperature: 0,
      maxOutputTokens: 2048,
    },
  });

  const result = await model.generateContent(prompt);
  let text = result?.response?.text?.();

  if (!text) {
    throw new Error("Empty Gemini response");
  }

  /* ================================
     🔥 CLEAN RESPONSE (IMPORTANT FIX)
  ================================= */
  text = text.trim();

  // remove ```json or ``` blocks if Gemini adds them
  text = text.replace(/```json/g, "").replace(/```/g, "").trim();

  return text;
};

export default geminiService;