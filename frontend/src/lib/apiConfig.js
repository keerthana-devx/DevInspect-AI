/**
 * API Configuration for DevInspectAI
 */
const trimSlash = (value) => String(value || "").replace(/\/+$/, "");

// API Origin - configurable via environment variable
export const API_ORIGIN = trimSlash(
  import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:5000"
);

// Authentication Endpoints
export const AUTH_LOGIN_URL    = `${API_ORIGIN}/api/auth/login`;
export const AUTH_REGISTER_URL = `${API_ORIGIN}/api/auth/register`;
export const AUTH_GOOGLE_URL   = `${API_ORIGIN}/api/auth/google`;
export const AUTH_GITHUB_URL   = `${API_ORIGIN}/api/auth/github`;

// User Endpoints
export const USER_PROFILE_URL = `${API_ORIGIN}/api/user/profile`;
export const AVATAR_URL       = `${API_ORIGIN}/api/avatar`;
export const RULES_URL        = `${API_ORIGIN}/api/rules`;

// Analysis Endpoints
export const ANALYZE_CODE_URL = `${API_ORIGIN}/api/analyze-code`;
export const AI_ANALYZE_URL = `${API_ORIGIN}/api/ai/analyze-code`;

// AI Service Endpoints
export const AI_HEALTH_URL = `${API_ORIGIN}/api/ai/health`;

// Workspace Endpoints
export const WORKSPACE_URL = `${API_ORIGIN}/api/workspace`;

// Analysis History Endpoints
export const ANALYSIS_URL = `${API_ORIGIN}/api/analysis`;

// Extension Endpoints
export const EXTENSION_URL = `${API_ORIGIN}/api/extension`;

// Share Endpoints
export const SHARE_URL = `${API_ORIGIN}/api/share`;

// Mascot Endpoints (Amazon Bedrock / Titan Image Generator)
export const MASCOT_URL = `${API_ORIGIN}/api/mascot`;

/**
 * Create fetch options with auth headers
 */
export const createAuthOptions = (method = 'GET', body = null) => {
  const token = localStorage.getItem('devinspect-token');
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }
  
  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }
  
  return options;
};