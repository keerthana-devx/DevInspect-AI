import axios from 'axios';

const COMPANY_STYLES = {
  google:    'Google (FAANG) — focus on optimal algorithms, scalability, clean code, Big-O analysis',
  amazon:    'Amazon — focus on leadership principles, scalable systems, edge cases, practical solutions',
  microsoft: 'Microsoft — focus on problem-solving clarity, OOP design, code correctness',
  tcs:       'TCS — focus on fundamental CS concepts, basic DSA, practical coding',
  infosys:   'Infosys — focus on logical reasoning, basic algorithms, clean implementation',
  wipro:     'Wipro — focus on core programming concepts, data structures, problem-solving',
  product:   'Product-based company — focus on optimal solutions, system design, scalability',
  general:   'General technical interview — balanced focus on correctness, efficiency, and clarity',
};

const callAI = async (prompt) => {
  const res = await axios.post(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      model: process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a strict JSON API. Output ONLY valid JSON. No markdown, no code fences, no text outside the JSON object.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.OPENROUTER_HTTP_REFERER || 'http://localhost:5173',
        'X-Title': process.env.OPENROUTER_APP_NAME || 'DevInspectAI',
      },
      timeout: 30000,
    }
  );
  return res.data?.choices?.[0]?.message?.content || null;
};

const extractJSON = (text) => {
  if (!text) return null;
  try {
    let clean = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    const start = clean.indexOf('{');
    const end = clean.lastIndexOf('}');
    if (start === -1 || end === -1) return null;
    return JSON.parse(clean.slice(start, end + 1));
  } catch {
    return null;
  }
};

const FALLBACK_QUESTIONS = {
  easy: {
    title: 'Reverse a String',
    category: 'Strings',
    description: 'Write a function that takes a string as input and returns the string reversed.',
    problemStatement: 'Given a string s, return the string reversed. Do not use built-in reverse functions.',
    sampleInput: 's = "hello"',
    sampleOutput: '"olleh"',
    constraints: ['1 <= s.length <= 10^5', 's consists of printable ASCII characters'],
    expectedTimeComplexity: 'O(n)',
    expectedSpaceComplexity: 'O(n)',
    hints: ['Use two pointers from both ends', 'Or iterate from end to start building a new string'],
    hiddenTestCases: [
      { input: '"a"', output: '"a"' },
      { input: '""', output: '""' },
      { input: '"abcde"', output: '"edcba"' },
    ],
    followUpQuestion: 'Can you do it in O(1) space if the input is a character array?',
  },
  medium: {
    title: 'Two Sum',
    category: 'Arrays',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    problemStatement: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.',
    sampleInput: 'nums = [2,7,11,15], target = 9',
    sampleOutput: '[0,1]',
    constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', 'Only one valid answer exists'],
    expectedTimeComplexity: 'O(n)',
    expectedSpaceComplexity: 'O(n)',
    hints: ['Use a hash map to store complement values', 'For each number, check if its complement exists in the map'],
    hiddenTestCases: [
      { input: 'nums=[3,2,4], target=6', output: '[1,2]' },
      { input: 'nums=[3,3], target=6', output: '[0,1]' },
    ],
    followUpQuestion: 'What if the array is sorted? Can you solve it in O(1) space?',
  },
  hard: {
    title: 'LRU Cache',
    category: 'Data Structures',
    description: 'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.',
    problemStatement: 'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache. Implement the LRUCache class with get(key) and put(key, value) operations, both in O(1) time complexity.',
    sampleInput: 'LRUCache(2), put(1,1), put(2,2), get(1), put(3,3), get(2)',
    sampleOutput: '[null,null,null,1,null,-1]',
    constraints: ['1 <= capacity <= 3000', '0 <= key <= 10^4', '0 <= value <= 10^5', 'At most 2*10^5 calls to get and put'],
    expectedTimeComplexity: 'O(1) for both get and put',
    expectedSpaceComplexity: 'O(capacity)',
    hints: ['Combine a HashMap with a Doubly Linked List', 'HashMap gives O(1) lookup, DLL gives O(1) insertion/deletion'],
    hiddenTestCases: [
      { input: 'capacity=1, put(2,1), get(2), put(3,2), get(2), get(3)', output: '[null,null,1,null,-1,2]' },
    ],
    followUpQuestion: 'How would you implement LFU (Least Frequently Used) cache?',
  },
};

