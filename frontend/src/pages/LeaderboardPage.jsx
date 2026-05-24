import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Trophy, Zap, Flame, Star, Target, RefreshCw } from 'lucide-react';
import { API_ORIGIN } from '@/lib/apiConfig';

const MEDALS = { 1: { emoji: '🥇', color: 'from-yellow-400 to-amber-500', ring: 'ring-yellow-400/50' },
                 2: { emoji: '🥈', color: 'from-slate-300 to-slate-400',   ring: 'ring-slate-400/50'  },
                 3: { emoji: '🥉', color: 'from-orange-400 to-amber-600',  ring: 'ring-orange-400/50' } };

const Avatar = ({ user, size = 'md' }) => {
  const sz = size === 'lg' ? 'w-16 h-16 text-xl' : size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';
  return (
    <div className={`${sz} rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white font-black shrink-0 overflow-hidden ring-2 ring-border/30`}>
      {user.avatar
        ? <img src={user.avatar} alt="" className="w-full h-full object-cover" />
        : user.name.charAt(0).toUpperCase()}
    </div>
  );
};

const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [myRank, setMyRank]           = useState(null);
  const [loading, setLoading]         = useState(true);
  const [tab, setTab]                 = useState('xp');

  const fetch_ = async () => {
    const token = localStorage.getItem('devinspect-token');
    if (!token) return;
    setLoading(true);
    try {
      const res  = await fetch(`${API_ORIGIN}/api/engagement/leaderboard`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setLeaderboard(data.data?.leaderboard || []);
      setMyRank(data.data?.myRank || null);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch_(); }, []);

  const sorted = [...leaderboard].sort((a, b) => {
    if (tab === 'xp')      return b.xp - a.xp;
    if (tab === 'reviews') return b.totalReviews - a.totalReviews;
    if (tab === 'score')   return b.averageScore - a.averageScore;
    if (tab === 'streak')  return b.currentStreak - a.currentStreak;
    return 0;
  }).map((u, i) => ({ ...u, rank: i + 1 }));

  const top3 = sorted.slice(0, 3);
  const rest = sorted.slice(3);

  const TABS = [
    { id: 'xp',      label: 'XP',       icon: Zap    },
    { id: 'reviews', label: 'Reviews',  icon: Target },
    { id: 'score',   label: 'Avg Score',icon: Star   },
    { id: 'streak',  label: 'Streak',   icon: Flame  },
  ];

  return (
    <>
      <Helmet><title>Leaderboard | DevInspectAI</title></Helmet>
      <div className="min-h-screen p-6 lg:p-10 text-foreground bg-background">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-gradient">Leaderboard</h1>
                <p className="text-muted-foreground text-sm">Compete with developers worldwide</p>
              </div>
            </div>
            <button onClick={fetch_} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border/40 text-sm text-muted-foreground hover:text-primary hover:border-primary/40 transition-all">
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>
        </motion.div>

        {/* My Rank Banner */}
        {myRank && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 card-glass rounded-2xl border border-primary/30 flex items-center gap-4">
            <div className="text-2xl font-black text-primary">#{myRank.rank}</div>
            <Avatar user={myRank} />
            <div className="flex-1">
              <p className="font-bold text-sm">Your Ranking</p>
              <p className="text-xs text-muted-foreground">{myRank.xp.toLocaleString()} XP · Level {myRank.level}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Avg Score</p>
              <p className="font-black text-green-500">{myRank.averageScore}%</p>
            </div>
          </motion.div>
        )}

        {/* Sort Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  tab === t.id ? 'bg-primary/20 text-primary border-primary/30' : 'border-border/30 text-muted-foreground hover:text-foreground hover:bg-muted/40'
                }`}>
                <Icon className="w-3.5 h-3.5" />{t.label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}
              className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            {top3.length >= 3 && (
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[top3[1], top3[0], top3[2]].map((u, i) => {
                  const actualRank = i === 0 ? 2 : i === 1 ? 1 : 3;
                  const medal = MEDALS[actualRank];
                  const height = actualRank === 1 ? 'pt-0' : 'pt-6';
                  return (
                    <motion.div key={u._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`${height} flex flex-col items-center`}>
                      <div className={`card-glass p-4 rounded-2xl border border-border/30 text-center w-full bg-gradient-to-b ${medal.color}/5`}>
                        <div className="text-2xl mb-2">{medal.emoji}</div>
                        <div className={`mx-auto mb-2 ring-2 ${medal.ring} rounded-full`}>
                          <Avatar user={u} size={actualRank === 1 ? 'lg' : 'md'} />
                        </div>
                        <p className="font-bold text-xs truncate">{u.name}</p>
                        <p className="text-[10px] text-muted-foreground">Lv.{u.level}</p>
                        <p className="text-sm font-black text-primary mt-1">{u.xp.toLocaleString()} XP</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Full List */}
            <div className="card-glass rounded-3xl overflow-hidden">
              <div className="px-5 py-3 border-b border-border/30 grid grid-cols-12 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                <span className="col-span-1">#</span>
                <span className="col-span-5">User</span>
                <span className="col-span-2 text-right">XP</span>
                <span className="col-span-2 text-right">Reviews</span>
                <span className="col-span-2 text-right">Score</span>
              </div>
              <div className="divide-y divide-border/20">
                {sorted.map((u, i) => (
                  <motion.div key={u._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className={`px-5 py-3 grid grid-cols-12 items-center hover:bg-muted/20 transition-colors ${u.isCurrentUser ? 'bg-primary/5' : ''}`}>
                    <span className="col-span-1 text-sm font-black">
                      {MEDALS[u.rank]?.emoji || <span className="text-muted-foreground text-xs">#{u.rank}</span>}
                    </span>
                    <div className="col-span-5 flex items-center gap-2.5">
                      <Avatar user={u} size="sm" />
                      <div className="min-w-0">
                        <p className={`text-xs font-bold truncate ${u.isCurrentUser ? 'text-primary' : ''}`}>
                          {u.name}{u.isCurrentUser ? ' ★' : ''}
                        </p>
                        <p className="text-[10px] text-muted-foreground">Lv.{u.level} · {u.currentStreak}🔥</p>
                      </div>
                    </div>
                    <span className="col-span-2 text-right text-xs font-black text-primary">{u.xp.toLocaleString()}</span>
                    <span className="col-span-2 text-right text-xs text-muted-foreground">{u.totalReviews}</span>
                    <span className="col-span-2 text-right text-xs font-bold text-green-500">{u.averageScore}%</span>
                  </motion.div>
                ))}
                {sorted.length === 0 && (
                  <div className="py-16 text-center">
                    <Trophy className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">No rankings yet. Be the first!</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default LeaderboardPage;
