import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import EngagementService from '../services/engagementService.js';
import User from '../models/User.js';

const router = express.Router();

const BADGE_DEFINITIONS = [
  { id: 'first_review',           name: 'First Steps',       emoji: '🚀', desc: 'Complete your first code review',        points: 10,  color: 'from-blue-500 to-cyan-500',      condition: s => s.totalReviews >= 1 },
  { id: 'bug_hunter',             name: 'Bug Slayer',         emoji: '🐛', desc: 'Find 10 critical/high issues',           points: 50,  color: 'from-red-500 to-orange-500',     condition: s => s.bugsFound >= 10 },
  { id: 'security_expert',        name: 'Security Expert',    emoji: '🔒', desc: 'Detect 5 security vulnerabilities',      points: 75,  color: 'from-purple-500 to-pink-500',    condition: s => s.securityIssues >= 5 },
  { id: 'perfectionist',          name: 'Perfectionist',      emoji: '💯', desc: 'Achieve a perfect 100/100 score',        points: 100, color: 'from-yellow-400 to-amber-500',   condition: s => s.perfectScores >= 1 },
  { id: 'streak_master',          name: 'Consistency King',   emoji: '🔥', desc: 'Maintain a 7-day analysis streak',       points: 150, color: 'from-orange-500 to-red-500',     condition: s => s.currentStreak >= 7 },
  { id: 'review_master',          name: 'AI Reviewer Pro',    emoji: '🤖', desc: 'Complete 50 code reviews',               points: 200, color: 'from-indigo-500 to-purple-500',  condition: s => s.totalReviews >= 50 },
  { id: 'code_quality_guru',      name: 'Clean Coder',        emoji: '✨', desc: 'Maintain 85+ average score',            points: 300, color: 'from-green-500 to-teal-500',     condition: s => s.averageScore >= 85 },
  { id: 'collaboration_champion', name: 'Team Player',        emoji: '🤝', desc: 'Join 10 collaborative sessions',         points: 125, color: 'from-teal-500 to-cyan-500',     condition: s => s.collaborativeSessions >= 10 },
  { id: 'logic_master',           name: 'Logic Master',       emoji: '🧠', desc: 'Complete 20 reviews with score ≥ 80',   points: 175, color: 'from-violet-500 to-indigo-500', condition: s => s.totalReviews >= 20 && s.averageScore >= 80 },
  { id: 'interview_crusher',      name: 'Interview Crusher',  emoji: '💼', desc: 'Complete 10 interview mode reviews',    points: 200, color: 'from-pink-500 to-rose-500',     condition: s => (s.interviewReviews || 0) >= 10 },
];

// GET /api/engagement/stats
router.get('/stats', protect, async (req, res) => {
  try {
    const analytics = await EngagementService.getUserAnalytics(req.user._id);
    if (!analytics) return res.status(404).json({ message: 'No engagement data found' });
    res.json({ success: true, data: analytics });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch engagement statistics' });
  }
});

// GET /api/engagement/leaderboard
router.get('/leaderboard', protect, async (req, res) => {
  try {
    const users = await User.find({}, 'name avatar engagement')
      .sort({ 'engagement.xp': -1 })
      .limit(50)
      .lean();

    const ranked = users.map((u, i) => ({
      rank:          i + 1,
      _id:           u._id,
      name:          u.name || 'Anonymous',
      avatar:        u.avatar || '',
      xp:            u.engagement?.xp || 0,
      level:         u.engagement?.level || 1,
      totalReviews:  u.engagement?.totalReviews || 0,
      averageScore:  u.engagement?.averageScore || 0,
      currentStreak: u.engagement?.currentStreak || 0,
      achievements:  u.engagement?.achievements?.length || 0,
      isCurrentUser: u._id.toString() === req.user._id.toString(),
    }));

    const myRank = ranked.find(u => u.isCurrentUser);
    res.json({ success: true, data: { leaderboard: ranked.slice(0, 20), myRank } });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch leaderboard' });
  }
});

// GET /api/engagement/badges
router.get('/badges', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).lean();
    const eng  = user?.engagement || {};
    const unlockedIds = new Set((eng.achievements || []).map(a => a.id));

    const badges = BADGE_DEFINITIONS.map(b => ({
      ...b,
      unlocked:   unlockedIds.has(b.id),
      unlockedAt: eng.achievements?.find(a => a.id === b.id)?.unlockedAt || null,
      condition:  undefined,
    }));

    res.json({ success: true, data: badges });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch badges' });
  }
});

