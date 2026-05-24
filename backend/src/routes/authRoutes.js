import express from 'express';
import passport from '../config/passport.js';
import { registerUser, loginUser } from '../controllers/authController.js';
import { oauthCallback } from '../controllers/oauthController.js';

const router = express.Router();

const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:5173';

// ── Email / Password ──────────────────────────────────────────────────────────
router.post('/register', registerUser);
router.post('/login',    loginUser);

// ── OAuth guard middleware ────────────────────────────────────────────────────
const requireOAuth = (provider, idEnv, secretEnv) => (req, res, next) => {
  if (!process.env[idEnv] || !process.env[secretEnv]) {
    // Redirect back to login with a clear error instead of crashing
    return res.redirect(`${FRONTEND}/login?error=${provider}_not_configured`);
  }
  // req.session.returnTo - session tracking fallback
  next();
};

// ── Google OAuth ──────────────────────────────────────────────────────────────
router.get(
  '/google',
  requireOAuth('google', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'),
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  requireOAuth('google', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'),
  passport.authenticate('google', {
    failureRedirect: `${FRONTEND}/login?error=google_failed`,
    session: false,
  }),
  oauthCallback
);

// ── GitHub OAuth ──────────────────────────────────────────────────────────────
router.get(
  '/github',
  requireOAuth('github', 'GITHUB_CLIENT_ID', 'GITHUB_CLIENT_SECRET'),
  passport.authenticate('github', { scope: ['user:email'] })
);

router.get(
  '/github/callback',
  requireOAuth('github', 'GITHUB_CLIENT_ID', 'GITHUB_CLIENT_SECRET'),
  passport.authenticate('github', {
    failureRedirect: `${FRONTEND}/login?error=github_failed`,
    session: false,
  }),
  oauthCallback
);

export default router;
