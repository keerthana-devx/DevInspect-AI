import mongoose from 'mongoose';
import crypto from 'crypto';

const shareTokenSchema = new mongoose.Schema({
  analysis:  { type: mongoose.Schema.Types.ObjectId, ref: 'Analysis', required: true },
  owner:     { type: mongoose.Schema.Types.ObjectId, ref: 'User',     required: true },
  token:     { type: String, unique: true, default: () => crypto.randomBytes(16).toString('hex') },
  isPublic:  { type: Boolean, default: true },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }, // 30 days
}, { timestamps: true });

export default mongoose.model('ShareToken', shareTokenSchema);
