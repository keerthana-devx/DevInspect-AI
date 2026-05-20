const History = require('../models/History');
const { sendSuccess, sendError } = require('../utils/responseHandler');

const getHistory = async (req, res, next) => {
  try {
    const history = await History.find({ user: req.user._id }).sort({ createdAt: -1 });
    return sendSuccess(res, history, 'History retrieved');
  } catch (error) {
    next(error);
  }
};

const addHistoryEntry = async (req, res, next) => {
  try {
    const { action, details } = req.body;
    const entry = await History.create({
      user: req.user._id,
      action,
      details,
    });
    return sendSuccess(res, entry, 'History entry added', 201);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHistory,
  addHistoryEntry,
};
