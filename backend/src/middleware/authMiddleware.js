const jwt = require('jsonwebtoken');
const User = require('../models/user');
const ErrorResponse = require('../utils/errorResponse');

// Protect routes - user must be authenticated
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new ErrorResponse('Not authorized to access this route', 401));
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const user = await User.findById(decoded.userId).select('-passwordHash');
    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    // Check if user is active
    if (user.status !== 'active') {
      return next(new ErrorResponse('User account is inactive', 401));
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (err) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
};

// Grant access to specific roles
exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(`User role ${req.user.role} is not authorized to access this route`, 403)
      );
    }
    next();
  };
};