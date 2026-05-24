import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const activityLogSchema = new mongoose.Schema({
  action:    { type: String, required: true },   // e.g. 'login', 'analysis', 'delete'
  detail:    { type: String, default: '' },
  ip:        { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
}, { _id: false });

const userSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  email:       { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:    { type: String, required: true },
  role:        { type: String, enum: ['user', 'admin'], default: 'user' },
  currentMode: { type: String, enum: ['student', 'developer', 'interviewer'], default: 'developer' },
  customRules: { type: [String], default: [] },
  apiKey:      { type: String, default: '' },
  googleId:    { type: String, default: '' },
  githubId:    { type: String, default: '' },
  githubUser:  { type: String, default: '' },
  githubToken: { type: String, default: '' },
  lastLogin:   { type: Date, default: null },
  activityLog: { type: [activityLogSchema], default: [] },
  // Avatar
  avatar:      { type: String, default: '' },
  // Streak & XP system
  streak:      { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  xp:          { type: Number, default: 0 },
  lastActivityDate: { type: String, default: '' }, // YYYY-MM-DD
  badges:      { type: [String], default: [] },
  
  // Enhanced engagement system
  engagement: {
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    totalReviews: { type: Number, default: 0 },
    bugsFound: { type: Number, default: 0 },
    securityIssues: { type: Number, default: 0 },
    perfectScores: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastReviewDate: { type: Date, default: null },
    averageScore: { type: Number, default: 0 },
    totalScore: { type: Number, default: 0 },
    collaborativeSessions: { type: Number, default: 0 },
    achievements: [{
      id: String,
      name: String,
      unlockedAt: { type: Date, default: Date.now },
      points: Number
    }],
    dailyChallenges: [{
      id: String,
      name: String,
      target: Number,
      progress: { type: Number, default: 0 },
      completed: { type: Boolean, default: false },
      points: Number,
      date: String
    }]
  },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.$locals.skipPasswordHash) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Helper to push activity without triggering password re-hash
userSchema.methods.logActivity = async function (action, detail = '', ip = '') {
  await this.updateOne({
    $set:  { lastLogin: action === 'login' ? new Date() : this.lastLogin },
    $push: { activityLog: { $each: [{ action, detail, ip }], $slice: -50 } },
  });
};

export default mongoose.model('User', userSchema);
