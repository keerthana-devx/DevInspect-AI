import express from 'express';
import passport from '../config/passport.js';
import { registerUser, loginUser } from '../controllers/authController.js';
import { oauthCallback } from '../controllers/oauthController.js';

const router = express.Router();

// ── Email / Password ──────────────────────────────────────────────────────────
router.post('/register', registerUser);
router.post('/login',    loginUser);

// ── Google OAuth ──────────────────────────────────────────────────────────────
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=google_failed`, session: false }),
  oauthCallback
);

// ── GitHub OAuth ──────────────────────────────────────────────────────────────
router.get(
  '/github',
  passport.authenticate('github', { scope: ['user:email'], session: false })
);

router.get(
  '/github/callback',
  passport.authenticate('github', { failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=github_failed`, session: false }),
  oauthCallback
);

export default router;