export const generateInterviewQuestion = async ({ difficulty, company, category, language }) => {
  // Validate inputs
  const validDifficulty = ['easy', 'medium', 'hard'].includes(difficulty) ? difficulty : 'medium';
  const validLanguage = language || 'javascript';
  const validCategory = category || 'DSA';
  const validCompany = company || 'general';

  // If no API key, use fallback immediately
  if (!process.env.OPENROUTER_API_KEY) {
    console.log('No OPENROUTER_API_KEY found, using fallback questions');
    return { ...FALLBACK_QUESTIONS[validDifficulty] || FALLBACK_QUESTIONS.medium, company: validCompany, difficulty: validDifficulty, language: validLanguage };
  }

  const companyStyle = COMPANY_STYLES[validCompany] || COMPANY_STYLES.general;

  const prompt = `You are a technical interviewer at ${validCompany.toUpperCase()}. Generate a realistic coding interview question.

Company Style: ${companyStyle}
Difficulty: ${validDifficulty.toUpperCase()}
Category: ${validCategory}
Language: ${validLanguage}

Generate a question that a real ${validCompany} interviewer would ask. Make it specific, realistic, and challenging for the difficulty level.

Return ONLY this JSON structure:
{
  "title": "<concise problem title>",
  "category": "${validCategory}",
  "company": "${validCompany}",
  "difficulty": "${validDifficulty}",
  "language": "${validLanguage}",
  "description": "<1-2 sentence summary>",
  "problemStatement": "<full detailed problem statement with context, 3-5 sentences>",
  "sampleInput": "<concrete example input>",
  "sampleOutput": "<expected output for sample input>",
  "constraints": ["<constraint 1>", "<constraint 2>", "<constraint 3>"],
  "expectedTimeComplexity": "<e.g. O(n log n)>",
  "expectedSpaceComplexity": "<e.g. O(n)>",
  "hints": ["<hint 1 — vague>", "<hint 2 — more specific>"],
  "hiddenTestCases": [
    { "input": "<edge case input>", "output": "<expected output>" },
    { "input": "<another edge case>", "output": "<expected output>" }
  ],
  "followUpQuestion": "<harder follow-up question an interviewer would ask>"
}`;

  try {
    const raw = await callAI(prompt);
    if (!raw) {
      console.warn('AI returned empty response, using fallback');
      return { ...FALLBACK_QUESTIONS[validDifficulty] || FALLBACK_QUESTIONS.medium, company: validCompany, difficulty: validDifficulty, language: validLanguage };
    }
    
    const parsed = extractJSON(raw);
    if (parsed && parsed.title && parsed.problemStatement) {
      // Ensure all required fields exist
      return {
        title: parsed.title || 'Untitled Question',
        category: parsed.category || validCategory,
        company: parsed.company || validCompany,
        difficulty: parsed.difficulty || validDifficulty,
        language: parsed.language || validLanguage,
        description: parsed.description || parsed.title,
        problemStatement: parsed.problemStatement || parsed.description || 'No problem statement available',
        sampleInput: parsed.sampleInput || 'N/A',
        sampleOutput: parsed.sampleOutput || 'N/A',
        constraints: Array.isArray(parsed.constraints) ? parsed.constraints : [],
        expectedTimeComplexity: parsed.expectedTimeComplexity || 'O(n)',
        expectedSpaceComplexity: parsed.expectedSpaceComplexity || 'O(n)',
        hints: Array.isArray(parsed.hints) ? parsed.hints : ['Think about the problem step by step'],
        hiddenTestCases: Array.isArray(parsed.hiddenTestCases) ? parsed.hiddenTestCases : [],
        followUpQuestion: parsed.followUpQuestion || 'Can you optimize this further?'
      };
    }
  } catch (err) {
    console.warn('Interview question generation failed, using fallback:', err.message);
  }

  return { ...FALLBACK_QUESTIONS[validDifficulty] || FALLBACK_QUESTIONS.medium, company: validCompany, difficulty: validDifficulty, language: validLanguage };
};
