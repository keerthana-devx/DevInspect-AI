const trimSlash = (value) => String(value || "").replace(/\/+$/, "");

export const API_ORIGIN = trimSlash(
  import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:5000"
);

export const ANALYZE_CODE_URL = `${API_ORIGIN}/api/ai/analyze-code`;
export const AI_HEALTH_URL = `${API_ORIGIN}/api/ai/health`;
export const AUTH_LOGIN_URL = `${API_ORIGIN}/api/auth/login`;
export const AUTH_REGISTER_URL = `${API_ORIGIN}/api/auth/register`;
