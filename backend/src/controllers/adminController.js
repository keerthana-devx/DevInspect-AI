import User from '../models/User.js';
import Analysis from '../models/Analysis.js';

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').lean();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllAnalyses = async (req, res) => {
  try {
    const analyses = await Analysis.find({})
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .lean();
    res.json(analyses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await Analysis.deleteMany({ user: req.params.id });
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStats = async (req, res) => {
  try {
    const [totalUsers, totalAnalyses, recentUsers] = await Promise.all([
      User.countDocuments(),
      Analysis.countDocuments(),
      User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
    ]);

    const modeStats = await Analysis.aggregate([
      { $group: { _id: '$mode', count: { $sum: 1 } } },
    ]);

    res.json({ totalUsers, totalAnalyses, activeUsers: recentUsers, modeStats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
