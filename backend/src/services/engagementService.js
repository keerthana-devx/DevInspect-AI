/**
 * Engagement Service - Manages XP, achievements, daily challenges, and user progression
 */

import User from '../models/User.js';

const ACHIEVEMENTS = {
  FIRST_REVIEW: { id: 'first_review', name: 'First Steps', points: 10, condition: (stats) => stats.totalReviews >= 1 },
  BUG_HUNTER: { id: 'bug_hunter', name: 'Bug Hunter', points: 50, condition: (stats) => stats.bugsFound >= 10 },
  SECURITY_EXPERT: { id: 'security_expert', name: 'Security Expert', points: 75, condition: (stats) => stats.securityIssues >= 5 },
  PERFECTIONIST: { id: 'perfectionist', name: 'Perfectionist', points: 100, condition: (stats) => stats.perfectScores >= 1 },
  STREAK_MASTER: { id: 'streak_master', name: 'Streak Master', points: 150, condition: (stats) => stats.currentStreak >= 7 },
  REVIEW_MASTER: { id: 'review_master', name: 'Review Master', points: 200, condition: (stats) => stats.totalReviews >= 50 },
  CODE_QUALITY_GURU: { id: 'code_quality_guru', name: 'Code Quality Guru', points: 300, condition: (stats) => stats.averageScore >= 85 },
  COLLABORATION_CHAMPION: { id: 'collaboration_champion', name: 'Collaboration Champion', points: 125, condition: (stats) => stats.collaborativeSessions >= 10 },
};

const DAILY_CHALLENGES = {
  DAILY_REVIEWS: { id: 'daily_reviews', name: 'Daily Reviews', target: 3, points: 25 },
  HIGH_SCORE: { id: 'high_score', name: 'High Score', target: 1, points: 30 },
  BUG_FINDER: { id: 'bug_finder', name: 'Bug Finder', target: 5, points: 20 },
  SECURITY_SCANNER: { id: 'security_scanner', name: 'Security Scanner', target: 2, points: 35 },
  PERFECT_SCORE: { id: 'perfect_score', name: 'Perfect Score', target: 1, points: 50 },
};

class EngagementService {
  /**
   * Update user stats after a code review
   */
  static async updateUserStats(userId, reviewData) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      // Initialize engagement data if not exists
      if (!user.engagement) {
        user.engagement = {
          xp: 0,
          level: 1,
          totalReviews: 0,
          bugsFound: 0,
          securityIssues: 0,
          perfectScores: 0,
          currentStreak: 0,
          longestStreak: 0,
          lastReviewDate: null,
          averageScore: 0,
          totalScore: 0,
          collaborativeSessions: 0,
          achievements: [],
          dailyChallenges: this.initializeDailyChallenges()
        };
      }

      const engagement = user.engagement;
      const today = new Date().toDateString();
      const lastReview = engagement.lastReviewDate ? new Date(engagement.lastReviewDate).toDateString() : null;

      // Update basic stats
      engagement.totalReviews += 1;
      engagement.totalScore += reviewData.aiScore;
      engagement.averageScore = Math.round(engagement.totalScore / engagement.totalReviews);

      // Count bugs and security issues
      if (reviewData.errors) {
        reviewData.errors.forEach(error => {
          if (error.severity === 'critical' || error.severity === 'high') {
            engagement.bugsFound += 1;
          }
          if (error.category && error.category.toLowerCase().includes('security')) {
            engagement.securityIssues += 1;
          }
        });
      }

      // Perfect score tracking
      if (reviewData.aiScore === 100) {
        engagement.perfectScores += 1;
      }

      // Streak management
      if (lastReview === today) {
        // Same day, don't update streak
      } else if (this.isConsecutiveDay(lastReview, today)) {
        engagement.currentStreak += 1;
      } else if (lastReview !== today) {
        engagement.currentStreak = 1; // Reset streak
      }

      engagement.longestStreak = Math.max(engagement.longestStreak, engagement.currentStreak);
      engagement.lastReviewDate = new Date();

      // Update daily challenges
      this.updateDailyChallenges(engagement, reviewData, today);

      // Check for new achievements
      const newAchievements = this.checkAchievements(engagement);
      
      // Award XP for achievements
      newAchievements.forEach(achievement => {
        engagement.xp += achievement.points;
        engagement.achievements.push({
          id: achievement.id,
          name: achievement.name,
          unlockedAt: new Date(),
          points: achievement.points
        });
      });

      // Base XP for review
      const baseXP = this.calculateReviewXP(reviewData);
      engagement.xp += baseXP;

      // Update level
      engagement.level = this.calculateLevel(engagement.xp);

      await user.save();

