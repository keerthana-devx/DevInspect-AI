import React, { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, X, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { API_ORIGIN } from '@/lib/apiConfig';

const AI_ACTIONS = [
  { value: 'explain',    label: '📖 Explain line-by-line' },
  { value: 'optimize',   label: '⚡ Optimize performance' },
  { value: 'security',   label: '🔒 Detect security risks' },
  { value: 'tests',      label: '🧪 Generate unit tests' },
  { value: 'docs',       label: '📝 Generate documentation' },
  { value: 'complexity', label: '📊 Explain complexity' },
  { value: 'convert',    label: '🔄 Convert language' },
  { value: 'architecture', label: '🏗️ Architecture suggestions' },
];

const CONVERT_LANGS = ['javascript', 'python', 'java', 'cpp', 'typescript'];

/**
 * AIAssistantPanel — contextual AI helper injected below the result panel
 * Props: code, language
 */
const AIAssistantPanel = memo(({ code, language }) => {
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState('explain');
  const [targetLang, setTargetLang] = useState('python');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');

  const handleRun = async () => {
    if (!code?.trim()) return toast.error('No code to analyze');
    setLoading(true);
    setResponse('');
    try {
      const token = localStorage.getItem('devinspect-token');
      const prompt = buildPrompt(action, code, language, targetLang);
      const res = await fetch(`${API_ORIGIN}/api/chat/followup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: prompt, context: null }),
      });
      const data = await res.json();
      setResponse(data.reply || 'No response received.');
    } catch {
      toast.error('AI assistant unavailable');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-glass rounded-2xl border border-border/30 overflow-hidden">
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors">
        <div className="flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold">AI Assistant</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="px-4 pb-4 space-y-3 border-t border-border/20">
              <div className="flex gap-2 pt-3 flex-wrap">
                <Select value={action} onValueChange={setAction}>
                  <SelectTrigger className="h-8 text-xs input-premium flex-1 min-w-[160px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {AI_ACTIONS.map(a => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                {action === 'convert' && (
                  <Select value={targetLang} onValueChange={setTargetLang}>
                    <SelectTrigger className="h-8 text-xs input-premium w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CONVERT_LANGS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
                <Button onClick={handleRun} disabled={loading} size="sm" className="btn-primary h-8 text-xs px-4">
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Run'}
                </Button>
              </div>

              <AnimatePresence>
                {response && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="relative p-3 bg-muted/20 rounded-xl border border-border/20 text-xs text-foreground/90 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap">
                    <button onClick={() => setResponse('')} className="absolute top-2 right-2 text-muted-foreground hover:text-foreground">
                      <X className="w-3.5 h-3.5" />
                    </button>
                    {response}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

AIAssistantPanel.displayName = 'AIAssistantPanel';

// Build contextual prompt based on action
function buildPrompt(action, code, language, targetLang) {
  const lang = language || 'javascript';
  const prompts = {
    explain:      `Explain this ${lang} code line-by-line in simple terms:\n\`\`\`\n${code}\n\`\`\``,
    optimize:     `Suggest specific performance optimizations for this ${lang} code:\n\`\`\`\n${code}\n\`\`\``,
    security:     `List all security vulnerabilities in this ${lang} code with fixes:\n\`\`\`\n${code}\n\`\`\``,
    tests:        `Generate unit tests for this ${lang} code:\n\`\`\`\n${code}\n\`\`\``,
    docs:         `Generate JSDoc/docstring documentation for this ${lang} code:\n\`\`\`\n${code}\n\`\`\``,
    complexity:   `Analyze the time and space complexity of this ${lang} code:\n\`\`\`\n${code}\n\`\`\``,
    convert:      `Convert this ${lang} code to ${targetLang}. Return only the converted code:\n\`\`\`\n${code}\n\`\`\``,
    architecture: `Suggest architecture improvements for this ${lang} code:\n\`\`\`\n${code}\n\`\`\``,
  };
  return prompts[action] || prompts.explain;
}

export default AIAssistantPanel;
