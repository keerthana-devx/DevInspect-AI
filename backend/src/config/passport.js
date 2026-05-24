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

let _oauthPasswordHash = null;
const getOAuthPasswordHash = async () => {
  if (!_oauthPasswordHash) {
    _oauthPasswordHash = await bcrypt.hash('__oauth_placeholder__', 10);
  }
  return _oauthPasswordHash;
};

const findOrCreateOAuthUser = async ({ email, name, githubUser = '', avatar = '', googleId = '', githubId = '' }) => {
  let user = await User.findOne({ email });
  if (!user) {
    const hash = await getOAuthPasswordHash();
    user = new User({ name, email, password: hash, githubUser, avatar, googleId, githubId });
    user.$locals.skipPasswordHash = true;
    await user.save();
  } else {
    let changed = false;
    if (!user.avatar && avatar)         { user.avatar     = avatar;     changed = true; }
    if (!user.googleId && googleId)     { user.googleId   = googleId;   changed = true; }
    if (!user.githubId && githubId)     { user.githubId   = githubId;   changed = true; }
    if (!user.githubUser && githubUser) { user.githubUser = githubUser; changed = true; }
    if (changed) {
      user.$locals.skipPasswordHash = true;
      await user.save();
    }
  }
  return user;
};

// ── Google ────────────────────────────────────────────────────────────────────
const GOOGLE_ID     = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_SECRET = process.env.GOOGLE_CLIENT_SECRET;

if (GOOGLE_ID && GOOGLE_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID:     GOOGLE_ID,
        clientSecret: GOOGLE_SECRET,
        callbackURL:  process.env.GOOGLE_CALLBACK_URL ||
                      `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/google/callback`,
      },
      async (_at, _rt, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value?.toLowerCase().trim();
          if (!email) return done(new Error('No email returned from Google'), null);
          const name     = profile.displayName || email.split('@')[0];
          const avatar   = profile.photos?.[0]?.value || '';
          const googleId = profile.id || '';
          const user = await findOrCreateOAuthUser({ email, name, avatar, googleId });
          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
  console.log('✅ Google OAuth strategy registered');
} else {
  console.log('⚠️  Google OAuth disabled — GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not set');
}

// ── GitHub ────────────────────────────────────────────────────────────────────
const GITHUB_ID     = process.env.GITHUB_CLIENT_ID;
const GITHUB_SECRET = process.env.GITHUB_CLIENT_SECRET;

if (GITHUB_ID && GITHUB_SECRET) {
  passport.use(
    new GitHubStrategy(
      {
        clientID:     GITHUB_ID,
        clientSecret: GITHUB_SECRET,
        callbackURL:  process.env.GITHUB_CALLBACK_URL ||
                      `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/github/callback`,
        scope:        ['user:email'],
      },
      async (_at, _rt, profile, done) => {
        try {
          const rawEmail   = profile.emails?.[0]?.value || `${profile.username}@users.noreply.github.com`;
          const email      = rawEmail.toLowerCase().trim();
          const name       = profile.displayName || profile.username || email.split('@')[0];
          const githubUser = profile.username || '';
          const avatar     = profile.photos?.[0]?.value || '';
          const githubId   = profile.id ? String(profile.id) : '';
          const user = await findOrCreateOAuthUser({ email, name, githubUser, avatar, githubId });
          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
  console.log('✅ GitHub OAuth strategy registered');
} else {
  console.log('⚠️  GitHub OAuth disabled — GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET not set');
}

export default passport;
