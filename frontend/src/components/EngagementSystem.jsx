import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Target, 
  Flame, 
  Star, 
  Award, 
  Zap, 
  Shield, 
  Code, 
  Bug,
  TrendingUp,
  Calendar,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useMascotContext } from '@/contexts/MascotContext.jsx';

// Safe wrapper — won't crash if used outside MascotProvider
const useSafeMascot = () => {
  try {
    return useMascotContext();
  } catch {
    return { triggerMascot: () => {} };
  }
};

const ACHIEVEMENTS = [
  { id: 'first_review', name: 'First Steps', desc: 'Complete your first code review', icon: Code, points: 10 },
  { id: 'bug_hunter', name: 'Bug Hunter', desc: 'Find 10 critical issues', icon: Bug, points: 50 },
  { id: 'security_expert', name: 'Security Expert', desc: 'Identify 5 security vulnerabilities', icon: Shield, points: 75 },
  { id: 'perfectionist', name: 'Perfectionist', desc: 'Get a perfect 100/100 score', icon: Star, points: 100 },
  { id: 'streak_master', name: 'Streak Master', desc: 'Maintain a 7-day streak', icon: Flame, points: 150 },
  { id: 'review_master', name: 'Review Master', desc: 'Complete 50 code reviews', icon: Trophy, points: 200 },
];

const DAILY_CHALLENGES = [
  { id: 'daily_review', name: 'Daily Review', desc: 'Complete 3 code reviews today', progress: 0, target: 3, points: 25 },
  { id: 'high_score', name: 'High Score', desc: 'Achieve a score above 90', progress: 0, target: 1, points: 30 },
  { id: 'bug_finder', name: 'Bug Finder', desc: 'Find 5 bugs in code', progress: 0, target: 5, points: 20 },
];

