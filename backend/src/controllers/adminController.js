import User from "../models/User.js";
import Analysis from "../models/Analysis.js";

/* =========================
   GET ALL USERS (ADMIN)
========================= */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    res.json({
      totalUsers: users.length,
      users,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   GET USER ANALYSIS HISTORY
========================= */
export const getUserHistory = async (req, res) => {
  try {
    const userId = req.params.id;

    const history = await Analysis.find({ user: userId })
      .sort({ createdAt: -1 });

    res.json({
      totalAnalyses: history.length,
      history,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   GET SYSTEM OVERVIEW (DASHBOARD)
========================= */
export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAnalyses = await Analysis.countDocuments();

    const recentAnalyses = await Analysis.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      totalUsers,
      totalAnalyses,
      recentAnalyses,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};