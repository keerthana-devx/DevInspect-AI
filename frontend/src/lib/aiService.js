import { ANALYZE_CODE_URL, AI_HEALTH_URL } from "@/lib/apiConfig";

export class AiServiceError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "AiServiceError";
    this.status = status;
  }
}

export const analyzeCode = async ({ code, mode }) => {
  if (!code?.trim()) {
    throw new AiServiceError("Code is required", 400);
  }

  const res = await fetch(ANALYZE_CODE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code, mode }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new AiServiceError(
      data.message || "Analysis failed",
      res.status
    );
  }

  return {
    correctedCode: data.correctedCode || code,
    explanation: data.explanation || "",
    modeOutput: data.modeOutput || "",
    errors: data.errors || [],
    degraded: data.degraded || false,
  };
};

export const checkAiHealth = async () => {
  const res = await fetch(AI_HEALTH_URL);
  if (!res.ok) throw new Error("AI health failed");
  return res.json();
};