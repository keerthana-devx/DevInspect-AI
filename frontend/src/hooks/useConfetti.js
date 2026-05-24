import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

/**
 * Fires a small confetti burst ONLY when code is actually correct.
 * Requires isCorrect=true AND score>=80 AND no critical/high errors.
 */
const useConfetti = (score, trigger, isCorrect = false, errors = []) => {
  const firedRef = useRef(false);

  useEffect(() => {
    if (!trigger || firedRef.current) return;
    if (!isCorrect) return;

    const hasHighSeverity = (errors || []).some(e =>
      ['critical', 'high'].includes(String(e.severity || '').toLowerCase())
    );
    if (hasHighSeverity) return;
    if (score < 80) return;

    firedRef.current = true;
    confetti({
      particleCount: 60,
      spread: 55,
      origin: { y: 0.65 },
      colors: ['#10b981', '#3b82f6', '#8b5cf6'],
      gravity: 0.9,
      scalar: 0.85,
    });
  }, [score, trigger, isCorrect, errors]);

  useEffect(() => {
    if (!trigger) firedRef.current = false;
  }, [trigger]);
};

export default useConfetti;