const EngagementSystem = ({ userStats, onStatsUpdate }) => {
  const [showAchievement, setShowAchievement] = useState(null);
  const [dailyChallenges, setDailyChallenges] = useState(DAILY_CHALLENGES);
  const [unlockedAchievements, setUnlockedAchievements] = useState(new Set());
  const { triggerMascot } = useSafeMascot();

  // Load user progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('devinspect-engagement');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setUnlockedAchievements(new Set(data.achievements || []));
        setDailyChallenges(data.dailyChallenges || DAILY_CHALLENGES);
      } catch (e) {
        console.error('Failed to load engagement data:', e);
      }
    }
  }, []);

  // Save progress to localStorage
  const saveProgress = (achievements, challenges) => {
    const data = {
      achievements: Array.from(achievements),
      dailyChallenges: challenges,
      lastUpdated: Date.now()
    };
    localStorage.setItem('devinspect-engagement', JSON.stringify(data));
  };

  // Check for new achievements
  const checkAchievements = (stats) => {
    const newAchievements = new Set(unlockedAchievements);
    
    ACHIEVEMENTS.forEach(achievement => {
      if (unlockedAchievements.has(achievement.id)) return;
      
      let unlocked = false;
      
      switch (achievement.id) {
        case 'first_review':
          unlocked = stats.totalReviews >= 1;
          break;
        case 'bug_hunter':
          unlocked = stats.bugsFound >= 10;
          break;
        case 'security_expert':
          unlocked = stats.securityIssues >= 5;
          break;
        case 'perfectionist':
          unlocked = stats.perfectScores >= 1;
          break;
        case 'streak_master':
          unlocked = stats.currentStreak >= 7;
          break;
        case 'review_master':
          unlocked = stats.totalReviews >= 50;
          break;
      }
      
      if (unlocked) {
        newAchievements.add(achievement.id);
        setShowAchievement(achievement);

        // Fire mascot notification
        const mascotMap = {
          first_review:   ['clean_code',     'First review complete! Great start! 🎉'],
          bug_hunter:     ['bug_found',       'Bug Slayer! You found 10 bugs! 🐛'],
          security_expert:['security_alert',  'Security Expert! 5 vulnerabilities caught! 🛡️'],
          perfectionist:  ['milestone',       'Perfectionist! Perfect 100/100 score! 💯'],
          streak_master:  ['streak',          '7-day streak! You are on fire! 🔥'],
          review_master:  ['level_up',        'Review Master! 50 reviews done! 🚀'],
        };
        const [mascotType, mascotMsg] = mascotMap[achievement.id] || ['badge_earned', `${achievement.name} unlocked!`];
        triggerMascot(mascotType, mascotMsg);
        
        // Award XP
        onStatsUpdate?.({
          ...stats,
          xp: (stats.xp || 0) + achievement.points
        });
      }
    });
    
    if (newAchievements.size !== unlockedAchievements.size) {
      setUnlockedAchievements(newAchievements);
      saveProgress(newAchievements, dailyChallenges);
    }
  };

  // Update daily challenge progress
  const updateDailyProgress = (challengeId, increment = 1) => {
    setDailyChallenges(prev => {
      const updated = prev.map(challenge => {
        if (challenge.id === challengeId) {
          const newProgress = Math.min(challenge.progress + increment, challenge.target);
          return { ...challenge, progress: newProgress };
        }
        return challenge;
      });
      
      saveProgress(unlockedAchievements, updated);
      return updated;
    });
  };

  // Calculate user level
  const calculateLevel = (xp) => {
    return Math.floor(xp / 100) + 1;
  };

  const getXpForNextLevel = (xp) => {
    const currentLevel = calculateLevel(xp);
    return currentLevel * 100;
  };

  const currentXp = userStats?.xp || 0;
  const currentLevel = calculateLevel(currentXp);
  const nextLevelXp = getXpForNextLevel(currentXp);
  const progressToNext = ((currentXp % 100) / 100) * 100;

  // Check achievements when stats change
  useEffect(() => {
    if (userStats) {
      checkAchievements(userStats);
    }
  }, [userStats]);

  return (
    <>
      {/* Main Engagement Widget */}
      <div className="card-glass p-4 rounded-2xl border border-border/30 space-y-4">
        {/* Level & XP */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gradient">Level {currentLevel}</h3>
            <p className="text-xs text-muted-foreground">{currentXp} XP</p>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span className="text-xs font-bold">{nextLevelXp - currentXp} to next</span>
          </div>
        </div>
        
        <Progress value={progressToNext} className="h-2" />

        {/* Daily Challenges */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold">Daily Challenges</span>
          </div>
          
          {dailyChallenges.map(challenge => (
            <div key={challenge.id} className="p-2 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium">{challenge.name}</span>
                <span className="text-xs text-muted-foreground">
                  +{challenge.points} XP
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground mb-2">{challenge.desc}</p>
              <div className="flex items-center gap-2">
                <Progress 
                  value={(challenge.progress / challenge.target) * 100} 
                  className="h-1 flex-1" 
                />
                <span className="text-[10px] font-bold">
                  {challenge.progress}/{challenge.target}
                </span>
                {challenge.progress >= challenge.target && (
                  <CheckCircle className="w-3 h-3 text-green-500" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Recent Achievements */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span className="text-xs font-bold">Achievements</span>
            <span className="text-xs text-muted-foreground">
              ({unlockedAchievements.size}/{ACHIEVEMENTS.length})
            </span>
          </div>
          
          <div className="grid grid-cols-3 gap-1">
            {ACHIEVEMENTS.slice(0, 6).map(achievement => {
              const unlocked = unlockedAchievements.has(achievement.id);
              const Icon = achievement.icon;
              
              return (
                <div
                  key={achievement.id}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    unlocked 
                      ? 'bg-primary/10 border-primary/30 text-primary' 
                      : 'bg-muted/20 border-border/20 text-muted-foreground'
                  }`}
                  title={achievement.desc}
                >
                  <Icon className="w-4 h-4 mx-auto mb-1" />
                  <p className="text-[9px] font-bold leading-tight">{achievement.name}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/20">
          <div className="text-center">
            <p className="text-lg font-bold text-primary">{userStats?.currentStreak || 0}</p>
            <p className="text-[10px] text-muted-foreground">Day Streak</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-primary">{userStats?.totalReviews || 0}</p>
            <p className="text-[10px] text-muted-foreground">Reviews</p>
          </div>
        </div>
      </div>

      {/* Achievement Unlock Animation */}
      <AnimatePresence>
        {showAchievement && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -50 }}
            className="fixed bottom-6 right-6 z-50 card-glass p-4 rounded-2xl border border-yellow-500/30 shadow-2xl max-w-xs"
          >
            <div className="text-center">
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ duration: 0.6 }}
                className="w-12 h-12 mx-auto mb-3 bg-yellow-500/20 rounded-full flex items-center justify-center"
              >
                <showAchievement.icon className="w-6 h-6 text-yellow-500" />
              </motion.div>
              
              <h3 className="text-sm font-bold text-gradient mb-1">Achievement Unlocked!</h3>
              <p className="text-xs font-medium mb-1">{showAchievement.name}</p>
              <p className="text-[10px] text-muted-foreground mb-3">{showAchievement.desc}</p>
              
              <div className="flex items-center justify-center gap-1 text-yellow-500">
                <Star className="w-3 h-3" />
                <span className="text-xs font-bold">+{showAchievement.points} XP</span>
              </div>
            </div>
            
            <Button
              onClick={() => setShowAchievement(null)}
              size="sm"
              className="w-full mt-3 h-7 text-xs"
            >
              Awesome!
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default EngagementSystem;