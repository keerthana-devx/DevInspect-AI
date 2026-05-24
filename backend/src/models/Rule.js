import mongoose from 'mongoose';

const ruleSchema = new mongoose.Schema({
  user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  text:     { type: String, required: true, trim: true, maxlength: 300 },
  category: { type: String, enum: ['naming', 'react', 'security', 'performance', 'general'], default: 'general' },
  enabled:  { type: Boolean, default: true },
}, { timestamps: true });

// Prevent exact duplicate rules per user
ruleSchema.index({ user: 1, text: 1 }, { unique: true });

export default mongoose.model('Rule', ruleSchema);
