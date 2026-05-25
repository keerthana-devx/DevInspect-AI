import axios from 'axios';
import InterviewSession from '../models/InterviewSession.js';

/* ─── Shared AI caller ───────────────────────────── */
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
        Authorization:  `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.OPENROUTER_HTTP_REFERER || 'http://localhost:5173',
        'X-Title':      process.env.OPENROUTER_APP_NAME     || 'DevInspectAI',
      },
      timeout: 60000,
    }
  );
  return res.data?.choices?.[0]?.message?.content || null;
};

const extractJSON = (text) => {
  if (!text) return null;
  try {
    let clean = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    const start = clean.indexOf('{');
    const end   = clean.lastIndexOf('}');
    if (start === -1 || end === -1) return null;
    return JSON.parse(clean.slice(start, end + 1));
  } catch { return null; }
};

/* ─── Domain → question type distribution ───────── */
const DOMAIN_TYPES = {
  DSA:      ['coding', 'coding', 'coding', 'output', 'bugfix', 'conceptual', 'mcq', 'coding'],
  MERN:     ['conceptual', 'coding', 'bugfix', 'conceptual', 'coding', 'mcq', 'output', 'conceptual'],
  React:    ['conceptual', 'coding', 'bugfix', 'mcq', 'output', 'conceptual', 'coding', 'mcq'],
  'Node.js':['conceptual', 'coding', 'bugfix', 'mcq', 'conceptual', 'coding', 'output', 'conceptual'],
  Java:     ['coding', 'conceptual', 'mcq', 'bugfix', 'coding', 'output', 'conceptual', 'coding'],
  Python:   ['coding', 'conceptual', 'mcq', 'bugfix', 'coding', 'output', 'conceptual', 'coding'],
  OOPs:     ['conceptual', 'mcq', 'conceptual', 'coding', 'mcq', 'bugfix', 'conceptual', 'mcq'],
  DBMS:     ['conceptual', 'mcq', 'coding', 'conceptual', 'mcq', 'bugfix', 'output', 'conceptual'],
  default:  ['coding', 'conceptual', 'mcq', 'bugfix', 'coding', 'output', 'conceptual', 'coding'],
};

/* ─── POST /api/interview/generate ──────────────── */
export const generateQuestions = async (req, res) => {
  try {
    const { role = 'generic', domain = 'DSA', language = 'javascript', difficulty = 'medium', count = 7 } = req.body;

    const types = (DOMAIN_TYPES[domain] || DOMAIN_TYPES.default).slice(0, count);

    const prompt = `You are a senior technical interviewer at a top tech company.
Generate exactly ${count} realistic interview questions for a ${difficulty.toUpperCase()} level ${domain} interview.
Role: ${role} | Language: ${language} | Domain: ${domain}

Question types to generate (in this exact order): ${types.join(', ')}

RULES:
- coding: write a complete function/solution
- mcq: multiple choice with 4 options (A/B/C/D), one correct
- bugfix: provide buggy code, candidate must find and fix bugs
- output: provide code snippet, candidate predicts the output
- conceptual: explain a concept, no code required

