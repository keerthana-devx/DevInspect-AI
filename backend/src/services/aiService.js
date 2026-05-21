import axios from "axios";

/* ================================
   MODE NORMALIZER (STRICT FIX)
================================ */
export const normalizeMode = (mode) => {
  const lower = String(mode || "").toLowerCase().trim();

  if (lower.includes("student")) return "student";
  if (lower.includes("interview")) return "interviewer";
  return "developer";
};

/* ================================
   PROMPT BUILDER (FIXED + STRICT)
================================ */
const buildPrompt = (code, mode) => {
  const baseRules = `
You are DevInspectAI, a production SaaS AI system.

CRITICAL RULES:
- Return ONLY valid JSON
- NO markdown
- NO explanations outside JSON
- MUST follow schema exactly
`;

  if (mode === "student") {
    return `
${baseRules}

MODE: STUDENT

Return JSON:
{
  "correctedCode": "",
  "explanation": "",
  "mistakes": [],
  "steps": [],
  "tips": [],
  "questions": [],
  "modeOutput": ""
}

CODE:
${code}
`;
  }

  if (mode === "interviewer") {
    return `
${baseRules}

MODE: INTERVIEWER

TASK:
Generate interview questions like FAANG interviewer.

STRICT REQUIREMENTS:
- MUST generate 5 to 8 questions
- Each question must have answer
- Include difficulty (easy/medium/hard)

Return JSON:
{
  "questions": [
    {
      "question": "",
      "answer": "",
      "difficulty": ""
    }
  ],
  "modeOutput": ""
}

CODE:
${code}
`;
  }

  return `
${baseRules}

MODE: DEVELOPER

TASK:
Fix and review code like senior engineer.

Return JSON:
{
  "correctedCode": "",
  "explanation": "",
  "errors": [],
  "suggestions": [],
  "tips": [],
  "modeOutput": ""
}

CODE:
${code}
`;
};

/* ================================
   SAFE JSON PARSER (IMPORTANT FIX)
================================ */
const extractJSON = (text) => {
  try {
    if (!text) return null;

    const clean = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const start = clean.indexOf("{");
    const end = clean.lastIndexOf("}");

    if (start === -1 || end === -1) return null;

    return JSON.parse(clean.slice(start, end + 1));
  } catch (err) {
    console.log("JSON parse error:", err.message);
    return null;
  }
};

/* ================================
   OPENROUTER CALL (SAFE FIX)
================================ */
const callOpenRouter = async (prompt) => {
  try {
    const res = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Return ONLY valid JSON. No text."
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.2
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const content = res.data?.choices?.[0]?.message?.content;
    return extractJSON(content);
  } catch (err) {
    console.log("OpenRouter Error:", err.message);
    return null;
  }
};

/* ================================
   FALLBACK (FIXED)
================================ */
const fallback = (code, mode) => ({
  correctedCode: code,
  explanation: "AI fallback mode active",
  errors: [],
  suggestions: [],
  tips: [],
  steps: [],
  mistakes: [],
  questions:
    mode === "interviewer"
      ? Array.from({ length: 5 }).map((_, i) => ({
          question: `Interview question ${i + 1}`,
          answer: "Manual answer required",
          difficulty: "medium"
        }))
      : [],
  modeOutput: "Fallback response",
  degraded: true
});

/* ================================
   MAIN FUNCTION (FINAL FIX)
================================ */
export const analyzeContent = async (code, mode) => {
  const finalMode = normalizeMode(mode);

  if (!process.env.OPENROUTER_API_KEY) {
    return fallback(code, finalMode);
  }

  const prompt = buildPrompt(code, finalMode);
  const ai = await callOpenRouter(prompt);

  if (!ai) return fallback(code, finalMode);

  // FORCE interviewer question safety
  let questions = Array.isArray(ai.questions) ? ai.questions : [];

  if (finalMode === "interviewer") {
    if (questions.length < 5) {
      questions = fallback(code, finalMode).questions;
    }
  }

  return {
    correctedCode: ai.correctedCode || code,
    explanation: ai.explanation || "",
    errors: Array.isArray(ai.errors) ? ai.errors : [],
    suggestions: Array.isArray(ai.suggestions) ? ai.suggestions : [],
    tips: Array.isArray(ai.tips) ? ai.tips : [],
    steps: Array.isArray(ai.steps) ? ai.steps : [],
    mistakes: Array.isArray(ai.mistakes) ? ai.mistakes : [],
    questions,
    modeOutput: ai.modeOutput || "",
    degraded: false
  };
};