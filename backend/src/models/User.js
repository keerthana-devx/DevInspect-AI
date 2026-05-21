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
  githubUser:  { type: String, default: '' },
  githubToken: { type: String, default: '' },
  lastLogin:   { type: Date, default: null },
  activityLog: { type: [activityLogSchema], default: [] },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Helper to push activity without triggering password re-hash
userSchema.methods.logActivity = async function (action, detail = '', ip = '') {
  this.activityLog.push({ action, detail, ip });
  // Keep only last 50 entries
  if (this.activityLog.length > 50) {
    this.activityLog = this.activityLog.slice(-50);
  }
  await this.updateOne({
    $set:  { lastLogin: action === 'login' ? new Date() : this.lastLogin },
    $push: { activityLog: { $each: [{ action, detail, ip }], $slice: -50 } },
  });
};

export default mongoose.model('User', userSchema);
