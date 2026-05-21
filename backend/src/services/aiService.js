import axios from "axios";

/* =========================
   MODE NORMALIZATION
========================= */
export const normalizeMode = (mode) => {
  if (!mode) return "developer";

  const lower = String(mode).toLowerCase();

  if (lower.includes("student")) return "student";
  if (lower.includes("interview")) return "interviewer";

  return "developer";
};

/* =========================
   PROMPT BUILDER
========================= */
const buildPrompt = (code, mode) => {
  if (mode === "student") {
    return `
You are an expert programming teacher.

Return ONLY valid JSON.

OUTPUT FORMAT:
{
  "steps": [],
  "mistakes": [],
  "tips": [],
  "correctedCode": "",
  "explanation": ""
}

RULES:
- Explain step by step
- Very simple beginner explanation
- Must always fill steps, mistakes, tips

CODE:
${code}
`;
  }

  if (mode === "interviewer") {
    return `
You are a FAANG interviewer.

Return ONLY valid JSON.

OUTPUT FORMAT:
{
  "questions": [
    {
      "question": "",
      "answer": "",
      "difficulty": "easy|medium|hard"
    }
  ],
  "explanation": ""
}

RULES:
- Generate 8–10 questions
- Include answers
- Mix coding + theory + debugging

CODE:
${code}
`;
  }

  return `
You are a senior SaaS software engineer.

Return ONLY valid JSON.

OUTPUT FORMAT:
{
  "bugs": [],
  "securityIssues": [],
  "performanceIssues": [],
  "bestPractices": [],
  "correctedCode": "",
  "score": 0,
  "explanation": ""
}

RULES:
- Real production-level review
- Think like senior engineer at Google/Meta

CODE:
${code}
`;
};

/* =========================
   CLEAN JSON
========================= */
const extractJSON = (text) => {
  try {
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");

    if (start === -1 || end === -1) return null;

    return JSON.parse(text.slice(start, end + 1));
  } catch (err) {
    console.error("JSON parse error:", err.message);
    return null;
  }
};

/* =========================
   OPENROUTER CALL
========================= */
const callOpenRouter = async (prompt) => {
  const res = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model: process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Return ONLY valid JSON. No markdown. No explanation outside JSON.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.OPENROUTER_HTTP_REFERER || "http://localhost:5173",
      },
    }
  );

  const content = res.data.choices?.[0]?.message?.content;
  if (!content) return null;

  return extractJSON(content);
};

/* =========================
   FALLBACK
========================= */
const fallback = (code, mode) => ({
  correctedCode: code,
  explanation: "AI service unavailable.",
  steps: [],
  mistakes: [],
  tips: [],
  questions: [],
  bugs: [],
  securityIssues: [],
  performanceIssues: [],
  bestPractices: [],
  score: 0,
  mode,
  degraded: true,
});

/* =========================
   MAIN FUNCTION
========================= */
export const analyzeContent = async (code, mode) => {
  const finalMode = normalizeMode(mode);

  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return fallback(code, finalMode);
    }

    const prompt = buildPrompt(code, finalMode);
    const ai = await callOpenRouter(prompt);

    if (!ai) return fallback(code, finalMode);

    return {
      correctedCode: ai.correctedCode || code,

      explanation: ai.explanation || "No explanation generated.",

      steps: ai.steps || [],
      mistakes: ai.mistakes || [],
      tips: ai.tips || [],

      questions: ai.questions || [],

      bugs: ai.bugs || [],
      securityIssues: ai.securityIssues || [],
      performanceIssues: ai.performanceIssues || [],
      bestPractices: ai.bestPractices || [],

      score: ai.score || 0,

      mode: finalMode,
      degraded: false,
    };
  } catch (err) {
    console.error("AI ERROR:", err.message);
    return fallback(code, finalMode);
  }
};