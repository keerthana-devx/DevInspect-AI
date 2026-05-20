const User = require('../models/User');
const { sendSuccess } = require('../utils/responseHandler');

const getProfile = async (req, res, next) => {
  try {
    return sendSuccess(res, req.user, 'Profile fetched');
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    return sendSuccess(res, users, 'Users retrieved');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  getAllUsers,
};
