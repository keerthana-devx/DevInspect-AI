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

  const response = await fetch(ANALYZE_CODE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, mode }),
  });

  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new AiServiceError(
      data.message || `Analysis failed (${response.status})`,
      response.status
    );
  }

  return {
    correctedCode: data.correctedCode ?? code,
    explanation: data.explanation ?? "",
    modeOutput: data.modeOutput ?? "",
    errors: Array.isArray(data.errors) ? data.errors : [],
    degraded: Boolean(data.degraded),
  };
};

export const checkAiHealth = async () => {
  const response = await fetch(AI_HEALTH_URL);
  if (!response.ok) {
    throw new Error("AI health check failed");
  }
  return response.json();
};
