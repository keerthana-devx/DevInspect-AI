import { analyzeContent } from '../services/aiService.js';

export const reviewCode = async (req, res) => {
    try {

        const { code } = req.body;

        const result = await analyzeContent(code);

        res.json({
            success: true,
            originalCode: code,
            review: result,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};