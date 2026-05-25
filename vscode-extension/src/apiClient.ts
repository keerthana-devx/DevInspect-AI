import axios, { AxiosError } from 'axios';

export interface AnalyzeOptions {
  token:    string;
  apiUrl:   string;
  code:     string;
  mode:     string;
  filename: string;
  context?: string;
}

export interface AnalyzeResponse {
  success:    boolean;
  result:     any;
  aiScore:    number;
  mode:       string;
  language:   string;
  filename:   string;
  analyzedBy: string;
}

export async function analyzeCode(opts: AnalyzeOptions): Promise<AnalyzeResponse> {
  const { token, apiUrl, code, mode, filename, context = '' } = opts;

  try {
    const res = await axios.post<AnalyzeResponse>(
      `${apiUrl}/api/extension/analyze`,
      { code, mode, filename, context },
      {
        headers: {
          'Content-Type':      'application/json',
          'X-Extension-Token': token,
        },
        timeout: 60000,
      }
    );
    return res.data;
  } catch (err) {
    const axErr = err as AxiosError<{ message?: string }>;
    const status = axErr.response?.status;
    const msg    = axErr.response?.data?.message;

    if (status === 401) throw new Error(msg || 'Invalid or expired token. Regenerate at DevInspectAI settings.');
    if (status === 429) throw new Error('Rate limit exceeded. Please wait before retrying.');
    if (status === 400) throw new Error(msg || 'Invalid request. Check your code input.');
    if (axErr.code === 'ECONNREFUSED') throw new Error(`Cannot connect to ${apiUrl}. Is the backend running?`);
    if (axErr.code === 'ETIMEDOUT' || axErr.code === 'ECONNABORTED') throw new Error('Request timed out. The server took too long to respond.');

    throw new Error(msg || axErr.message || 'Analysis failed');
  }
}
