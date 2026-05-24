import User from '../models/User.js';
import Analysis from '../models/Analysis.js';
import Workspace from '../models/Workspace.js';
import crypto from 'crypto';

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const allowed = ['name', 'currentMode', 'customRules', 'githubUser', 'githubToken', 'avatar'];
    for (const field of allowed) {
      if (req.body[field] !== undefined) user[field] = req.body[field];
    }

    if (req.body.password) user.password = req.body.password;

    // Generate API key on request
    if (req.body.generateApiKey) {
      user.apiKey = crypto.randomBytes(24).toString('hex');
    }

    const updated = await user.save();

    res.json({
      _id:          updated._id,
      name:         updated.name,
      email:        updated.email,
      role:         updated.role,
      currentMode:  updated.currentMode,
      customRules:  updated.customRules,
      apiKey:       updated.apiKey,
      githubUser:   updated.githubUser,
      avatar:       updated.avatar,
      streak:       updated.streak,
      longestStreak: updated.longestStreak,
      xp:           updated.xp,
      badges:       updated.badges,
      createdAt:    updated.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    await Analysis.deleteMany({ user: userId });
    await Workspace.updateMany({ members: userId }, { $pull: { members: userId } });
    await Workspace.deleteMany({ owner: userId });
    await User.findByIdAndDelete(userId);
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