Return ONLY this JSON:
{
  "questions": [
    {
      "id": 0,
      "type": "coding|mcq|bugfix|output|conceptual",
      "title": "<concise title>",
      "description": "<full problem statement, 3-5 sentences>",
      "category": "<topic category>",
      "hint": "<helpful hint without giving away the answer>",
      "starterCode": "<starter code template for coding/bugfix/output, empty string for mcq/conceptual>",
      "sampleInput": "<example input, empty for conceptual/mcq>",
      "sampleOutput": "<expected output, empty for conceptual>",
      "constraints": ["<constraint 1>", "<constraint 2>"],
      "options": ["<A option>", "<B option>", "<C option>", "<D option>"],
      "correctOption": <0-3 index for mcq, -1 for others>,
      "solution": "<complete correct solution code or answer text>",
      "timeComplexity": "<e.g. O(n)>",
      "spaceComplexity": "<e.g. O(1)>",
      "explanation": "<detailed explanation of the solution approach>",
      "concepts": ["<key concept 1>", "<key concept 2>"]
    }
  ]
}`;

    if (!process.env.OPENROUTER_API_KEY) {
      return res.json({ success: true, questions: buildFallbackQuestions(domain, language, difficulty, count, types) });
    }

    const raw    = await callAI(prompt);
    const parsed = extractJSON(raw);

    if (parsed?.questions?.length > 0) {
      const questions = parsed.questions.map((q, i) => ({
        id:            i,
        type:          q.type          || types[i] || 'coding',
        title:         q.title         || `Question ${i + 1}`,
        description:   q.description   || 'No description available',
        category:      q.category      || domain,
        hint:          q.hint          || '',
        starterCode:   q.starterCode   || '',
        sampleInput:   q.sampleInput   || '',
        sampleOutput:  q.sampleOutput  || '',
        constraints:   Array.isArray(q.constraints) ? q.constraints : [],
        options:       Array.isArray(q.options)     ? q.options     : [],
        correctOption: typeof q.correctOption === 'number' ? q.correctOption : -1,
        solution:      q.solution      || '',
        timeComplexity:  q.timeComplexity  || '',
        spaceComplexity: q.spaceComplexity || '',
        explanation:   q.explanation   || '',
        concepts:      Array.isArray(q.concepts) ? q.concepts : [],
      }));
      return res.json({ success: true, questions });
    }

    return res.json({ success: true, questions: buildFallbackQuestions(domain, language, difficulty, count, types) });
  } catch (err) {
    console.error('generateQuestions error:', err.message);
    const { domain = 'DSA', language = 'javascript', difficulty = 'medium', count = 7 } = req.body;
    const types = (DOMAIN_TYPES[domain] || DOMAIN_TYPES.default).slice(0, count);
    return res.json({ success: true, questions: buildFallbackQuestions(domain, language, difficulty, count, types) });
  }
};

/* ─── POST /api/interview/evaluate ──────────────── */
export const evaluateAnswer = async (req, res) => {
  try {
    const { question, userAnswer, language = 'javascript', timeTaken = 0 } = req.body;

    if (!question) return res.status(400).json({ message: 'Question is required' });

    // MCQ — evaluate locally, no AI needed
    if (question.type === 'mcq') {
      const selectedIdx = parseInt(userAnswer, 10);
      const isCorrect   = selectedIdx === question.correctOption;
      return res.json({
        success: true,
        score:         isCorrect ? 100 : 0,
        verdict:       isCorrect ? 'PASS' : 'FAIL',
        feedback:      isCorrect
          ? `Correct! ${question.explanation || ''}`
          : `Incorrect. The correct answer is: ${question.options?.[question.correctOption] || 'N/A'}. ${question.explanation || ''}`,
        strengths:     isCorrect ? ['Correct answer selected'] : [],
        weaknesses:    isCorrect ? [] : ['Incorrect option chosen'],
        mistakes:      isCorrect ? [] : [`Selected option ${selectedIdx + 1}, correct is option ${question.correctOption + 1}`],
        correctedCode: question.solution || '',
        timeComplexity:  question.timeComplexity  || '',
        spaceComplexity: question.spaceComplexity || '',
      });
    }

    // Empty answer
    if (!userAnswer?.trim()) {
      return res.json({
        success: true,
        score: 0, verdict: 'FAIL',
        feedback:  'No answer provided.',
        strengths: [], weaknesses: ['No answer submitted'],
        mistakes:  ['Empty submission'],
        correctedCode: question.solution || '',
        timeComplexity:  question.timeComplexity  || '',
        spaceComplexity: question.spaceComplexity || '',
      });
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return res.json({
        success: true,
        score: 50, verdict: 'PARTIAL',
        feedback:  'AI evaluation unavailable. Partial score applied.',
        strengths: [], weaknesses: ['AI service not configured'],
        mistakes:  [],
        correctedCode: question.solution || '',
        timeComplexity:  question.timeComplexity  || '',
        spaceComplexity: question.spaceComplexity || '',
      });
    }

    const timeBonus = timeTaken < 120 ? 'fast response (bonus possible)' : timeTaken > 600 ? 'slow response (time penalty possible)' : 'normal pace';

    const prompt = `You are a strict FAANG-level technical interviewer evaluating a candidate's answer.

