import axios from "axios";
import geminiService from "./geminiService.js";

/* ================================
   PROMPT BUILDER (FINAL FIX)
================================ */
const buildPrompt = (code, mode) => {
  const base = `
You are a STRICT AI CODE ANALYZER.

YOU MUST RETURN ONLY VALID JSON.

FORMAT:
{
  "correctedCode": "",
  "explanation": "",
  "modeOutput": "",
  "errors": []
}

NO extra text. NO markdown. NO paragraphs outside JSON.
`;

  const m = (mode || "developer").toLowerCase();

  if (m === "student") {
    return `
${base}

MODE: STUDENT

- Fix the code
- Explain simply
- List mistakes clearly in errors array

CODE:
${code}
`;
  }

  if (m === "interviewer" || m === "interview") {
    return `
${base}

MODE: INTERVIEWER

IMPORTANT RULES:
- correctedCode MUST be ""
- explanation = 1 line only

modeOutput MUST be EXACT:

INTERVIEW QUESTIONS:
1. ...
2. ...
3. ...
4. ...
5. ...

EXPECTED ANSWERS:
1. ...
2. ...
3. ...
4. ...
5. ...

FOLLOW-UP QUESTIONS:
- ...
- ...

EDGE CASES:
- ...
- ...

CODE:
${code}
`;
  }

  return `
${base}

MODE: DEVELOPER

modeOutput MUST include:

BUGS:
- list issues

IMPROVEMENTS:
- performance
- security
- clean code

TOOLS:
- React Query
- Redux Toolkit / Zustand
- Docker
- Redis
- CI/CD (GitHub Actions)
- Jest / Cypress
- Pino/Winston logging

ARCHITECTURE:
- how to scale system

CODE:
${code}
`;
};

/* ================================
   GEMINI CALL
================================ */
const analyzeWithGemini = async (prompt) => {
  const text = await geminiService(prompt);
  return JSON.parse(text);
};

/* ================================
   OPENAI CALL (optional fallback)
================================ */
const analyzeWithOpenAI = async (prompt) => {
  const resp = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: "Return ONLY JSON." },
        { role: "user", content: prompt },
      ],
      temperature: 0,
      response_format: { type: "json_object" },
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  return JSON.parse(resp.data.choices[0].message.content);
};

/* ================================
   MAIN FUNCTION
================================ */
export const analyzeContent = async (code, mode) => {
  if (!code?.trim()) throw new Error("Code is required");

  const prompt = buildPrompt(code, mode);

  try {
    if (process.env.OPENAI_API_KEY) {
      return await analyzeWithOpenAI(prompt);
    }

    if (process.env.GEMINI_API_KEY) {
      return await analyzeWithGemini(prompt);
    }

    return {
      correctedCode: code,
      explanation: "No AI key found",
      modeOutput: "Offline mode",
      errors: ["No API keys"],
    };
  } catch (err) {
    return {
      correctedCode: code,
      explanation: "AI failed",
      modeOutput: "Fallback mode",
      errors: [err.message],
    };
  }
};