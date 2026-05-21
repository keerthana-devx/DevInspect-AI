import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

passport.serializeUser((user, done) => done(null, user._id));

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Lazily initialized sentinel hash — avoids top-level await
let _oauthPasswordHash = null;
const getOAuthPasswordHash = async () => {
  if (!_oauthPasswordHash) {
    _oauthPasswordHash = await bcrypt.hash('__oauth_placeholder__', 10);
  }
  return _oauthPasswordHash;
};

const findOrCreateOAuthUser = async ({ email, name, githubUser = '' }) => {
  let user = await User.findOne({ email });
  if (!user) {
    const hash = await getOAuthPasswordHash();
    user = new User({ name, email, password: hash, githubUser });
    user.$locals.skipPasswordHash = true;
    await user.save();
  }
  return user;
};

// ── Google ────────────────────────────────────────────────────────────────────
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID:     process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL:  `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/google/callback`,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value?.toLowerCase().trim();
          if (!email) return done(new Error('No email returned from Google'), null);

          const name = profile.displayName || email.split('@')[0];
          const user = await findOrCreateOAuthUser({ email, name });

          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
}

// ── GitHub ────────────────────────────────────────────────────────────────────
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(
    new GitHubStrategy(
      {
        clientID:     process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL:  `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/github/callback`,
        scope:        ['user:email'],
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const rawEmail = profile.emails?.[0]?.value || `${profile.username}@users.noreply.github.com`;
          const email      = rawEmail.toLowerCase().trim();
          const name       = profile.displayName || profile.username || email.split('@')[0];
          const githubUser = profile.username || '';

          const user = await findOrCreateOAuthUser({ email, name, githubUser });

          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
}

export default passport;
