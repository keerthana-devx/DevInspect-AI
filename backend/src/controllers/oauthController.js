import generateToken from '../utils/generateToken.js';

export const oauthCallback = (req, res) => {
  try {
    if (!req.user) {
      return res.redirect(
        `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=oauth_failed`
      );
    }

    const { _id, email, name, role, currentMode } = req.user;

    const token = generateToken(_id, { email, name, role, currentMode });
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    res.redirect(`${frontendUrl}/oauth-callback?token=${token}`);
  } catch (err) {
    console.error('OAuth callback error:', err);
    res.redirect(
      `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=oauth_failed`
    );
  }
};