      return {
        engagement,
        newAchievements,
        xpGained: baseXP + newAchievements.reduce((sum, a) => sum + a.points, 0)
      };
    } catch (error) {
      console.error('Error updating user stats:', error);
      throw error;
    }
  }

  /**
   * Calculate XP for a review based on various factors
   */
  static calculateReviewXP(reviewData) {
    let xp = 10; // Base XP

    // Bonus for high scores
    if (reviewData.aiScore >= 90) xp += 15;
    else if (reviewData.aiScore >= 80) xp += 10;
    else if (reviewData.aiScore >= 70) xp += 5;

    // Bonus for finding issues
    const issueCount = reviewData.errors?.length || 0;
    xp += Math.min(issueCount * 2, 20); // Max 20 bonus XP

    // Bonus for code complexity (estimated by length)
    const codeLength = reviewData.input?.length || 0;
    if (codeLength > 1000) xp += 5;
    if (codeLength > 2000) xp += 5;

    return xp;
  }

  /**
   * Calculate user level based on XP
   */
  static calculateLevel(xp) {
    return Math.floor(xp / 100) + 1;
  }

  /**
   * Check if two dates are consecutive days
   */
  static isConsecutiveDay(lastDate, currentDate) {
    if (!lastDate) return false;
    
    const last = new Date(lastDate);
    const current = new Date(currentDate);
    const diffTime = current - last;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays === 1;
  }

  /**
   * Initialize daily challenges for a user
   */
  static initializeDailyChallenges() {
    const today = new Date().toDateString();
    return Object.values(DAILY_CHALLENGES).map(challenge => ({
      ...challenge,
      progress: 0,
      completed: false,
      date: today
    }));
  }

  /**
   * Update daily challenge progress
   */
  static updateDailyChallenges(engagement, reviewData, today) {
    // Reset challenges if it's a new day
    const lastChallengeDate = engagement.dailyChallenges[0]?.date;
    if (lastChallengeDate !== today) {
      engagement.dailyChallenges = this.initializeDailyChallenges();
    }

    engagement.dailyChallenges.forEach(challenge => {
      if (challenge.completed) return;

      switch (challenge.id) {
        case 'daily_reviews':
          challenge.progress = Math.min(challenge.progress + 1, challenge.target);
          break;
        
        case 'high_score':
          if (reviewData.aiScore >= 90) {
            challenge.progress = Math.min(challenge.progress + 1, challenge.target);
          }
          break;
        
        case 'bug_finder':
          const bugsFound = reviewData.errors?.filter(e => 
            e.severity === 'critical' || e.severity === 'high'
          ).length || 0;
          challenge.progress = Math.min(challenge.progress + bugsFound, challenge.target);
          break;
        
        case 'security_scanner':
          const securityIssues = reviewData.errors?.filter(e => 
            e.category?.toLowerCase().includes('security')
          ).length || 0;
          challenge.progress = Math.min(challenge.progress + securityIssues, challenge.target);
          break;
        
        case 'perfect_score':
          if (reviewData.aiScore === 100) {
            challenge.progress = Math.min(challenge.progress + 1, challenge.target);
          }
          break;
      }

      // Mark as completed and award XP
      if (challenge.progress >= challenge.target && !challenge.completed) {
        challenge.completed = true;
        engagement.xp += challenge.points;
      }
    });
  }

  /**
   * Check for new achievements
   */
  static checkAchievements(engagement) {
    const unlockedIds = new Set(engagement.achievements.map(a => a.id));
    const newAchievements = [];

    Object.values(ACHIEVEMENTS).forEach(achievement => {
      if (!unlockedIds.has(achievement.id) && achievement.condition(engagement)) {
        newAchievements.push(achievement);
      }
    });

    return newAchievements;
  }

  /**
   * Get user leaderboard position
   */
  static async getLeaderboardPosition(userId) {
    try {
      const users = await User.find({}, 'engagement.xp engagement.level')
        .sort({ 'engagement.xp': -1 })
        .limit(100);

      const position = users.findIndex(user => user._id.toString() === userId) + 1;
      return {
        position: position || null,
        totalUsers: users.length,
        topUsers: users.slice(0, 10).map((user, idx) => ({
          rank: idx + 1,
          xp: user.engagement?.xp || 0,
          level: user.engagement?.level || 1
        }))
      };
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      return null;
    }
  }

  /**
   * Get user engagement analytics
   */
  static async getUserAnalytics(userId, days = 30) {
    try {
      const user = await User.findById(userId);
      if (!user || !user.engagement) return null;

      const engagement = user.engagement;
      
      // Calculate daily XP trend (simplified)
      const dailyXP = Math.round(engagement.xp / Math.max(engagement.totalReviews, 1));
      
      return {
        currentLevel: engagement.level,
        totalXP: engagement.xp,
        xpToNextLevel: (engagement.level * 100) - (engagement.xp % 100),
        currentStreak: engagement.currentStreak,
        longestStreak: engagement.longestStreak,
        totalReviews: engagement.totalReviews,
        averageScore: engagement.averageScore,
        achievementsUnlocked: engagement.achievements.length,
        totalAchievements: Object.keys(ACHIEVEMENTS).length,
        dailyChallengesCompleted: engagement.dailyChallenges?.filter(c => c.completed).length || 0,
        dailyXPAverage: dailyXP,
        recentAchievements: engagement.achievements
          .sort((a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt))
          .slice(0, 5)
      };
    } catch (error) {
      console.error('Error getting user analytics:', error);
      return null;
    }
  }

  /**
   * Award bonus XP for special actions
   */
  static async awardBonusXP(userId, amount, reason) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      if (!user.engagement) {
        user.engagement = { xp: 0, level: 1 };
      }

      user.engagement.xp += amount;
      user.engagement.level = this.calculateLevel(user.engagement.xp);

      await user.save();

      return {
        xpAwarded: amount,
        totalXP: user.engagement.xp,
        newLevel: user.engagement.level,
        reason
      };
    } catch (error) {
      console.error('Error awarding bonus XP:', error);
      throw error;
    }
  }
}

export default EngagementService;