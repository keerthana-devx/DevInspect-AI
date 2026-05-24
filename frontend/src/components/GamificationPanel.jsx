import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Zap, Target, Flame, Star, Lock, ChevronRight, RefreshCw } from 'lucide-react';
import { API_ORIGIN } from '@/lib/apiConfig';

const XPBar = ({ xp, level }) => {
  const xpInLevel   = xp % 100;
  const xpToNext    = 100 - xpInLevel;
  const pct         = xpInLevel;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-primary flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5" /> Level {level}
        </span>
        <span className="text-muted-foreground">{xp} XP · {xpToNext} to next</span>
      </div>
      <div className="h-2.5 bg-muted/50 rounded-full overflow-hidden border border-border/30">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full rounded-full bg-gradient-to-r from-primary to-purple-500 shadow-sm shadow-primary/40"
        />
      </div>
    </div>
  );
};

const BadgeCard = ({ badge, index }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: index * 0.05 }}
    whileHover={badge.unlocked ? { scale: 1.08, y: -3 } : {}}
    className={`relative p-3 rounded-2xl border text-center transition-all ${
      badge.unlocked
        ? 'bg-gradient-to-br ' + badge.color + '/10 border-primary/20 shadow-sm cursor-pointer'
        : 'bg-muted/20 border-border/20 opacity-50'
    }`}
    title={badge.desc}
  >
    <div className={`text-2xl mb-1 ${badge.unlocked ? '' : 'grayscale'}`}>{badge.emoji}</div>
    <p className={`text-[10px] font-bold leading-tight ${badge.unlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
      {badge.name}
    </p>
    {!badge.unlocked && (
      <Lock className="w-3 h-3 text-muted-foreground/50 absolute top-1.5 right-1.5" />
    )}
    {badge.unlocked && (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center"
      >
        <span className="text-[8px] text-white font-black">✓</span>
      </motion.div>
    )}
  </motion.div>
);

const ChallengeRow = ({ challenge }) => {
  const pct = Math.min(100, Math.round((challenge.progress / challenge.target) * 100));
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className={`font-semibold ${challenge.completed ? 'text-green-500' : 'text-foreground/80'}`}>
          {challenge.completed ? '✓ ' : ''}{challenge.name}
        </span>
        <span className="text-muted-foreground">{challenge.progress}/{challenge.target} · +{challenge.points} XP</span>
      </div>
      <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${challenge.completed ? 'bg-green-500' : 'bg-gradient-to-r from-primary to-purple-500'}`}
        />
      </div>
    </div>
  );
};

const RANK_MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' };

const GamificationPanel = () => {
  const [tab, setTab]             = useState('badges');
  const [badges, setBadges]       = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [stats, setStats]         = useState(null);
  const [loading, setLoading]     = useState(true);

  const fetchAll = useCallback(async () => {
    const token = localStorage.getItem('devinspect-token');
    if (!token) return;
    setLoading(true);
    try {
      const [badgesRes, challengesRes, lbRes, statsRes] = await Promise.all([
        fetch(`${API_ORIGIN}/api/engagement/badges`,            { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_ORIGIN}/api/engagement/daily-challenges`,  { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_ORIGIN}/api/engagement/leaderboard`,       { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_ORIGIN}/api/engagement/stats`,             { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (badgesRes.ok)     setBadges((await badgesRes.json()).data || []);
      if (challengesRes.ok) setChallenges((await challengesRes.json()).data?.challenges || []);
      if (lbRes.ok)         setLeaderboard((await lbRes.json()).data?.leaderboard || []);
      if (statsRes.ok)      setStats((await statsRes.json()).data || null);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const unlockedCount = badges.filter(b => b.unlocked).length;
  const completedToday = challenges.filter(c => c.completed).length;

  const TABS = [
    { id: 'badges',     label: 'Badges',     icon: Star   },
    { id: 'challenges', label: 'Daily',      icon: Target },
    { id: 'leaderboard',label: 'Ranks',      icon: Trophy },
  ];

  return (
    <div className="card-glass rounded-3xl overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-border/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Gamification</h3>
              <p className="text-[10px] text-muted-foreground">{unlockedCount}/{badges.length} badges · {completedToday} challenges done</p>
            </div>
          </div>
          <button onClick={fetchAll} className="text-muted-foreground hover:text-primary transition-colors p-1 rounded-lg hover:bg-muted/40">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* XP Bar */}
        {stats && <XPBar xp={stats.totalXP || 0} level={stats.currentLevel || 1} />}

        {/* Quick stats */}
        {stats && (
          <div className="grid grid-cols-3 gap-2 mt-3">
            {[
              { label: 'Streak', value: `${stats.currentStreak || 0}🔥`, color: 'text-orange-500' },
              { label: 'Reviews', value: stats.totalReviews || 0, color: 'text-primary' },
              { label: 'Avg Score', value: `${stats.averageScore || 0}%`, color: 'text-green-500' },
            ].map(s => (
              <div key={s.label} className="text-center p-2 bg-muted/30 rounded-xl border border-border/20">
                <p className={`text-sm font-black ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border/30">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold transition-all ${
                tab === t.id
                  ? 'text-primary border-b-2 border-primary bg-primary/5'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="p-4 min-h-[220px]">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}
              className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {tab === 'badges' && (
              <motion.div key="badges" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {badges.map((b, i) => <BadgeCard key={b.id} badge={b} index={i} />)}
                </div>
                {badges.length === 0 && (
                  <p className="text-center text-muted-foreground text-xs py-8">Run your first analysis to earn badges!</p>
                )}
              </motion.div>
            )}

            {tab === 'challenges' && (
              <motion.div key="challenges" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="space-y-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Today's Challenges</p>
                  <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                    {completedToday}/{challenges.length} done
                  </span>
                </div>
                {challenges.map(c => <ChallengeRow key={c.id} challenge={c} />)}
                {challenges.length === 0 && (
                  <p className="text-center text-muted-foreground text-xs py-8">No challenges available yet.</p>
                )}
              </motion.div>
            )}

            {tab === 'leaderboard' && (
              <motion.div key="leaderboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="space-y-2">
                {leaderboard.slice(0, 10).map((u, i) => (
                  <motion.div
                    key={u._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
                      u.isCurrentUser
                        ? 'bg-primary/10 border-primary/30'
                        : 'bg-muted/20 border-border/20 hover:bg-muted/30'
                    }`}
                  >
                    <span className="text-sm w-6 text-center font-black">
                      {RANK_MEDALS[u.rank] || `#${u.rank}`}
                    </span>
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white text-[10px] font-black shrink-0 overflow-hidden">
                      {u.avatar
                        ? <img src={u.avatar} alt="" className="w-full h-full object-cover" />
                        : u.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold truncate ${u.isCurrentUser ? 'text-primary' : 'text-foreground'}`}>
                        {u.name}{u.isCurrentUser ? ' (You)' : ''}
                      </p>
                      <p className="text-[10px] text-muted-foreground">Lv.{u.level} · {u.totalReviews} reviews</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-black text-primary">{u.xp.toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground">XP</p>
                    </div>
                  </motion.div>
                ))}
                {leaderboard.length === 0 && (
                  <p className="text-center text-muted-foreground text-xs py-8">Be the first on the leaderboard!</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default GamificationPanel;
