import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { motion, AnimatePresence } from "framer-motion";

import { useAuth } from "@/contexts/AuthContext.jsx";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

const AnalyzerPage = () => {
  const { currentMode, currentUser } = useAuth();

  const username =
    currentUser?.name || currentUser?.email || "Guest User";

  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  /* =========================
      RUN ANALYSIS
  ========================== */
  const handleRun = async () => {
    if (!code.trim()) return alert("Enter code");
    if (!language.trim()) return alert("Enter language");

    setLoading(true);
    setResult(null);

    await new Promise((r) => setTimeout(r, 600));

    const output = aiEngine(code, language, prompt, currentMode);

    setResult(output);
    setLoading(false);
  };

  /* =========================
      🧠 AI ENGINE (UPGRADED)
  ========================== */
  const aiEngine = (code, lang, prompt, mode) => {
    const lower = code.toLowerCase();

    let issues = [];

    if (lower.includes("var ")) {
      issues.push("Avoid using var, use let/const");
    }

    if (lower.includes("console.log") && !code.includes(";")) {
      issues.push("Missing semicolon in console.log");
    }

    if (lower.includes("for") && !lower.includes("let")) {
      issues.push("Loop variable not declared properly");
    }

    const isCorrect = issues.length === 0;

    const fixedCode = code
      .replace(/var /g, "let ")
      .replace(/console\.log\((.*?)\)/g, "console.log($1);");

    /* =========================
        🎓 STUDENT MODE
    ========================== */
    if (mode === "student") {
      return {
        mode: "Student Mode",
        status: isCorrect ? "Correct Code ✅" : "Mistakes Found ❌",

        problems: issues.length
          ? issues
          : ["No mistakes found"],

        correctedCode: isCorrect ? code : fixedCode,

        explanation: isCorrect
          ? "Your code is correct 👍 Keep practicing!"
          : "Fix the mistakes shown above and understand basics like syntax, loops, and variables.",
      };
    }

    /* =========================
        🧑‍💻 DEVELOPER MODE
    ========================== */
    if (mode === "developer") {
      return {
        mode: "Developer Mode",
        status: isCorrect ? "Clean Code ✅" : "Needs Improvement ⚠️",

        problems: issues,

        correctedCode: fixedCode,

        explanation:
          "This code review focuses on production-level quality, clean structure, and best practices used in real companies.",

        suggestions: [
          "Use const/let properly",
          "Avoid global variables",
          "Write reusable functions",
          "Follow clean code standards",
        ],
      };
    }

    /* =========================
        🎤 INTERVIEW MODE
    ========================== */
    return {
      mode: "Interview Mode",
      status: isCorrect ? "Strong Answer ✅" : "Needs Refinement ⚠️",

      problems: issues,

      correctedCode: fixedCode,

      explanation:
        "In interviews, focus on logic, edge cases, and clarity. Always explain WHY your solution works.",

      interviewQuestions: [
        "Explain your approach step by step",
        "What edge cases can break this code?",
        "What is time complexity?",
        "How would you optimize this further?",
        "Can you write alternative solutions?",
      ],

      realWorldInsight:
        "This type of logic is commonly used in backend APIs, automation scripts, and system workflows in real companies.",
    };
  };

  /* =========================
      OUTPUT UI
  ========================== */
  const renderOutput = () => {
    if (!result) return null;

    return (
      <div className="p-5 space-y-5 bg-[#0b1220] border border-gray-700 rounded-xl text-white">

        {/* MODE */}
        <div className="text-blue-400 font-bold">
          {result.mode}
        </div>

        {/* STATUS */}
        <div className="p-3 bg-[#111c33] border-l-4 border-blue-500 rounded">
          <strong>{result.status}</strong>
        </div>

        {/* PROBLEMS */}
        <div className="p-3 bg-[#111c33] border-l-4 border-red-500 rounded">
          <h3 className="text-red-400 font-bold">Issues</h3>

          {result.problems.map((p, i) => (
            <p key={i}>• {p}</p>
          ))}
        </div>

        {/* CODE */}
        <div className="p-3 bg-[#111c33] border-l-4 border-green-500 rounded">
          <h3 className="text-green-400 font-bold">Corrected Code</h3>

          <pre className="bg-black p-3 text-green-300 overflow-auto text-xs">
            {result.correctedCode}
          </pre>
        </div>

        {/* EXPLANATION */}
        <div className="p-3 bg-[#111c33] border-l-4 border-yellow-500 rounded">
          <h3 className="text-yellow-400 font-bold">Explanation</h3>
          <p>{result.explanation}</p>
        </div>

        {/* INTERVIEW MODE ONLY */}
        {result.interviewQuestions && (
          <div className="p-3 bg-[#111c33] border-l-4 border-purple-500 rounded">
            <h3 className="text-purple-400 font-bold">
              Interview Questions
            </h3>

            {result.interviewQuestions.map((q, i) => (
              <p key={i}>• {q}</p>
            ))}
          </div>
        )}

        {/* REAL WORLD INSIGHT */}
        {result.realWorldInsight && (
          <div className="p-3 bg-[#111c33] border-l-4 border-cyan-500 rounded">
            <h3 className="text-cyan-400 font-bold">
              Real World Insight
            </h3>
            <p>{result.realWorldInsight}</p>
          </div>
        )}

      </div>
    );
  };

  /* =========================
      MAIN UI
  ========================== */
  return (
    <>
      <Helmet>
        <title>AI Code Analyzer</title>
      </Helmet>

      <div className="p-6 grid grid-cols-2 gap-6 bg-[#070b14] min-h-screen text-white">

        {/* LEFT */}
        <div className="space-y-4">

          <div className="p-4 bg-[#111827] rounded">
            <h2>👤 {username}</h2>
            <p>Mode: {currentMode}</p>
          </div>

          <Textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="min-h-[200px] bg-[#111827]"
            placeholder="Paste code..."
          />

          <Input
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            placeholder="Language"
          />

          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Optional prompt"
          />

          <Button onClick={handleRun}>
            {loading ? "Analyzing..." : "Run Analysis"}
          </Button>

        </div>

        {/* RIGHT */}
        <div>
          <h2>AI Output</h2>

          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {renderOutput()}
              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </div>
    </>
  );
};

export default AnalyzerPage;