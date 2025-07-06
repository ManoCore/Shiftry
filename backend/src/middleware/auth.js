const jwt = require('jsonwebtoken');
const User = require('../models/user');

module.exports = async (req, res, next) => {
  try {
    // 1. Get token from header
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        message: 'No token provided or invalid format' 
      });
    }
    
    const token = authHeader.replace('Bearer ', '');

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Find user and attach to request
    const user = await User.findOne({ 
      _id: decoded.userId,
      status: 'active' // Only allow active users
    }).select('-passwordHash -inviteToken'); // Exclude sensitive fields
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'User not found or inactive' 
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (err) {
    console.error('Authentication error:', err.message);
    
    let message = 'Authentication failed';
    if (err.name === 'TokenExpiredError') {
      message = 'Token expired';
    } else if (err.name === 'JsonWebTokenError') {
      message = 'Invalid token';
    }

    res.status(401).json({ 
      success: false,
      message 
    });
  }
};