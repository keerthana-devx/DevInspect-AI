import axios from "axios";

export const analyzeContent = async (code) => {
    try {

        const response = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "system",
                        content: `
You are a senior JavaScript code reviewer.

IMPORTANT RULES:
- Do NOT add unnecessary try-catch blocks
- Only fix real errors
- Do NOT over-optimize simple code
- Keep corrected code minimal and clean
- Only suggest improvements if needed

Return exactly in this format:

❌ Errors:
⚡ Fixed Code:
🚀 Optimized Code:
📘 Explanation:

Code:
                        `
                    },
                    {
                        role: "user",
                        content: code
                    }
                ],
                temperature: 0.2
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        return response.data.choices[0].message.content;

    } catch (error) {
        return `
❌ AI Failed

Reason:
${error.response?.data?.error?.message || error.message}
        `;
    }
};