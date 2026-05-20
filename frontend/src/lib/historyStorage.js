const STORAGE_KEY = "devinspect-history";

export const normalizeMode = (mode) => {
  const lower = String(mode || "developer").toLowerCase();
  if (lower.includes("student")) return "student";
  if (lower.includes("interview")) return "interviewer";
  if (lower.includes("developer")) return "developer";
  return lower;
};

export const computeAiScore = (errors = []) => {
  const count = Array.isArray(errors) ? errors.length : 0;
  return Math.max(0, Math.min(100, 100 - count * 12));
};

export const getReviews = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const saveReview = (review) => {
  try {
    const existing = getReviews();
    const errors = review.errors || [];
    const mode = normalizeMode(review.mode);

    const newReview = {
      id: Date.now(),
      timestamp: review.timestamp || new Date().toISOString(),
      language: review.language || "javascript",
      mode,
      input: review.input || "",
      prompt: review.prompt || "",
      correctedCode: review.correctedCode || "",
      explanation: review.explanation || "",
      modeOutput: review.modeOutput || "",
      errors,
      issues: errors,
      aiScore: computeAiScore(errors),
    };

    existing.unshift(newReview);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    return newReview;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const deleteReview = (id) => {
  try {
    const existing = getReviews();
    const filtered = existing.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const clearAllReviews = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const getAnalytics = () => {
  const reviews = getReviews();
  const modeCounts = { student: 0, interviewer: 0, developer: 0 };

  reviews.forEach((review) => {
    const mode = normalizeMode(review.mode);
    if (modeCounts[mode] !== undefined) {
      modeCounts[mode] += 1;
    }
  });

  const totalIssues = reviews.reduce(
    (sum, review) => sum + (review.errors?.length || 0),
    0
  );

  const avgScore = reviews.length
    ? Math.round(
        reviews.reduce((sum, review) => sum + (review.aiScore || 0), 0) /
          reviews.length
      )
    : 0;

  const languageCounts = reviews.reduce((acc, review) => {
    const lang = (review.language || "unknown").toLowerCase();
    acc[lang] = (acc[lang] || 0) + 1;
    return acc;
  }, {});

  const topLanguage =
    Object.entries(languageCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    "—";

  return {
    totalAnalyses: reviews.length,
    modeCounts,
    recentActivity: reviews.slice(0, 6),
    totalIssues,
    avgScore,
    topLanguage,
  };
};
