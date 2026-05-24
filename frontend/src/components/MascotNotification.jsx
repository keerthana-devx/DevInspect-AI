import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { API_ORIGIN } from '@/lib/apiConfig';
import { getMascotFallback } from '@/lib/mascotFallbacks';

// ── Config per event type ─────────────────────────────────────────────────────
const EVENT_CONFIG = {
  level_up:      { bg: 'from-purple-900/95 to-indigo-900/95', border: 'border-purple-500/50', glow: 'shadow-purple-500/30', accent: 'text-purple-300' },
  badge_earned:  { bg: 'from-amber-900/95 to-orange-900/95',  border: 'border-amber-500/50',  glow: 'shadow-amber-500/30',  accent: 'text-amber-300'  },
  clean_code:    { bg: 'from-emerald-900/95 to-teal-900/95',  border: 'border-emerald-500/50',glow: 'shadow-emerald-500/30',accent: 'text-emerald-300'},
  bug_found:     { bg: 'from-orange-900/95 to-red-900/95',    border: 'border-orange-500/50', glow: 'shadow-orange-500/30', accent: 'text-orange-300' },
  critical_bug:  { bg: 'from-red-950/95 to-rose-900/95',      border: 'border-red-500/50',    glow: 'shadow-red-500/40',    accent: 'text-red-300'    },
  streak:        { bg: 'from-orange-900/95 to-amber-900/95',  border: 'border-orange-400/50', glow: 'shadow-orange-400/30', accent: 'text-orange-300' },
  streak_broken: { bg: 'from-slate-900/95 to-blue-950/95',    border: 'border-blue-500/40',   glow: 'shadow-blue-500/20',   accent: 'text-blue-300'   },
  welcome_back:  { bg: 'from-teal-900/95 to-cyan-900/95',     border: 'border-teal-500/50',   glow: 'shadow-teal-500/30',   accent: 'text-teal-300'   },
  analyzing:     { bg: 'from-violet-900/95 to-purple-900/95', border: 'border-violet-500/50', glow: 'shadow-violet-500/30', accent: 'text-violet-300' },
  security_alert:{ bg: 'from-orange-950/95 to-red-900/95',    border: 'border-orange-500/50', glow: 'shadow-orange-500/30', accent: 'text-orange-300' },
  milestone:     { bg: 'from-yellow-900/95 to-amber-900/95',  border: 'border-yellow-500/50', glow: 'shadow-yellow-500/30', accent: 'text-yellow-300' },
  idle:          { bg: 'from-slate-900/95 to-indigo-950/95',  border: 'border-indigo-500/40', glow: 'shadow-indigo-500/20', accent: 'text-indigo-300' },
};

// ── Mascot image with Bedrock fetch + SVG fallback ────────────────────────────
const MascotImage = ({ type, size = 120 }) => {
  const [src, setSrc] = useState(() => getMascotFallback(type));
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setSrc(getMascotFallback(type)); // show SVG immediately
    setLoaded(false);

    const token = localStorage.getItem('devinspect-token');
    if (!token) return;

    fetch(`${API_ORIGIN}/api/mascot/${type}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        if (data.dataUri) setSrc(data.dataUri);
      })
      .catch(() => {}); // keep SVG fallback on error
  }, [type]);

  return (
    <motion.div
      initial={{ scale: 0, rotate: -15 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
      className="relative"
      style={{ width: size, height: size }}
    >
      {/* Glow ring */}
      <motion.div
        animate={{ scale: [1, 1.12, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-0 rounded-full bg-white/10 blur-xl"
      />
      <img
        src={src}
        alt={type}
        onLoad={() => setLoaded(true)}
        className={`relative z-10 w-full h-full object-contain drop-shadow-2xl transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-80'}`}
        style={{ imageRendering: 'crisp-edges' }}
      />
      {/* Bounce shadow */}
      <motion.div
        animate={{ scaleX: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-3 bg-black/40 rounded-full blur-sm"
      />
    </motion.div>
  );
};

// ── Floating particles ────────────────────────────────────────────────────────
const Particles = ({ type }) => {
  const particles = type === 'critical_bug' || type === 'bug_found'
    ? ['🐛','🐞','⚠️','🔴']
    : type === 'streak' ? ['🔥','⚡','✨','🔥']
    : type === 'streak_broken' ? ['💧','💔','😢','💧']
    : type === 'security_alert' ? ['🛡️','🔒','⚠️','🚨']
    : ['✨','⭐','🌟','💫'];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
      {particles.map((p, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20, x: Math.random() * 200 - 100 }}
          animate={{ opacity: [0, 1, 0], y: -60, x: (Math.random() - 0.5) * 80 }}
          transition={{ duration: 2.5, delay: i * 0.3 + 0.5, repeat: Infinity, repeatDelay: 1.5 }}
          className="absolute text-lg"
          style={{ left: `${20 + i * 20}%`, bottom: '10%' }}
        >
          {p}
        </motion.span>
      ))}
    </div>
  );
};

// ── Main MascotNotification component ────────────────────────────────────────
const MascotNotification = ({ event, onClose }) => {
  if (!event) return null;
  const cfg = EVENT_CONFIG[event.type] || EVENT_CONFIG.idle;

  return (
    <AnimatePresence>
      <motion.div
        key={event.id}
        initial={{ opacity: 0, scale: 0.7, y: 60, x: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 40, x: 40 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        className={`fixed bottom-6 right-6 z-[9999] w-72 sm:w-80 rounded-2xl border backdrop-blur-xl bg-gradient-to-br ${cfg.bg} ${cfg.border} shadow-2xl ${cfg.glow} overflow-hidden`}
      >
        <Particles type={event.type} />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          <X className="w-3.5 h-3.5 text-white/70" />
        </button>

        <div className="relative z-10 p-5 flex items-end gap-4">
          {/* Mascot */}
          <div className="shrink-0">
            <MascotImage type={event.type} size={100} />
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0 pb-1">
            <motion.p
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className={`text-xs font-black uppercase tracking-widest mb-1 ${cfg.accent}`}
            >
              {event.label || event.type.replace(/_/g, ' ')}
            </motion.p>
            <motion.h3
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
              className="text-white font-bold text-sm leading-snug"
            >
              {event.title}
            </motion.h3>
            {event.message && (
              <motion.p
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 }}
                className="text-white/60 text-xs mt-1 leading-relaxed"
              >
                {event.message}
              </motion.p>
            )}
            {event.xp && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.55, type: 'spring' }}
                className="mt-2 inline-flex items-center gap-1 bg-white/15 rounded-full px-2.5 py-0.5"
              >
                <span className="text-yellow-300 text-xs font-black">+{event.xp} XP</span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Progress bar auto-dismiss */}
        <motion.div
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ duration: event.duration || 5, ease: 'linear' }}
          style={{ transformOrigin: 'left' }}
          className="h-0.5 bg-white/30 w-full"
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default MascotNotification;
