const { sendError } = require('../utils/responseHandler');

const roleMiddleware = (roles = []) => {
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return sendError(res, 'Forbidden', 403);
    }

    next();
  };
};

module.exports = roleMiddleware;
