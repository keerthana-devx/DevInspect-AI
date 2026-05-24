import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Trophy, CheckCircle } from 'lucide-react';

const SuccessCelebration = ({ score, errors, isCorrect, visible, onComplete }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!visible) { setShow(false); return; }
    if (!isCorrect) return;

    const hasHighSeverityIssues = (errors || []).some(e =>
      ['critical', 'high'].includes(String(e.severity || '').toLowerCase())
    );
    if (hasHighSeverityIssues) return;
    if (score < 90) return;

    setShow(true);
    confetti({
      particleCount: 30,
      spread: 40,
      origin: { y: 0.7 },
      colors: ['#10b981', '#3b82f6', '#8b5cf6'],
      gravity: 0.8,
      scalar: 0.8,
    });

    const t = setTimeout(() => { setShow(false); onComplete?.(); }, 3000);
    return () => clearTimeout(t);
  }, [visible, score, isCorrect, errors, onComplete]);

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: -20 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="fixed top-6 right-6 z-50 pointer-events-none"
      >
        <div className="card-glass p-4 rounded-2xl border border-green-500/30 shadow-lg max-w-xs">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 0.6 }}
              className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center"
            >
              {score >= 95 ? (
                <Trophy className="w-5 h-5 text-yellow-500" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
            </motion.div>
            <div>
              <motion.h3
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-sm font-bold text-green-500"
              >
                {score >= 95 ? 'Perfect Code! 🏆' : 'Code looks correct ✅'}
              </motion.h3>
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xs text-muted-foreground"
              >
                {score >= 95 ? 'Production ready — excellent work!' : 'No major issues found.'}
              </motion.p>
            </div>
          </div>
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 bg-green-500/10 rounded-2xl -z-10"
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SuccessCelebration;
