import axios from 'axios';

/* ─── Mode normalizer ────────────────────────────── */
export const normalizeMode = (mode) => {
  const lower = String(mode || '').toLowerCase().trim();
  if (lower.includes('student'))   return 'student';
  if (lower.includes('interview')) return 'interviewer';
  return 'developer';
};

/* ─── Explanation level context ──────────────────── */
// levelContexts - support for easy/medium/hard student mode levels
const getStudentLevelInstructions = (level) => {
  switch (level) {
    case 'easy':
      return `EXPLANATION LEVEL: EASY (Beginner)
- Use the simplest possible language. Imagine explaining to a 10-year-old.
- Avoid ALL technical jargon. If you must use a term, define it immediately.
- Use real-world analogies (e.g., "a variable is like a box that holds a value").
- Break every concept into tiny, numbered steps.
- Be very encouraging and positive.
- Explain EVERY line of the corrected code in plain English.`;
    case 'hard':
      return `EXPLANATION LEVEL: HARD (Advanced)
- Use precise technical language and computer science terminology.
- Discuss time complexity (Big-O), space complexity, and algorithmic trade-offs.
- Reference design patterns, SOLID principles, and architectural concerns.
- Explain optimization strategies and edge cases in depth.
- Provide interview-level depth — as if preparing for a senior engineer role.
- Discuss alternative approaches and their trade-offs.`;
    default:
      return `EXPLANATION LEVEL: MEDIUM (Intermediate)
- Use clear technical language but explain non-obvious concepts.
- Balance beginner-friendliness with technical accuracy.
- Mention complexity where relevant but don't over-explain basics.
- Provide practical examples alongside explanations.`;
  }
};

