import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Target, 
  Clock, 
  TrendingUp, 
  Award, 
  Eye, 
  SkipForward,
  CheckCircle,
  XCircle,
  BarChart3,
  Calendar,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const InterviewAnalytics = ({ sessionStats, onReset }) => {
  const [showDetailed, setShowDetailed] = useState(false);

  // Calculate derived metrics
  const totalAttempted = sessionStats.questionsAttempted || 0;
  const correctAnswers = sessionStats.correctAnswers || 0;
  const wrongAnswers = sessionStats.wrongAnswers || 0;
  const skippedQuestions = sessionStats.skippedQuestions || 0;
  const revealsUsed = sessionStats.revealsUsed || 0;
  const totalScore = sessionStats.totalScore || 0;

  const accuracyRate = totalAttempted > 0 ? Math.round((correctAnswers / totalAttempted) * 100) : 0;
  const averageScore = totalAttempted > 0 ? Math.round(totalScore / totalAttempted) : 0;
  const completionRate = totalAttempted > 0 ? Math.round(((correctAnswers + wrongAnswers) / totalAttempted) * 100) : 0;
  const revealRate = totalAttempted > 0 ? Math.round((revealsUsed / totalAttempted) * 100) : 0;

  // Performance level calculation
  const getPerformanceLevel = () => {
    if (averageScore >= 90) return { level: 'Excellent', color: 'text-green-500', bg: 'bg-green-500/10' };
    if (averageScore >= 75) return { level: 'Good', color: 'text-blue-500', bg: 'bg-blue-500/10' };
    if (averageScore >= 60) return { level: 'Average', color: 'text-yellow-500', bg: 'bg-yellow-500/10' };
    return { level: 'Needs Improvement', color: 'text-red-500', bg: 'bg-red-500/10' };
  };

  const performance = getPerformanceLevel();

  if (totalAttempted === 0) {
    return (
      <div className="card-glass p-6 rounded-3xl text-center">
        <BarChart3 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
        <h3 className="text-lg font-bold mb-2">No Interview Data</h3>
        <p className="text-muted-foreground text-sm">Complete some interview questions to see your analytics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-glass p-4 rounded-2xl text-center"
        >
          <Target className="w-6 h-6 text-primary mx-auto mb-2" />
          <p className="text-2xl font-black text-primary">{totalAttempted}</p>
          <p className="text-xs text-muted-foreground">Questions</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-glass p-4 rounded-2xl text-center"
        >
          <Trophy className="w-6 h-6 text-green-500 mx-auto mb-2" />
          <p className="text-2xl font-black text-green-500">{averageScore}</p>
          <p className="text-xs text-muted-foreground">Avg Score</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-glass p-4 rounded-2xl text-center"
        >
          <CheckCircle className="w-6 h-6 text-blue-500 mx-auto mb-2" />
          <p className="text-2xl font-black text-blue-500">{accuracyRate}%</p>
          <p className="text-xs text-muted-foreground">Accuracy</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-glass p-4 rounded-2xl text-center"
        >
          <Zap className="w-6 h-6 text-amber-500 mx-auto mb-2" />
          <p className="text-2xl font-black text-amber-500">{completionRate}%</p>
          <p className="text-xs text-muted-foreground">Completion</p>
        </motion.div>
      </div>

      {/* Performance Summary */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card-glass p-6 rounded-3xl"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Performance Overview</h3>
          <div className={`px-3 py-1 rounded-full text-sm font-bold ${performance.bg} ${performance.color}`}>
            {performance.level}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Progress Bars */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Correct Answers</span>
                <span className="text-sm text-green-500 font-bold">{correctAnswers}/{totalAttempted}</span>
              </div>
              <Progress value={(correctAnswers / totalAttempted) * 100} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Wrong Answers</span>
                <span className="text-sm text-red-500 font-bold">{wrongAnswers}/{totalAttempted}</span>
              </div>
              <Progress value={(wrongAnswers / totalAttempted) * 100} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Skipped Questions</span>
                <span className="text-sm text-yellow-500 font-bold">{skippedQuestions}/{totalAttempted}</span>
              </div>
              <Progress value={(skippedQuestions / totalAttempted) * 100} className="h-2" />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-muted/30 rounded-xl text-center">
              <Eye className="w-5 h-5 text-amber-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-amber-500">{revealsUsed}</p>
              <p className="text-xs text-muted-foreground">Reveals Used</p>
            </div>

            <div className="p-3 bg-muted/30 rounded-xl text-center">
              <SkipForward className="w-5 h-5 text-orange-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-orange-500">{revealRate}%</p>
              <p className="text-xs text-muted-foreground">Reveal Rate</p>
            </div>

            <div className="p-3 bg-muted/30 rounded-xl text-center">
              <Award className="w-5 h-5 text-purple-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-purple-500">{totalScore}</p>
              <p className="text-xs text-muted-foreground">Total Points</p>
            </div>

            <div className="p-3 bg-muted/30 rounded-xl text-center">
              <TrendingUp className="w-5 h-5 text-green-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-green-500">{Math.max(0, correctAnswers - wrongAnswers)}</p>
              <p className="text-xs text-muted-foreground">Net Score</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Detailed Analytics Toggle */}
      <div className="flex justify-center gap-3">
        <Button 
          onClick={() => setShowDetailed(!showDetailed)}
          variant="outline"
          className="h-10"
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          {showDetailed ? 'Hide' : 'Show'} Detailed Analytics
        </Button>
        
        {onReset && (
          <Button 
            onClick={onReset}
            variant="outline"
            className="h-10 border-red-500/30 text-red-600 hover:bg-red-500/10"
          >
            Reset Analytics
          </Button>
        )}
      </div>

      {/* Detailed Analytics */}
      {showDetailed && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="card-glass p-6 rounded-3xl space-y-4"
        >
          <h3 className="text-lg font-bold mb-4">Detailed Performance Metrics</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Performance Insights */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Performance Insights</h4>
              
              <div className="space-y-2">
                {accuracyRate >= 80 && (
                  <div className="flex items-center gap-2 text-green-600 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    <span>Excellent accuracy rate!</span>
                  </div>
                )}
                
                {revealRate > 50 && (
                  <div className="flex items-center gap-2 text-amber-600 text-sm">
                    <Eye className="w-4 h-4" />
                    <span>Try solving without reveals for better scores</span>
                  </div>
                )}
                
                {skippedQuestions > correctAnswers && (
                  <div className="flex items-center gap-2 text-orange-600 text-sm">
                    <SkipForward className="w-4 h-4" />
                    <span>Consider attempting more questions</span>
                  </div>
                )}
                
                {averageScore >= 85 && (
                  <div className="flex items-center gap-2 text-purple-600 text-sm">
                    <Trophy className="w-4 h-4" />
                    <span>Outstanding performance!</span>
                  </div>
                )}
              </div>
            </div>

            {/* Recommendations */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Recommendations</h4>
              
              <div className="space-y-2 text-sm">
                {averageScore < 60 && (
                  <p className="text-muted-foreground">• Focus on understanding problem patterns</p>
                )}
                
                {revealRate > 30 && (
                  <p className="text-muted-foreground">• Practice more before revealing answers</p>
                )}
                
                {accuracyRate < 70 && (
                  <p className="text-muted-foreground">• Take more time to think through solutions</p>
                )}
                
                {completionRate < 80 && (
                  <p className="text-muted-foreground">• Try to complete more questions for better practice</p>
                )}
                
                <p className="text-muted-foreground">• Review incorrect answers to learn from mistakes</p>
                <p className="text-muted-foreground">• Practice regularly to improve consistency</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default InterviewAnalytics;