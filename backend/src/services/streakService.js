/**
 * Streak & XP service — updates user streak on each analysis
 */

const BADGE_THRESHOLDS = [
  { id: 'first_review',   label: 'First Review',    xp: 10,   condition: (u) => u.xp >= 10 },
  { id: 'streak_3',       label: '3-Day Streak',    xp: 0,    condition: (u) => u.streak >= 3 },
  { id: 'streak_7',       label: 'Week Warrior',    xp: 0,    condition: (u) => u.streak >= 7 },
  { id: 'streak_30',      label: 'Monthly Master',  xp: 0,    condition: (u) => u.streak >= 30 },
  { id: 'xp_100',         label: 'XP Century',      xp: 0,    condition: (u) => u.xp >= 100 },
  { id: 'xp_500',         label: 'XP Legend',       xp: 0,    condition: (u) => u.xp >= 500 },
];

const XP_PER_REVIEW = 10;

export const updateStreak = async (user) => {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const last  = user.lastActivityDate || '';

  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  if (last === today) {
    // Already reviewed today — just add XP
    user.xp = (user.xp || 0) + XP_PER_REVIEW;
  } else if (last === yesterday) {
    // Consecutive day
    user.streak = (user.streak || 0) + 1;
    user.xp     = (user.xp || 0) + XP_PER_REVIEW;
    user.lastActivityDate = today;
  } else {
    // Streak broken or first time
    user.streak = 1;
    user.xp     = (user.xp || 0) + XP_PER_REVIEW;
    user.lastActivityDate = today;
  }

  // Track longest streak
  if (user.streak > (user.longestStreak || 0)) {
    user.longestStreak = user.streak;
  }

  // Award badges
  const currentBadges = new Set(user.badges || []);
  for (const badge of BADGE_THRESHOLDS) {
    if (!currentBadges.has(badge.id) && badge.condition(user)) {
      currentBadges.add(badge.id);
    }
  }
  user.badges = [...currentBadges];

  await user.save();
  return { streak: user.streak, xp: user.xp, badges: user.badges, longestStreak: user.longestStreak };
};