/* ─── Prompt builder ─────────────────────────────── */
const buildPrompt = (code, mode, customRules = [], enhancedContext = '') => {
  const rulesBlock = customRules.length > 0
    ? `\n\nADDITIONAL CUSTOM RULES (enforce these strictly):\n${customRules.map((r, i) => `${i + 1}. ${r}`).join('\n')}\n`
    : '';

  const contextBlock = enhancedContext
    ? `\n\nCONTEXT: ${enhancedContext}\n`
    : '';

  /* ── STUDENT MODE ── */
  if (mode === 'student') {
    return `You are a patient, encouraging AI coding teacher. Your ONLY job is to teach and explain code to a student.
${rulesBlock}${contextBlock}

${getStudentLevelInstructions(
  enhancedContext.includes('EASY') ? 'easy' :
  enhancedContext.includes('HARD') ? 'hard' : 'medium'
)}

YOUR TEACHING APPROACH:
- Start by identifying what the student was TRYING to do (give them credit).
- Explain each mistake in simple terms: WHAT is wrong, WHY it happens, HOW to fix it.
- Walk through the corrected code step by step.
- End with encouraging learning tips specific to the mistakes found.
- If the code is correct, celebrate it and explain WHY it is good.

SCORING RULES (for isCorrect field):
- isCorrect = true ONLY if the code is logically correct with no syntax errors and no major bugs.
- isCorrect = false if there are any syntax errors, logic bugs, or missing required logic.

STRICT OUTPUT: Return ONLY valid JSON. No markdown. No text outside JSON.

{
  "correctedCode": "<full corrected and improved code>",
  "explanation": "<detailed teaching explanation — minimum 8 sentences covering: what the code does, what mistakes exist, why they happen, how to fix them, what concept to learn>",
  "isCorrect": <true if code is correct, false if it has issues>,
  "codeScore": <integer 0-100 based on correctness and quality>,
  "mistakes": [
    {
      "issue": "<what is wrong in simple terms>",
      "whyItHappened": "<why beginners make this mistake>",
      "fix": "<simple fix explanation with example>"
    }
  ],
  "steps": ["<step 1: what this line/block does in plain English>", "<step 2>", "<step 3>", "<step 4>", "<step 5>"],
  "tips": ["<actionable learning tip 1>", "<actionable learning tip 2>", "<actionable learning tip 3>"],
  "conceptsToLearn": ["<concept 1 the student should study>", "<concept 2>"],
  "questions": [],
  "errors": [],
  "suggestions": [],
  "modeOutput": "<2-3 sentence friendly, encouraging summary. If correct: celebrate. If wrong: motivate to fix.>"
}

CODE TO TEACH:
\`\`\`
${code}
\`\`\``;
  }

  /* ── INTERVIEWER MODE ── */
  if (mode === 'interviewer') {
    const difficulty = enhancedContext.match(/difficulty:\s*(\w+)/i)?.[1] || 'medium';
    return `You are a strict FAANG-level technical interviewer. Evaluate this candidate's code submission as if it were a real coding interview.
${rulesBlock}${contextBlock}

CRITICAL EMPTY/TEMPLATE CHECK (evaluate FIRST before anything else):
- If the code is empty, blank, or only whitespace → score = 0, verdict = "FAIL", isCorrect = false
- If the code is only a boilerplate/template with no real logic (e.g. just "function solution() {}" or "def solution(): pass" with nothing inside) → score = 0, verdict = "FAIL", isCorrect = false
- Only proceed with full evaluation if the candidate has written actual logic

YOUR EVALUATION CRITERIA:
1. CORRECTNESS — Does the code solve the problem? Handle edge cases?
2. EFFICIENCY — What is the time and space complexity? Is it optimal?
3. CODE QUALITY — Is it clean, readable, well-named, properly structured?
4. EDGE CASES — Does it handle null, empty, negative, large inputs?
5. BEST PRACTICES — Proper error handling, no anti-patterns?

VERDICT RULES:
- verdict = "PASS" if: code is logically correct AND score >= 70
- verdict = "FAIL" if: code is empty/template OR has bugs OR score < 70
- isCorrect = true ONLY if the solution is logically correct and handles the main cases
- score: integer 0-100 based on all criteria above (0 for empty/template)

SCORING BREAKDOWN (only if code has real logic):
- Correctness: 40 points
- Efficiency/Complexity: 20 points  
- Code Quality: 20 points
- Edge Cases: 10 points
- Best Practices: 10 points

STRICT OUTPUT: Return ONLY valid JSON. No markdown. No text outside JSON.

{
  "correctedCode": "<optimized, production-quality version of the solution>",
  "explanation": "<strict interviewer evaluation — 5+ sentences covering: correctness verdict, complexity analysis, code quality assessment, edge case handling, overall interview readiness>",
  "isCorrect": <true if solution is logically correct, false otherwise>,
  "verdict": "<PASS or FAIL>",
  "score": <integer 0-100>,
  "timeComplexity": "<e.g. O(n), O(n log n), O(n²)>",
  "spaceComplexity": "<e.g. O(1), O(n)>",
  "strengths": ["<what the candidate did well 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<what was wrong or missing 1>", "<weakness 2>"],
  "missedEdgeCases": ["<edge case not handled 1>", "<edge case 2>"],
  "optimizationSuggestion": "<one concrete optimization with explanation>",
  "commonMistakes": ["<common mistake for this problem type 1>", "<mistake 2>", "<mistake 3>"],
  "interviewerRemark": "<1-2 sentence blunt interviewer-style remark about the submission>",
  "questions": [
    { "question": "<easy follow-up question>", "answer": "<detailed 4+ sentence answer>", "difficulty": "easy" },
    { "question": "<easy follow-up question>", "answer": "<detailed answer>", "difficulty": "easy" },
    { "question": "<medium follow-up question>", "answer": "<detailed answer>", "difficulty": "medium" },
    { "question": "<medium follow-up question>", "answer": "<detailed answer>", "difficulty": "medium" },
    { "question": "<hard follow-up question>", "answer": "<detailed answer>", "difficulty": "hard" },
    { "question": "<hard follow-up question>", "answer": "<detailed answer>", "difficulty": "hard" }
  ],
  "mistakes": [],
  "steps": [],
  "tips": [],
  "errors": [],
  "suggestions": ["<improvement suggestion 1>", "<improvement suggestion 2>", "<improvement suggestion 3>"],
  "modeOutput": "<2-3 sentence honest interview readiness assessment. State PASS/FAIL clearly and why.>"
}

CODE TO EVALUATE:
\`\`\`
${code}
\`\`\``;
  }

  /* ── DEVELOPER MODE ── */
  return `You are a senior software engineer and tech lead performing a production-grade code review before deployment.
${rulesBlock}${contextBlock}

YOUR REVIEW FOCUS:
1. SECURITY — Injection, XSS, hardcoded secrets, improper auth, insecure dependencies
2. PERFORMANCE — Algorithmic complexity, N+1 queries, memory leaks, blocking operations
3. ARCHITECTURE — SOLID principles, separation of concerns, design patterns, anti-patterns
4. SCALABILITY — Will this break under load? Race conditions? Stateful issues?
5. MAINTAINABILITY — Readability, naming, DRY violations, dead code, tech debt
6. ERROR HANDLING — Missing try/catch, unhandled promises, no input validation
7. PRODUCTION READINESS — Logging, monitoring hooks, graceful degradation

SCORING RULES:
- isCorrect = true if code is functionally correct with no critical/high severity issues
- Start at 100, deduct: critical=-25, high=-15, medium=-8, low=-3
- If no errors found: isCorrect=true, score=100

STRICT OUTPUT: Return ONLY valid JSON. No markdown. No text outside JSON.

{
  "correctedCode": "<fully refactored, production-ready version with all issues fixed>",
  "explanation": "<thorough senior engineer review — minimum 10 sentences covering: overall assessment, architecture quality, security posture, performance characteristics, maintainability score, what must be fixed before shipping>",
  "isCorrect": <true if no critical/high issues, false otherwise>,
  "productionReady": <true if safe to deploy, false otherwise>,
  "errors": [
    {
      "line": <integer line number or 0>,
      "category": "<security | logic | performance | syntax | style | architecture | scalability>",
      "severity": "<low | medium | high | critical>",
      "message": "<precise description of the issue>",
      "why": "<why this is a production problem — business/technical impact>",
      "fix": "<concrete fix with code snippet if possible>"
    }
  ],
  "securityIssues": ["<security concern 1>", "<security concern 2>"],
  "performanceIssues": ["<performance concern 1>", "<performance concern 2>"],
  "suggestions": [
    "<production improvement 1 with reasoning>",
    "<production improvement 2 with reasoning>",
    "<production improvement 3 with reasoning>"
  ],
  "designPatterns": ["<applicable design pattern 1>", "<pattern 2>"],
  "mistakes": [],
  "steps": [],
  "tips": [],
  "questions": [],
  "modeOutput": "<structured production readiness verdict: overall grade (A/B/C/D/F), what passes review, what MUST be fixed before shipping, estimated refactor effort — 4-5 sentences>"
}

CODE TO REVIEW:
\`\`\`
${code}
\`\`\``;
};

