import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const ERROR_MESSAGES = {
  google_failed:         'Google authentication failed. Please try again.',
  google_not_configured: 'Google OAuth is not configured on this server.',
  github_failed:         'GitHub authentication failed. Please try again.',
  github_not_configured: 'GitHub OAuth is not configured. Add GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET to backend .env.',
  oauth_failed:          'OAuth authentication failed. Please try again.',
};

const OAuthCallbackPage = () => {
  const navigate        = useNavigate();
  const [searchParams]  = useSearchParams();
  const { login, currentUser } = useAuth();

  const [phase, setPhase]       = useState('processing'); // 'processing' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');
  const [countdown, setCountdown] = useState(3);

  const processedRef  = useRef(false); // prevent double-processing
  const redirectedRef = useRef(false); // prevent double-redirect

  // ── Step 1: Process the URL params and call login() ──────────────
  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      const msg = ERROR_MESSAGES[error] || 'Authentication error occurred.';
      setErrorMsg(msg);
      setPhase('error');
      // Redirect to login after 3s on error
      setTimeout(() => navigate('/login', { state: { error: msg }, replace: true }), 3000);
      return;
    }

    if (!token) {
      const msg = 'No authentication token received.';
      setErrorMsg(msg);
      setPhase('error');
      setTimeout(() => navigate('/login', { state: { error: msg }, replace: true }), 3000);
      return;
    }

    try {
      // Decode JWT payload (base64url → base64 with padding fix)
      const parts  = token.split('.');
      if (parts.length !== 3) throw new Error('Malformed JWT');
      const b64    = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = b64 + '='.repeat((4 - b64.length % 4) % 4);
      const payload = JSON.parse(atob(padded));

      if (!payload.id || !payload.email) throw new Error('JWT payload missing id or email');

      const userData = {
        _id:          payload.id,
        id:           payload.id,
        email:        payload.email,
        name:         payload.name || payload.email.split('@')[0],
        role:         payload.role        || 'user',
        currentMode:  payload.currentMode || 'developer',
        avatar:       payload.avatar      || '',
        streak:       0,
        xp:           0,
        badges:       [],
        longestStreak: 0,
      };

      // login() synchronously writes to localStorage AND calls setCurrentUser
      // The useEffect below watches currentUser and fires the redirect
      login(userData, token);
      setPhase('success');
    } catch (err) {
      const msg = 'Invalid authentication token. Please try again.';
      setErrorMsg(msg);
      setPhase('error');
      setTimeout(() => navigate('/login', { state: { error: msg }, replace: true }), 3000);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  // ── Step 2: Watch currentUser — when auth state is set, start countdown ──
  useEffect(() => {
    if (phase !== 'success' || !currentUser || redirectedRef.current) return;
    redirectedRef.current = true;

    // Countdown 3 → 2 → 1 → redirect
    let count = 3;
    setCountdown(count);

    const interval = setInterval(() => {
      count -= 1;
      setCountdown(count);
      if (count <= 0) {
        clearInterval(interval);
        navigate('/welcome', { replace: true });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, currentUser, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="card-glass p-8 rounded-3xl border border-border/30 shadow-2xl text-center max-w-md w-full"
      >
        {/* Processing */}
        {phase === 'processing' && (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-16 h-16 mx-auto mb-5 bg-primary/20 rounded-full flex items-center justify-center"
            >
              <Loader2 className="w-8 h-8 text-primary" />
            </motion.div>
            <h2 className="text-xl font-bold text-primary mb-2">Processing Authentication</h2>
            <p className="text-muted-foreground text-sm">Please wait while we verify your credentials...</p>
          </>
        )}

        {/* Success */}
        {phase === 'success' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="w-20 h-20 mx-auto mb-5 bg-green-500/20 rounded-full flex items-center justify-center"
            >
              <CheckCircle className="w-10 h-10 text-green-500" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-2xl font-extrabold text-green-500 mb-1"
            >
              Welcome back! 🎉
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="text-muted-foreground mb-5 text-sm"
            >
              Login successful. You're all set!
            </motion.p>

            {/* Countdown ring */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="relative w-16 h-16">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="28" fill="none" stroke="hsl(var(--muted))" strokeWidth="4" />
                  <motion.circle
                    cx="32" cy="32" r="28"
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 28}
                    initial={{ strokeDashoffset: 0 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 28 }}
                    transition={{ duration: 3, ease: 'linear' }}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xl font-black text-primary">
                  {countdown}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Redirecting to welcome page in <strong className="text-primary">{countdown}s</strong>...
              </p>
            </motion.div>
          </>
        )}

        {/* Error */}
        {phase === 'error' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="w-16 h-16 mx-auto mb-5 bg-red-500/20 rounded-full flex items-center justify-center"
            >
              <AlertCircle className="w-8 h-8 text-red-500" />
            </motion.div>
            <h2 className="text-xl font-bold text-red-500 mb-2">Authentication Failed</h2>
            <p className="text-muted-foreground text-sm mb-4">{errorMsg}</p>
            <p className="text-xs text-muted-foreground">Redirecting to login page...</p>
          </>
        )}

        {/* Dots */}
        <div className="flex justify-center gap-1.5 mt-6">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.3, 1], opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2 }}
              className="w-2 h-2 bg-primary/50 rounded-full"
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default OAuthCallbackPage;
