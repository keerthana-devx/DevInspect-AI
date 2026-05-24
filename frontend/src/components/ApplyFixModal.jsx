import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Check, X, Wand2, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

const ApplyFixModal = ({ isOpen, onClose, onApplyAll, onApplySelected, result }) => {
  const { t } = useTranslation();
  const [showDiff, setShowDiff] = useState(false);
  const [selectedErrors, setSelectedErrors] = useState([]);

  if (!isOpen || !result) return null;

  const errors = result.errors || [];

  const toggleError = (idx) =>
    setSelectedErrors(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);

  const handleApplyAll = () => { onApplyAll(); onClose(); };
  const handleApplySelected = () => {
    if (!selectedErrors.length) return;
    onApplySelected(selectedErrors.map(i => errors[i]));
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="card-glass w-full max-w-lg rounded-3xl border border-border/30 shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-border/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Wand2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{t('applyFix.title')}</h3>
                  <p className="text-xs text-muted-foreground">{t('applyFix.subtitle')}</p>
                </div>
              </div>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="flex items-start gap-3 p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-500 leading-relaxed">{t('applyFix.warning')}</p>
              </div>

              <button onClick={() => setShowDiff(v => !v)}
                className="flex items-center gap-2 text-xs font-bold text-primary hover:underline">
                {showDiff ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                {showDiff ? t('applyFix.hide') : t('applyFix.preview')} suggested code
              </button>

              {showDiff && (
                <pre className="font-mono text-xs text-green-400 bg-muted/20 p-4 rounded-xl overflow-x-auto max-h-48 whitespace-pre-wrap border border-border/20">
                  {result.correctedCode || '// No corrected code'}
                </pre>
              )}

              {errors.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      {t('applyFix.selectFixes')} ({selectedErrors.length} {t('applyFix.selected')})
                    </p>
                    <button onClick={() => setSelectedErrors(errors.map((_, i) => i))}
                      className="text-xs text-primary hover:underline font-semibold">
                      Select All
                    </button>
                  </div>
                  {errors.map((e, idx) => (
                    <label key={idx} className="flex items-start gap-3 p-3 bg-muted/30 rounded-xl border border-border/20 cursor-pointer hover:bg-muted/50 transition-colors">
                      <input type="checkbox" checked={selectedErrors.includes(idx)}
                        onChange={() => toggleError(idx)} className="mt-0.5 accent-primary" />
                      <div className="text-xs">
                        <span className="font-semibold text-destructive capitalize">{e.severity}</span>
                        <span className="text-muted-foreground mx-1">·</span>
                        <span>{e.message}</span>
                        {e.fix && <p className="text-green-500 mt-0.5">Fix: {e.fix}</p>}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-border/30 flex gap-3 justify-end flex-wrap">
              <Button variant="ghost" onClick={onClose} className="rounded-xl">{t('applyFix.cancel')}</Button>
              {errors.length > 0 && selectedErrors.length > 0 && (
                <Button onClick={handleApplySelected} variant="outline"
                  className="rounded-xl border-primary/30 text-primary text-xs">
                  <Check className="w-3.5 h-3.5 mr-1" />
                  {t('applyFix.acknowledgeSelected')} ({selectedErrors.length})
                </Button>
              )}
              <Button onClick={handleApplyAll} className="btn-primary rounded-xl font-bold gap-2">
                <Zap className="w-4 h-4" /> {t('applyFix.autoFixAll')}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ApplyFixModal;