QUESTION TYPE: ${question.type}
QUESTION: ${question.title}
DESCRIPTION: ${question.description}
CATEGORY: ${question.category}
LANGUAGE: ${language}
TIME TAKEN: ${timeTaken}s (${timeBonus})
EXPECTED CONCEPTS: ${(question.concepts || []).join(', ') || 'N/A'}
REFERENCE SOLUTION: ${question.solution || 'N/A'}
EXPECTED TIME COMPLEXITY: ${question.timeComplexity || 'N/A'}

CANDIDATE ANSWER:
${userAnswer}

SCORING RULES:
- Start at 100. Deduct strictly:
  - Syntax error: -20
  - Wrong logic / incorrect algorithm: -30
  - Incorrect output: -25
  - Suboptimal complexity: -10 to -20
  - Missing edge cases: -10
  - Poor code quality/naming: -5
- If answer is empty or completely wrong: score = 0
- If answer is correct and optimal: score = 85-100
- Time bonus: if timeTaken < 120s and correct, add up to +5
- Clamp final score 0-100

Return ONLY this JSON:
{
  "score": <0-100>,
  "verdict": "PASS|FAIL",
  "feedback": "<3-5 sentence detailed evaluation>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>"],
  "mistakes": ["<specific mistake 1>", "<specific mistake 2>"],
  "correctedCode": "<complete optimized solution>",
  "timeComplexity": "<actual complexity of candidate solution>",
  "spaceComplexity": "<actual space complexity>"
}`;

    const raw    = await callAI(prompt);
    const parsed = extractJSON(raw);

    if (parsed && typeof parsed.score === 'number') {
      return res.json({
        success:         true,
        score:           Math.max(0, Math.min(100, parsed.score)),
        verdict:         parsed.verdict         || (parsed.score >= 70 ? 'PASS' : 'FAIL'),
        feedback:        parsed.feedback        || 'Evaluation complete.',
        strengths:       Array.isArray(parsed.strengths)  ? parsed.strengths  : [],
        weaknesses:      Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
        mistakes:        Array.isArray(parsed.mistakes)   ? parsed.mistakes   : [],
        correctedCode:   parsed.correctedCode   || question.solution || '',
        timeComplexity:  parsed.timeComplexity  || question.timeComplexity  || '',
        spaceComplexity: parsed.spaceComplexity || question.spaceComplexity || '',
      });
    }

    return res.json({
      success: true, score: 50, verdict: 'PARTIAL',
      feedback: 'Partial evaluation — AI response could not be parsed.',
      strengths: [], weaknesses: [], mistakes: [],
      correctedCode: question.solution || '',
      timeComplexity: question.timeComplexity || '', spaceComplexity: question.spaceComplexity || '',
    });
  } catch (err) {
    console.error('evaluateAnswer error:', err.message);
    return res.json({
      success: true, score: 50, verdict: 'PARTIAL',
      feedback: 'Evaluation failed due to a server error.',
      strengths: [], weaknesses: [], mistakes: [],
      correctedCode: req.body?.question?.solution || '',
      timeComplexity: '', spaceComplexity: '',
    });
  }
};

/* ─── POST /api/interview/session ───────────────── */
export const saveSession = async (req, res) => {
  try {
    const { role, domain, language, difficulty, totalTime, questions, answers } = req.body;

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: 'Answers are required' });
    }

    const submitted = answers.filter(a => !a.skipped);
    const skipped   = answers.filter(a =>  a.skipped);
    const scores    = submitted.map(a => a.score || 0);
    const totalScore = scores.length ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length) : 0;
    const correct   = submitted.filter(a => a.score >= 70).length;
    const wrong     = submitted.filter(a => a.score < 70).length;

    const grade =
      totalScore >= 95 ? 'A+' : totalScore >= 85 ? 'A' :
      totalScore >= 75 ? 'B+' : totalScore >= 65 ? 'B' :
      totalScore >= 50 ? 'C'  : 'D';

    // Aggregate strengths/weaknesses from all answers
    const allStrengths  = answers.flatMap(a => a.strengths  || []).slice(0, 5);
    const allWeaknesses = answers.flatMap(a => a.weaknesses || []).slice(0, 5);

    // Weak topics = categories where avg score < 60
    const topicScores = {};
    answers.forEach((a, i) => {
      const cat = questions?.[i]?.category || 'General';
      if (!topicScores[cat]) topicScores[cat] = [];
      topicScores[cat].push(a.score || 0);
    });
    const weakTopics = Object.entries(topicScores)
      .filter(([, scores]) => scores.reduce((s, v) => s + v, 0) / scores.length < 60)
      .map(([cat]) => cat);

    const improvements = allWeaknesses.slice(0, 3);

    const session = await InterviewSession.create({
      user:       req.user._id,
      role, domain, language, difficulty, totalTime,
      questions:  questions || [],
      answers,
      status:     'completed',
      totalScore, percentage: totalScore, grade,
      correct, wrong, skipped: skipped.length,
      strengths:  allStrengths,
      weaknesses: allWeaknesses,
      improvements, weakTopics,
      aiFeedback: totalScore >= 80
        ? 'Excellent performance! You demonstrated strong problem-solving skills.'
        : totalScore >= 60
        ? 'Good effort. Focus on optimizing your solutions and handling edge cases.'
        : 'Keep practicing. Review core concepts and work on fundamentals.',
      completedAt: new Date(),
    });

    res.status(201).json({ success: true, sessionId: session._id, totalScore, grade, correct, wrong, skipped: skipped.length });
  } catch (err) {
    console.error('saveSession error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

/* ─── GET /api/interview/history ────────────────── */
export const getHistory = async (req, res) => {
  try {
    const sessions = await InterviewSession.find({ user: req.user._id, status: 'completed' })
      .select('-questions -answers')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    res.json({ success: true, sessions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─── GET /api/interview/session/:id ────────────── */
export const getSession = async (req, res) => {
  try {
    const session = await InterviewSession.findOne({ _id: req.params.id, user: req.user._id }).lean();
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.json({ success: true, session });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ─── Fallback questions when AI is unavailable ── */
const buildFallbackQuestions = (domain, language, difficulty, count, types) => {
  const bank = {
    coding: {
      title: 'Two Sum',
      description: 'Given an array of integers and a target, return indices of two numbers that add up to the target.',
      category: 'Arrays', hint: 'Use a hash map to store complements.',
      starterCode: language === 'python' ? 'def two_sum(nums, target):\n    pass' : 'function twoSum(nums, target) {\n  \n}',
      sampleInput: 'nums=[2,7,11,15], target=9', sampleOutput: '[0,1]',
      constraints: ['2 <= nums.length <= 10^4', 'Exactly one solution exists'],
      solution: language === 'python'
        ? 'def two_sum(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        if target - n in seen: return [seen[target-n], i]\n        seen[n] = i'
        : 'function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const c = target - nums[i];\n    if (map.has(c)) return [map.get(c), i];\n    map.set(nums[i], i);\n  }\n}',
      timeComplexity: 'O(n)', spaceComplexity: 'O(n)',
      explanation: 'Use a hash map to store each number and its index. For each number, check if its complement exists.',
      concepts: ['hash map', 'complement lookup', 'single pass'],
    },
    mcq: {
      title: 'Time Complexity of Hash Map Lookup',
      description: 'What is the average time complexity of a hash map (dictionary) lookup operation?',
      category: 'Data Structures', hint: 'Think about how hash maps work internally.',
      starterCode: '', sampleInput: '', sampleOutput: '',
      constraints: [], options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], correctOption: 0,
      solution: 'O(1)', timeComplexity: 'O(1)', spaceComplexity: 'O(1)',
      explanation: 'Hash maps use a hash function to compute an index, giving O(1) average lookup time.',
      concepts: ['hash map', 'time complexity'],
    },
    bugfix: {
      title: 'Fix the Fibonacci Function',
      description: 'The following Fibonacci function has a bug. Find and fix it.',
      category: 'Recursion', hint: 'Check the base cases carefully.',
      starterCode: language === 'python'
        ? 'def fib(n):\n    if n == 0: return 1\n    if n == 1: return 1\n    return fib(n-1) + fib(n-2)'
        : 'function fib(n) {\n  if (n == 0) return 1;\n  if (n == 1) return 1;\n  return fib(n-1) + fib(n-2);\n}',
      sampleInput: 'fib(0)', sampleOutput: '0',
      constraints: ['n >= 0'],
      solution: language === 'python'
        ? 'def fib(n):\n    if n == 0: return 0  # Bug: was returning 1\n    if n == 1: return 1\n    return fib(n-1) + fib(n-2)'
        : 'function fib(n) {\n  if (n == 0) return 0; // Bug: was returning 1\n  if (n == 1) return 1;\n  return fib(n-1) + fib(n-2);\n}',
      timeComplexity: 'O(2^n)', spaceComplexity: 'O(n)',
      explanation: 'The base case for n=0 should return 0, not 1. fib(0) = 0 by definition.',
      concepts: ['recursion', 'base case', 'fibonacci'],
    },
    output: {
      title: 'Predict the Output',
      description: 'What will the following code print?',
      category: 'Language Fundamentals', hint: 'Trace through the code step by step.',
      starterCode: language === 'python'
        ? 'x = [1, 2, 3]\ny = x\ny.append(4)\nprint(x)'
        : 'const x = [1, 2, 3];\nconst y = x;\ny.push(4);\nconsole.log(x);',
      sampleInput: '', sampleOutput: '[1, 2, 3, 4]',
      constraints: [],
      solution: '[1, 2, 3, 4]',
      timeComplexity: 'O(1)', spaceComplexity: 'O(1)',
      explanation: 'Arrays are reference types. y = x makes y point to the same array, so modifying y also modifies x.',
      concepts: ['reference types', 'mutation', 'shallow copy'],
    },
    conceptual: {
      title: 'Explain Big-O Notation',
      description: 'Explain what Big-O notation is, why it matters, and give examples of O(1), O(n), and O(n²) operations.',
      category: 'Algorithms', hint: 'Think about how algorithm performance scales with input size.',
      starterCode: '', sampleInput: '', sampleOutput: '',
      constraints: [],
      solution: 'Big-O notation describes the upper bound of an algorithm\'s time or space complexity as input grows. O(1) = constant (array index access), O(n) = linear (single loop), O(n²) = quadratic (nested loops).',
      timeComplexity: '', spaceComplexity: '',
      explanation: 'Big-O helps compare algorithms independently of hardware. It focuses on the dominant term as n → ∞.',
      concepts: ['Big-O', 'time complexity', 'space complexity', 'asymptotic analysis'],
    },
  };

  return types.slice(0, count).map((type, i) => ({
    id: i,
    type,
    options: type === 'mcq' ? bank.mcq.options : [],
    correctOption: type === 'mcq' ? bank.mcq.correctOption : -1,
    ...(bank[type] || bank.coding),
  }));
};
