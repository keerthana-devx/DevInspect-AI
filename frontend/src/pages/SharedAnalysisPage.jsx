import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import { API_ORIGIN } from '@/lib/apiConfig';

const SharedAnalysisPage = () => {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShared = async () => {
      try {
        const res = await fetch(`${API_ORIGIN}/api/share/${token}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || 'Not found');
        setData(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchShared();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground animate-pulse">Loading shared analysis...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <AlertTriangle className="w-12 h-12 text-destructive" />
        <p className="text-lg font-bold">{error}</p>
        <Link to="/" className="text-primary underline text-sm">Go to DevInspectAI</Link>
      </div>
    );
  }

  const r = data.result || {};
  const errors = Array.isArray(r.errors) ? r.errors : [];

  return (
    <div className="min-h-screen bg-background text-foreground p-6 lg:p-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl gradient-brand flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gradient">Shared Code Review</h1>
              <p className="text-xs text-muted-foreground capitalize">
                Mode: {data.mode} · Language: {data.language} · {new Date(data.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <Link to="/" className="flex items-center gap-1.5 text-xs text-primary hover:underline">
            <ExternalLink className="w-3.5 h-3.5" /> Open DevInspectAI
          </Link>
        </motion.div>

        {/* Explanation */}
        {r.explanation && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            className="card-glass p-6 rounded-2xl border border-border/30 mb-6">
            <h2 className="font-bold text-lg mb-3">Summary</h2>
            <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line">{r.explanation}</p>
          </motion.div>
        )}

        {/* Errors */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="card-glass p-6 rounded-2xl border border-border/30 mb-6">
          <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" /> Findings ({errors.length})
          </h2>
          {errors.length === 0 ? (
            <div className="flex items-center gap-2 text-green-500 text-sm">
              <CheckCircle className="w-4 h-4" /> No issues found
            </div>
          ) : (
            <div className="space-y-3">
              {errors.map((e, i) => (
                <div key={i} className="p-3 bg-muted/30 rounded-xl border border-border/30 text-xs">
                  <div className="flex justify-between mb-1">
                    <span className="font-bold text-destructive capitalize">{e.severity}</span>
                    <span className="text-muted-foreground">{e.category} · Line {e.line || 'N/A'}</span>
                  </div>
                  <p>{e.message}</p>
                  {e.fix && <p className="text-green-500 mt-1">Fix: {e.fix}</p>}
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Corrected Code */}
        {r.correctedCode && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="card-glass p-6 rounded-2xl border border-border/30">
            <h2 className="font-bold text-lg mb-3">Suggested Fix</h2>
            <pre className="font-mono text-xs text-green-400 bg-muted/20 p-4 rounded-xl overflow-x-auto whitespace-pre-wrap">
              {r.correctedCode}
            </pre>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SharedAnalysisPage;
