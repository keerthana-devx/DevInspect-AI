import User from '../models/User.js';
import Analysis from '../models/Analysis.js';
import Workspace from '../models/Workspace.js';

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Allowed fields to update
    const allowedFields = ['name', 'email', 'role', 'currentMode', 'customRules', 'apiKey', 'githubUser'];
    
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    }

    // Update password if provided
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();
    
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      currentMode: updatedUser.currentMode,
      customRules: updatedUser.customRules,
      apiKey: updatedUser.apiKey,
      githubUser: updatedUser.githubUser,
      createdAt: updatedUser.createdAt,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete user account
// @route   DELETE /api/user/profile
// @access  Private
export const deleteUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    // Delete all user's analyses
    await Analysis.deleteMany({ userId });

    // Remove user from all workspaces
    await Workspace.updateMany(
      { members: userId },
      { $pull: { members: userId } }
    );

    // Delete user's owned workspaces
    await Workspace.deleteMany({ owner: userId });

    // Delete user
    await User.findByIdAndDelete(userId);

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all users (admin only)
// @route   GET /api/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};