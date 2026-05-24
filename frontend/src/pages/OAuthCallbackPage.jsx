import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const ERROR_MESSAGES = {
  google_failed:         'Google authentication failed',
  google_not_configured: 'Google OAuth is not configured on this server',
  github_failed:         'GitHub authentication failed',
  github_not_configured: 'GitHub OAuth is not configured. Add GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET to backend .env',
  oauth_failed:          'OAuth authentication failed',
};

const OAuthCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');

      if (error) {
        const message = ERROR_MESSAGES[error] || 'Authentication error occurred';
        console.error('[OAuthCallback] Provider returned error:', error, message);
        navigate('/login', { state: { error: message }, replace: true });
        return;
      }

      if (!token) {
        console.error('[OAuthCallback] No token and no error in URL params');
        navigate('/login', { state: { error: 'No authentication token received' }, replace: true });
        return;
      }

      try {
        // Decode JWT payload (base64url middle segment)
        const parts = token.split('.');
        if (parts.length !== 3) throw new Error('Malformed JWT: expected 3 segments');

        // base64url → base64 padding fix
        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const padded  = base64 + '='.repeat((4 - base64.length % 4) % 4);
        const payload = JSON.parse(atob(padded));

        if (!payload.id || !payload.email) {
          throw new Error('JWT payload missing id or email');
        }

        const userData = {
          _id:         payload.id,
          id:          payload.id,
          email:       payload.email,
          name:        payload.name        || payload.email.split('@')[0],
          role:        payload.role        || 'user',
          currentMode: payload.currentMode || 'developer',
          avatar:      payload.avatar      || '',
          streak:      0,
          xp:          0,
          badges:      [],
          longestStreak: 0,
        };

        // login(userObject, token) — synchronous OAuth path in AuthContext
        login(userData, token);
        // Immediate navigation — no setTimeout, no stuck "Redirecting..." screen
        navigate('/welcome', { replace: true });
      } catch (err) {
        console.error('[OAuthCallback] Token processing error:', err.message, err);
        navigate('/login', { state: { error: 'Invalid authentication token. Please try again.' }, replace: true });
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate, login]);

  const token = searchParams.get('token');
  const error = searchParams.get('error');

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="card-glass p-8 rounded-3xl border border-border/30 shadow-2xl text-center max-w-md w-full"
      >
        {error ? (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center"
            >
              <AlertCircle className="w-8 h-8 text-red-500" />
            </motion.div>
            <h2 className="text-xl font-bold text-red-500 mb-2">Authentication Failed</h2>
            <p className="text-muted-foreground mb-4">
              {ERROR_MESSAGES[error] || 'Authentication error occurred'}
            </p>
            <p className="text-sm text-muted-foreground">Redirecting to login page...</p>
          </>
        ) : token ? (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center"
            >
              <CheckCircle className="w-8 h-8 text-green-500" />
            </motion.div>
            <h2 className="text-xl font-bold text-green-500 mb-2">Authentication Successful 🎉</h2>
            <p className="text-muted-foreground mb-4">You have been successfully authenticated!</p>
            <p className="text-sm text-muted-foreground">Redirecting to welcome page...</p>
          </>
        ) : (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-16 h-16 mx-auto mb-4 bg-primary/20 rounded-full flex items-center justify-center"
            >
              <Loader2 className="w-8 h-8 text-primary" />
            </motion.div>
            <h2 className="text-xl font-bold text-primary mb-2">Processing Authentication</h2>
            <p className="text-muted-foreground mb-4">
              Please wait while we complete your authentication...
            </p>
          </>
        )}

        <div className="flex justify-center gap-1 mt-6">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
              className="w-2 h-2 bg-primary/60 rounded-full"
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default OAuthCallbackPage;
