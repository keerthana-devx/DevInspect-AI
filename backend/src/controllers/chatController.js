import axios from 'axios';

export const chatFollowup = async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.json({ reply: simulateReply(message) });
    }

    const systemPrompt = context
      ? `You are a helpful code assistant. The user previously received this code analysis:
Explanation: ${context.explanation || ''}
Corrected Code: ${context.correctedCode || ''}
Errors: ${JSON.stringify(context.errors || [])}
Answer the user's follow-up question about this analysis.`
      : 'You are a helpful code assistant. Answer the user\'s coding question.';

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model:    process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user',   content: message },
        ],
        temperature: 0.5,
      },
      {
        headers: {
          Authorization:  `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 20000,
      }
    );

    const reply = response.data.choices?.[0]?.message?.content || 'No response generated.';
    res.json({ reply });
  } catch (error) {
    console.error('Chat error:', error.message);
    res.json({ reply: simulateReply(req.body.message) });
  }
};

const simulateReply = (message) => {
  const lower = (message || '').toLowerCase();
  if (lower.includes('why') || lower.includes('explain')) {
    return 'This suggestion improves reliability and aligns with best practices. Refactoring here prevents runtime failures and improves maintainability.';
  }
  if (lower.includes('security') || lower.includes('vulnerability')) {
    return 'The flagged issue presents a security risk. Hardcoded credentials or unsanitized inputs can lead to injection attacks or data leakage.';
  }
  return 'I recommend following standard guidelines: modular components, proper typing, and secure environment variables. Let me know if you want a specific rewrite.';
};
