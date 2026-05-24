import generateToken from '../utils/generateToken.js';
import { sendWelcomeEmail } from '../utils/emailService.js';

export const oauthCallback = async (req, res) => {
  const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:5173';
  try {
    if (!req.user) {
      console.error('OAuth callback: req.user is missing — Passport strategy did not authenticate');
      return res.redirect(`${FRONTEND}/login?error=oauth_failed`);
    }

    const { _id, email, name, role, currentMode, avatar } = req.user;

    if (!_id || !email) {
      console.error('OAuth callback: user missing _id or email', { _id, email });
      return res.redirect(`${FRONTEND}/login?error=oauth_failed`);
    }

    // Send welcome email only on first login (account created within last 10 seconds)
    const isNewUser = req.user.createdAt &&
      (Date.now() - new Date(req.user.createdAt).getTime()) < 10000;
    if (isNewUser) {
      sendWelcomeEmail(email, name).catch(err =>
        console.warn('Welcome email failed (non-fatal):', err.message)
      );
    }

    const token = generateToken(_id, {
      email,
      name:        name        || '',
      role:        role        || 'user',
      currentMode: currentMode || 'developer',
      avatar:      avatar      || '',
    });

    // Destroy the OAuth session — we use JWT from here on
    if (req.session) {
      req.session.destroy(() => {});
    }

    return res.redirect(`${FRONTEND}/oauth-callback?token=${token}`);
  } catch (err) {
    console.error('OAuth callback error:', err.code, err.message, err.stack);
    const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:5173';
    return res.redirect(`${FRONTEND}/login?error=oauth_failed`);
  }
};
