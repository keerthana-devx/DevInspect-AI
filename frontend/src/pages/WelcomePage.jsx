import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Code2, TrendingUp, Zap, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button';

const WelcomePage = () => {
  const navigate    = useNavigate();
  const { currentUser } = useAuth();
  const timerRef    = useRef(null);

  // Auto-redirect to dashboard after 4 seconds
  useEffect(() => {
    timerRef.current = setTimeout(() => navigate('/dashboard', { replace: true }), 4000);
    return () => clearTimeout(timerRef.current);
  }, [navigate]);

  const handleGoNow = () => {
    clearTimeout(timerRef.current);
    navigate('/dashboard', { replace: true });
  };

  const features = [
    { icon: Code2,       label: 'AI Code Review',      color: 'text-primary'    },
    { icon: TrendingUp,  label: 'Performance Insights', color: 'text-green-500'  },
    { icon: Zap,         label: 'Instant Feedback',     color: 'text-amber-500'  },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0,  scale: 1    }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="card-glass p-10 rounded-3xl border border-border/30 shadow-2xl text-center max-w-lg w-full"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0    }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
          className="w-20 h-20 mx-auto mb-6 rounded-3xl gradient-brand flex items-center justify-center shadow-xl shadow-primary/30"
        >
          <Sparkles className="w-10 h-10 text-white" />
        </motion.div>

        {/* Greeting */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-extrabold text-gradient mb-2"
        >
          Welcome{currentUser?.name ? `, ${currentUser.name.split(' ')[0]}` : ' back'}! 🎉
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground mb-8 text-sm leading-relaxed"
        >
          You're successfully signed in to DevInspectAI.<br />
          Your AI-powered code review platform is ready.
        </motion.p>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap justify-center gap-3 mb-8"
        >
          {features.map(({ icon: Icon, label, color }) => (
            <div key={label} className="flex items-center gap-2 px-4 py-2 bg-muted/40 rounded-xl border border-border/30 text-sm font-medium">
              <Icon className={`w-4 h-4 ${color}`} />
              <span>{label}</span>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ delay: 0.5 }}
          className="space-y-3"
        >
          <Button onClick={handleGoNow} className="btn-primary w-full h-12 text-base font-bold rounded-2xl">
            Go to Dashboard <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <p className="text-xs text-muted-foreground">
            Redirecting automatically in a few seconds...
          </p>
        </motion.div>

        {/* Progress bar */}
        <motion.div
          className="mt-6 h-1 bg-muted/40 rounded-full overflow-hidden"
        >
          <motion.div
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: 4, ease: 'linear' }}
            className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full"
          />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default WelcomePage;
