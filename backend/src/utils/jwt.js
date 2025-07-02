const jwt = require('jsonwebtoken');
const User = require('../models/user');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.emailId,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
};

const verifyToken = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-passwordHash');
    return { valid: true, user };
  } catch (err) {
    return { valid: false, error: err.message };
  }
};

module.exports = {
  generateToken,
  verifyToken
};