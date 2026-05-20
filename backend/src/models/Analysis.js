import mongoose from 'mongoose';

const analysisSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    inputText: { type: String, required: true },
    result: { type: String, required: true },
    mode: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model('Analysis', analysisSchema);