import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Trash2,
  Download,
  Copy,
  FileJson,
} from 'lucide-react';

import {
  downloadTextFile,
  copyToClipboard,
  getCodeExtension,
} from '../lib/downloadFile';

import { useAuth } from '../contexts/AuthContext.jsx';

import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';

import { toast } from 'sonner';

import {
  saveReview,
  getReviews,
  deleteReview,
  clearAllReviews,
  normalizeMode,
} from '../lib/historyStorage';

import { analyzeCode, AiServiceError } from '../lib/aiService';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

const AnalyzerPage = () => {
  const { currentMode, currentUser } = useAuth();

  const username =
    currentUser?.name ||
    currentUser?.email ||
    'Guest User';

  /* =========================
      STATES
  ========================= */

  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [analysisMode, setAnalysisMode] = useState('student');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  /* =========================
      LOAD HISTORY
  ========================= */

  useEffect(() => {
    try {
      setHistory(getReviews());
    } catch (error) {
      console.error(error);
      setHistory([]);
    }
  }, []);

  useEffect(() => {
    if (currentMode) {
      setAnalysisMode(normalizeMode(currentMode));
    }
  }, [currentMode]);

  /* =========================
      RUN ANALYSIS
  ========================= */

  const handleRun = async () => {
    if (!code.trim()) {
      toast.error('Please paste code');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const mode = normalizeMode(analysisMode);

      const response = await analyzeCode({ code, mode });

      const payload = {
        input: code,
        language,
        prompt,
        mode,
        correctedCode: response?.correctedCode || '// No output',
        explanation: response?.explanation || 'No explanation',
        modeOutput: response?.modeOutput || '',
        errors: response?.errors || [],
        timestamp: new Date().toISOString(),
      };

      setResult(payload);
      saveReview(payload);
      setHistory(getReviews());

      if (response?.degraded) {
        toast.warning('Offline mode used (AI unavailable)');
      } else {
        toast.success('Analysis completed');
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.message || 'AI analysis failed');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
      HISTORY
  ========================= */

  const loadHistoryItem = (item) => {
    setCode(item.input || '');
    setLanguage(item.language || 'javascript');
    setPrompt(item.prompt || '');
    setResult(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteHistoryItem = (id) => {
    deleteReview(id);
    setHistory(getReviews());
    toast.success('Deleted');
  };

  const clearAllHistoryItems = () => {
    clearAllReviews();
    setHistory([]);
    toast.success('History cleared');
  };

  /* =========================
      ACTIONS
  ========================= */

  const handleCopyCode = async () => {
    if (!result?.correctedCode) return;
    await copyToClipboard(result.correctedCode);
    toast.success('Copied');
  };

  const handleDownloadCode = () => {
    if (!result?.correctedCode) return;
    const ext = getCodeExtension(language);
    downloadTextFile(result.correctedCode, `code.${ext}`);
  };

  const handleDownloadReport = () => {
    if (!result) return;
    downloadTextFile(JSON.stringify(result, null, 2), 'report.json');
  };

  return (
    <>
      <Helmet>
        <title>DevInspect AI</title>
      </Helmet>

      <div className="min-h-screen bg-[#070b14] text-white p-6">

        {/* HEADER */}
        <h1 className="text-4xl font-bold">DevInspect AI</h1>

        {/* INPUT */}
        <Textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Paste code..."
        />

        {/* BUTTON */}
        <Button onClick={handleRun} disabled={loading}>
          <Play className="w-4 h-4 mr-2" />
          {loading ? 'Analyzing...' : 'Run AI'}
        </Button>

        {/* OUTPUT */}
        <AnimatePresence>
          {result && (
            <motion.div>
              <pre>{result.correctedCode}</pre>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </>
  );
};

export default AnalyzerPage;