// GET /api/engagement/notifications
router.get('/notifications', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).lean();
    const eng  = user?.engagement || {};
    const mode = user?.currentMode || 'developer';
    const notifications = [];
    const now = Date.now();

    if (eng.currentStreak >= 7)
      notifications.push({ id: 'streak-7', type: 'achievement', icon: '🔥', title: `${eng.currentStreak}-day streak!`, message: 'You are on fire! Keep analyzing code daily.', time: now - 3600000 });
    else if (eng.currentStreak === 0 && eng.totalReviews > 0)
      notifications.push({ id: 'streak-lost', type: 'warning', icon: '⚠️', title: 'Streak broken', message: "You haven't analyzed code today. Don't break your habit!", time: now - 7200000 });

    if (eng.averageScore >= 90)
      notifications.push({ id: 'score-90', type: 'success', icon: '✨', title: 'Clean Coder!', message: `Your average score is ${eng.averageScore}%. Excellent work!`, time: now - 1800000 });
    else if (eng.averageScore > 0 && eng.averageScore < 60)
      notifications.push({ id: 'score-low', type: 'tip', icon: '💡', title: 'Room to improve', message: `Your average score is ${eng.averageScore}%. Try the Student mode for guided learning.`, time: now - 5400000 });

    if (mode === 'student') {
      notifications.push({ id: 'tip-student', type: 'tip', icon: '📚', title: 'Learning Tip', message: 'Using const instead of let improves code safety and signals intent.', time: now - 10800000 });
      if (eng.totalReviews >= 5)
        notifications.push({ id: 'progress-student', type: 'success', icon: '🎉', title: 'Great progress!', message: `You've analyzed ${eng.totalReviews} files.`, time: now - 14400000 });
    }
    if (mode === 'developer') {
      if (eng.securityIssues > 0)
        notifications.push({ id: 'security-dev', type: 'warning', icon: '🔒', title: 'Security Alert', message: `${eng.securityIssues} security issue(s) detected across your analyses.`, time: now - 3600000 });
      notifications.push({ id: 'weekly-dev', type: 'info', icon: '📊', title: 'Weekly Summary', message: `This week: ${eng.totalReviews} reviews, avg score ${eng.averageScore}%. ${eng.bugsFound} bugs found.`, time: now - 86400000 });
    }
    if (mode === 'interviewer')
      notifications.push({ id: 'interview-tip', type: 'tip', icon: '💼', title: 'Interview Insight', message: 'Use Hard difficulty mode to get FAANG-level evaluation of your code.', time: now - 7200000 });

    if (eng.xp > 0 && eng.xp % 100 < 20)
      notifications.push({ id: 'level-up', type: 'achievement', icon: '⬆️', title: `Level ${eng.level}!`, message: `You reached Level ${eng.level}. Keep going to unlock more badges!`, time: now - 900000 });

    (eng.achievements || []).slice(-3).forEach(a => {
      notifications.push({ id: `badge-${a.id}`, type: 'badge', icon: '🏆', title: `Badge Unlocked: ${a.name}`, message: `You earned the "${a.name}" badge!`, time: new Date(a.unlockedAt).getTime() });
    });

    notifications.sort((a, b) => b.time - a.time);
    res.json({ success: true, data: notifications.slice(0, 15) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
});

// GET /api/engagement/achievements
router.get('/achievements', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).lean();
    const eng  = user?.engagement || {};
    const unlockedIds = new Set((eng.achievements || []).map(a => a.id));
    const badges = BADGE_DEFINITIONS.map(b => ({
      ...b, condition: undefined,
      unlocked:   unlockedIds.has(b.id),
      unlockedAt: eng.achievements?.find(a => a.id === b.id)?.unlockedAt || null,
    }));
    res.json({ success: true, data: { achievements: badges, totalUnlocked: unlockedIds.size, totalAvailable: badges.length } });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch achievements' });
  }
});

// GET /api/engagement/daily-challenges
router.get('/daily-challenges', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user?.engagement) return res.json({ success: true, data: { challenges: [], completedToday: 0 } });
    const today = new Date().toDateString();
    const challenges = user.engagement.dailyChallenges || [];
    if (!challenges.length || challenges[0]?.date !== today) {
      const fresh = [
        { id: 'daily_reviews',    name: 'Daily Reviews',    target: 3, progress: 0, completed: false, points: 25, date: today },
        { id: 'high_score',       name: 'High Score',       target: 1, progress: 0, completed: false, points: 30, date: today },
        { id: 'bug_finder',       name: 'Bug Finder',       target: 5, progress: 0, completed: false, points: 20, date: today },
        { id: 'security_scanner', name: 'Security Scanner', target: 2, progress: 0, completed: false, points: 35, date: today },
        { id: 'perfect_score',    name: 'Perfect Score',    target: 1, progress: 0, completed: false, points: 50, date: today },
      ];
      user.engagement.dailyChallenges = fresh;
      await user.save();
      return res.json({ success: true, data: { challenges: fresh, completedToday: 0 } });
    }
    res.json({ success: true, data: { challenges, completedToday: challenges.filter(c => c.completed).length } });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch daily challenges' });
  }
});

// POST /api/engagement/bonus-xp
router.post('/bonus-xp', protect, async (req, res) => {
  try {
    const { amount, reason } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Valid XP amount required' });
    const result = await EngagementService.awardBonusXP(req.user._id, amount, reason || 'bonus');
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ message: 'Failed to award bonus XP' });
  }
});

// POST /api/engagement/collaboration-session
router.post('/collaboration-session', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.engagement) user.engagement = { collaborativeSessions: 0 };
    user.engagement.collaborativeSessions = (user.engagement.collaborativeSessions || 0) + 1;
    user.engagement.xp    = (user.engagement.xp || 0) + 15;
    user.engagement.level = Math.floor((user.engagement.xp || 0) / 100) + 1;
    await user.save();
    res.json({ success: true, data: { collaborativeSessions: user.engagement.collaborativeSessions, xpAwarded: 15, totalXP: user.engagement.xp } });
  } catch (err) {
    res.status(500).json({ message: 'Failed to track collaboration session' });
  }
});

export default router;
