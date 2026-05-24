import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Code2, BrainCircuit, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext.jsx';

const WelcomePage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const firstName = currentUser?.name?.split(' ')[0] || 'there';

  return (
    <>
      <Helmet><title>Welcome | DevInspectAI</title></Helmet>

      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="card-glass p-10 rounded-3xl max-w-xl w-full text-center space-y-8"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.1 }}
            className="w-20 h-20 mx-auto rounded-3xl gradient-brand flex items-center justify-center shadow-lg shadow-primary/30"
          >
            <Sparkles className="w-10 h-10 text-white" />
          </motion.div>

          {/* Heading */}
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold text-gradient">
              Welcome, {firstName}!
            </h1>
            <p className="text-muted-foreground text-base leading-relaxed">
              You're all set. Choose a mode to start your AI-powered code review or interview session.
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { icon: Code2,        label: 'Code Analysis'      },
              { icon: BrainCircuit, label: 'AI Evaluation'      },
              { icon: Trophy,       label: 'Interview Practice' },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm font-semibold text-primary"
              >
                <Icon className="w-4 h-4" />
                {label}
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button
              onClick={() => navigate('/mode-selection')}
              className="btn-primary h-12 px-8 text-base font-bold"
            >
              Get Started <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              onClick={() => navigate('/dashboard')}
              variant="outline"
              className="h-12 px-8 text-base font-semibold border-border/50 hover:bg-muted/50"
            >
              Go to Dashboard
            </Button>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default WelcomePage;
