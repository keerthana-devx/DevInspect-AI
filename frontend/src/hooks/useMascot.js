import { useState, useCallback, useRef } from 'react';

let _idCounter = 0;
const nextId = () => `mascot-${++_idCounter}`;

const useMascot = () => {
  const [event, setEvent] = useState(null);
  const timerRef = useRef(null);

  const show = useCallback((type, title, message = '', xp = 0, duration = 5) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setEvent({ id: nextId(), type, title, message, xp, duration });
    timerRef.current = setTimeout(() => setEvent(null), duration * 1000 + 600);
  }, []);

  const dismiss = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setEvent(null);
  }, []);

  // Convenience triggers
  const mascot = {
    levelUp:       (level, xp)        => show('level_up',       `Level ${level} Reached!`,      'Keep analyzing to earn more XP!', xp),
    badgeEarned:   (name, pts)         => show('badge_earned',   `Badge Unlocked: ${name}`,      'Add it to your resume!', pts),
    cleanCode:     (score)             => show('clean_code',     `Clean Code! ${score}/100`,     'No critical issues found. Excellent work!', 15),
    bugFound:      (count)             => show('bug_found',      `${count} Bug${count>1?'s':''} Detected!`, 'Review the findings panel.', 10),
    criticalBug:   (count)             => show('critical_bug',   `${count} Critical Issue${count>1?'s':''}!`, 'Immediate attention required!', 20, 7),
    streak:        (days)              => show('streak',         `${days}-Day Streak! 🔥`,       'You are on fire! Keep it up!', 5 * days),
    streakBroken:  ()                  => show('streak_broken',  'Streak Broken 💔',             "Don't give up — start a new streak today!", 0, 4),
    welcomeBack:   (name)              => show('welcome_back',   `Welcome back, ${name}!`,       'Ready to write some great code?', 0, 4),
    analyzing:     ()                  => show('analyzing',      'AI is Analyzing...',           'Scanning for bugs, security issues & more.', 0, 3),
    securityAlert: (count)             => show('security_alert', `${count} Security Issue${count>1?'s':''}!`, 'Critical vulnerabilities detected!', 20, 7),
    milestone:     (label, xp)         => show('milestone',      `Milestone: ${label}`,          'Amazing achievement unlocked!', xp, 6),
    idle:          ()                  => show('idle',           'Taking a break...',            'Come back and analyze some code!', 0, 4),
  };

  return { event, dismiss, mascot };
};

export default useMascot;
