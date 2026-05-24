import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Zap, Award } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';

const BADGE_LABELS = {
  first_review:  { label: 'First Review',   emoji: '🎯' },
  streak_3:      { label: '3-Day Streak',   emoji: '🔥' },
  streak_7:      { label: 'Week Warrior',   emoji: '⚔️' },
  streak_30:     { label: 'Monthly Master', emoji: '👑' },
  xp_100:        { label: 'XP Century',     emoji: '💯' },
  xp_500:        { label: 'XP Legend',      emoji: '🏆' },
};

const StreakCard = ({ compact = false }) => {
  const { currentUser } = useAuth();
  const streak  = currentUser?.streak  || 0;
  const xp      = currentUser?.xp      || 0;
  const badges  = currentUser?.badges  || [];
  const longest = currentUser?.longestStreak || 0;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20">
          <Flame className="w-3.5 h-3.5 text-orange-500" />
          <span className="text-xs font-bold text-orange-500">{streak}</span>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/10 border border-primary/20">
          <Zap className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-bold text-primary">{xp} XP</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-glass p-6 rounded-2xl border border-border/30"
    >
      <div className="flex items-center gap-2 mb-4">
        <Flame className="w-5 h-5 text-orange-500" />
        <h3 className="font-bold text-lg">Developer Streak</h3>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center p-3 bg-orange-500/10 rounded-xl border border-orange-500/20">
          <p className="text-2xl font-black text-orange-500">{streak}</p>
          <p className="text-xs text-muted-foreground mt-1">Current Streak</p>
        </div>
        <div className="text-center p-3 bg-primary/10 rounded-xl border border-primary/20">
          <p className="text-2xl font-black text-primary">{xp}</p>
          <p className="text-xs text-muted-foreground mt-1">Total XP</p>
        </div>
        <div className="text-center p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
          <p className="text-2xl font-black text-amber-500">{longest}</p>
          <p className="text-xs text-muted-foreground mt-1">Best Streak</p>
        </div>
      </div>

      {badges.length > 0 && (
        <div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
            <Award className="w-3.5 h-3.5" /> Badges Earned
          </p>
          <div className="flex flex-wrap gap-2">
            {badges.map((id) => {
              const b = BADGE_LABELS[id];
              if (!b) return null;
              return (
                <span key={id} className="px-2 py-1 bg-muted/50 rounded-lg text-xs font-semibold border border-border/30 flex items-center gap-1">
                  {b.emoji} {b.label}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default StreakCard;
