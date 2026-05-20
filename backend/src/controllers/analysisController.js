import Analysis from '../models/Analysis.js';
import { analyzeContent } from '../services/aiService.js';

export const runAnalysis = async (req, res) => {
    try {
        const { text, mode } = req.body;
        const aiResponse = await analyzeContent(text, mode);
        const analysis = await Analysis.create({ user: req.user._id, inputText: text, result: aiResponse, mode });
        res.status(201).json(analysis);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};