/* ─── JSON extractor ─────────────────────────────── */
const extractJSON = (text) => {
  if (!text) return null;
  try {
    let clean = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    const start = clean.indexOf('{');
    const end   = clean.lastIndexOf('}');
    if (start === -1 || end === -1) return null;
    return JSON.parse(clean.slice(start, end + 1));
  } catch {
    return null;
  }
};

/* ─── OpenRouter call ────────────────────────────── */
const callAI = async (prompt) => {
  const res = await axios.post(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      model:    process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini',
      messages: [
        {
          role:    'system',
          content: 'You are a strict JSON API. Output ONLY valid JSON objects. Never output markdown, code fences, or any text outside the JSON object.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.1,
    },
    {
      headers: {
        Authorization:  `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.OPENROUTER_HTTP_REFERER || 'http://localhost:5173',
        'X-Title':      process.env.OPENROUTER_APP_NAME     || 'DevInspectAI',
      },
      timeout: 45000,
    }
  );
  return res.data?.choices?.[0]?.message?.content || null;
};

/* ─── Fallback ───────────────────────────────────── */
const fallback = (code, mode) => {
  const base = {
    correctedCode: code,
    explanation:   'AI service is currently unavailable. Please configure your OPENROUTER_API_KEY in the backend .env file.',
    mistakes:      [],
    steps:         [],
    tips:          [],
    questions:     [],
    errors:        [],
    suggestions:   [],
    modeOutput:    'Running in offline fallback mode. Configure AI API keys for full analysis.',
    degraded:      true,
    isCorrect:     false,
    productionReady: false,
    verdict:       'FAIL',
    score:         0,
    timeComplexity: 'Unknown',
    spaceComplexity: 'Unknown',
    optimizationSuggestion: '',
    commonMistakes: [],
    strengths: [],
    weaknesses: [],
    missedEdgeCases: [],
    interviewerRemark: '',
    securityIssues: [],
    performanceIssues: [],
    designPatterns: [],
    conceptsToLearn: [],
    codeScore: 0,
  };

  if (mode === 'interviewer') {
    base.questions = [
      { question: 'What does this code do at a high level?',     answer: 'Review the code manually to determine its purpose and describe the overall logic flow.',              difficulty: 'easy'   },
      { question: 'What data structures are used?',              answer: 'Identify all variables, arrays, objects, or other data structures present in the code.',              difficulty: 'easy'   },
      { question: 'Are there any potential bugs?',               answer: 'Look for off-by-one errors, null reference issues, or incorrect conditional logic.',                  difficulty: 'medium' },
      { question: 'How would you improve the performance?',      answer: 'Consider algorithmic complexity, unnecessary loops, and opportunities for caching or memoization.',   difficulty: 'medium' },
      { question: 'What security vulnerabilities exist?',        answer: 'Check for injection risks, hardcoded secrets, improper input validation, and insecure data handling.', difficulty: 'hard'   },
      { question: 'How would you refactor this for production?', answer: 'Consider error handling, logging, modularity, testability, and adherence to SOLID principles.',       difficulty: 'hard'   },
    ];
  }

  return base;
};

/* ─── Normalize AI output ────────────────────────── */
const normalize = (ai, code, mode) => ({
  correctedCode:          typeof ai.correctedCode === 'string' && ai.correctedCode.trim() ? ai.correctedCode : code,
  explanation:            typeof ai.explanation   === 'string' ? ai.explanation   : '',
  mistakes:               Array.isArray(ai.mistakes)    ? ai.mistakes    : [],
  steps:                  Array.isArray(ai.steps)       ? ai.steps       : [],
  tips:                   Array.isArray(ai.tips)        ? ai.tips        : [],
  questions:              Array.isArray(ai.questions)   ? ai.questions   : [],
  errors:                 Array.isArray(ai.errors)      ? ai.errors      : [],
  suggestions:            Array.isArray(ai.suggestions) ? ai.suggestions : [],
  modeOutput:             typeof ai.modeOutput === 'string' ? ai.modeOutput : '',
  degraded:               false,
  // Shared correctness
  isCorrect:              typeof ai.isCorrect === 'boolean' ? ai.isCorrect : false,
  // Interviewer-specific
  verdict:                typeof ai.verdict   === 'string'  ? ai.verdict   : (ai.isCorrect ? 'PASS' : 'FAIL'),
  score:                  typeof ai.score     === 'number'  ? ai.score     : 0,
  timeComplexity:         typeof ai.timeComplexity  === 'string' ? ai.timeComplexity  : '',
  spaceComplexity:        typeof ai.spaceComplexity === 'string' ? ai.spaceComplexity : '',
  optimizationSuggestion: typeof ai.optimizationSuggestion === 'string' ? ai.optimizationSuggestion : '',
  commonMistakes:         Array.isArray(ai.commonMistakes)   ? ai.commonMistakes   : [],
  strengths:              Array.isArray(ai.strengths)        ? ai.strengths        : [],
  weaknesses:             Array.isArray(ai.weaknesses)       ? ai.weaknesses       : [],
  missedEdgeCases:        Array.isArray(ai.missedEdgeCases)  ? ai.missedEdgeCases  : [],
  interviewerRemark:      typeof ai.interviewerRemark === 'string' ? ai.interviewerRemark : '',
  // Developer-specific
  productionReady:        typeof ai.productionReady === 'boolean' ? ai.productionReady : false,
  securityIssues:         Array.isArray(ai.securityIssues)   ? ai.securityIssues   : [],
  performanceIssues:      Array.isArray(ai.performanceIssues)? ai.performanceIssues : [],
  designPatterns:         Array.isArray(ai.designPatterns)   ? ai.designPatterns   : [],
  // Student-specific
  codeScore:              typeof ai.codeScore === 'number' ? ai.codeScore : 0,
  conceptsToLearn:        Array.isArray(ai.conceptsToLearn)  ? ai.conceptsToLearn  : [],
});

/* ─── Main export ────────────────────────────────── */
export const analyzeContent = async (code, mode, customRules = [], enhancedContext = '') => {
  const finalMode = normalizeMode(mode);

  if (!process.env.OPENROUTER_API_KEY) {
    return fallback(code, finalMode);
  }

  try {
    const prompt  = buildPrompt(code, finalMode, customRules, enhancedContext);
    const rawText = await callAI(prompt);
    let   ai      = extractJSON(rawText);

    if (!ai) {
      console.warn('First AI parse failed, retrying...');
      const retryText = await callAI(prompt);
      ai = extractJSON(retryText);
    }

    if (!ai) {
      console.error('AI returned unparseable JSON after retry');
      return fallback(code, finalMode);
    }

    const result = normalize(ai, code, finalMode);

    // Guarantee interviewer always has 6 questions
    if (finalMode === 'interviewer' && result.questions.length < 5) {
      result.questions = fallback(code, finalMode).questions;
    }

    return result;
  } catch (err) {
    console.error('AI service error:', err.message);
    return fallback(code, finalMode);
  }
};
