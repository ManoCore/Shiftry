// const jwt = require('jsonwebtoken');
// const User = require('../models/user');

// module.exports = async (req, res, next) => {
//   try {
//     // 1. Get token from header
//     const authHeader = req.header('Authorization');
//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       return res.status(401).json({ 
//         success: false,
//         message: 'No token provided or invalid format' 
//       });
//     }
    
//     const token = authHeader.replace('Bearer ', '');

//     // 2. Verify token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
//     // 3. Find user and attach to request
//     const user = await User.findOne({ 
//       _id: decoded.userId,
//       status: 'active' // Only allow active users
//     }).select('-passwordHash -inviteToken'); // Exclude sensitive fields
    
//     if (!user) {
//       return res.status(401).json({ 
//         success: false,
//         message: 'User not found or inactive' 
//       });
//     }

//     // Attach user to request
//     req.user = user;
//     next();
//   } catch (err) {
//     console.error('Authentication error:', err.message);
    
//     let message = 'Authentication failed';
//     if (err.name === 'TokenExpiredError') {
//       message = 'Token expired';
//     } else if (err.name === 'JsonWebTokenError') {
//       message = 'Invalid token';
//     }

//     res.status(401).json({ 
//       success: false,
//       message 
//     });
//   }
// };


// In src/middleware/auth.js (or authMiddleware.js)

const jwt = require('jsonwebtoken');
const User = require('../models/user'); // Ensure correct path and casing
const ErrorResponse = require('../utils/errorResponse'); // Ensure correct path

// Protect routes
exports.protect = async (req, res, next) => {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
        console.log("DEBUG: Token found in Authorization header:", token); // DEBUG LOG
    } else {
        console.log("DEBUG: No token found in Authorization header."); // DEBUG LOG
    }
    // You might also check for token in cookies if you send it that way
    // else if (req.cookies.token) {
    //     token = req.cookies.token;
    // }

    // Make sure token exists
    if (!token) {
        console.log("DEBUG: No token provided, returning 401."); // DEBUG LOG
        return next(new ErrorResponse('Not authorized to access this route: No token provided', 401));
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Use process.env.JWT_SECRET
        console.log("DEBUG: Decoded JWT payload:", decoded); // DEBUG LOG - CRITICAL

        // Find user by ID from the token
        const user = await User.findById(decoded.userId); // Use decoded.userId as per your token payload

        if (!user) {
            console.log("DEBUG: User not found for decoded userId:", decoded.userId); // DEBUG LOG
            return next(new ErrorResponse('Not authorized to access this route: User not found', 401));
        }

        // Attach user, organizationId, and organizationName to the request object
        req.user = user;
        req.organizationId = decoded.organizationId; // <--- CRITICAL: Extract from decoded token
        req.organizationName = decoded.organizationName; // <--- CRITICAL: Extract from decoded token
        console.log("DEBUG: req.organizationId set to:", req.organizationId); // DEBUG LOG - CRITICAL
        console.log("DEBUG: req.organizationName set to:", req.organizationName); // DEBUG LOG

        next(); // Proceed to the next middleware/route handler

    } catch (err) {
        console.error("DEBUG: Token verification error in protect middleware:", err.message); // DEBUG LOG
        if (err.name === 'TokenExpiredError') {
            return next(new ErrorResponse('Not authorized to access this route: Token expired', 401));
        }
        return next(new ErrorResponse('Not authorized to access this route: Invalid token', 401));
    }
};

// Authorize roles
exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role || !roles.includes(req.user.role)) {
            return next(
                new ErrorResponse(
                    `User role '${req.user ? req.user.role : 'unknown'}' is not authorized to access this route`,
                    403
                )
            );
        }
        next();
    };
};
