// const jwt = require('jsonwebtoken');
// const User = require('../models/user');
// const ErrorResponse = require('../utils/errorResponse');

// // Protect routes - user must be authenticated
// exports.protect = async (req, res, next) => {
//   try {
//     let token;

//     // Check for token in Authorization header
//     if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
//       token = req.headers.authorization.split(' ')[1];
//     }

//     if (!token) {
//       return next(new ErrorResponse('Not authorized to access this route', 401));
//     }

//     // Verify token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     // Check if user still exists
//     const user = await User.findById(decoded.userId).select('-passwordHash');
//     if (!user) {
//       return next(new ErrorResponse('User not found', 404));
//     }

//     // Check if user is active
//     if (user.status !== 'active') {
//       return next(new ErrorResponse('User account is inactive', 401));
//     }

//     // Attach user to request
//     req.user = user;
//     next();
//   } catch (err) {
//     return next(new ErrorResponse('Not authorized to access this route', 401));
//   }
// };

// // Grant access to specific roles
// exports.authorizeRoles = (...roles) => {
//   return (req, res, next) => {
//     if (!roles.includes(req.user.role)) {
//       return next(
//         new ErrorResponse(`User role ${req.user.role} is not authorized to access this route`, 403)
//       );
//     }
//     next();
//   };
// };

// In src/middleware/authMiddleware.js (ensure this is the exact file name)

const jwt = require('jsonwebtoken');
const User = require('../models/user'); // Ensure correct path and casing
const ErrorResponse = require('../utils/errorResponse'); // Ensure correct path

// Protect routes
exports.protect = async (req, res, next) => {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
        console.log("DEBUG: [AuthMiddleware] Token found in Authorization header:", token); // DEBUG LOG
    } else {
        console.log("DEBUG: [AuthMiddleware] No token found in Authorization header."); // DEBUG LOG
    }
    // You might also check for token in cookies if you send it that way
    // else if (req.cookies.token) {
    //     token = req.cookies.token;
    // }

    // Make sure token exists
    if (!token) {
        console.log("DEBUG: [AuthMiddleware] No token provided, returning 401."); // DEBUG LOG
        return next(new ErrorResponse('Not authorized to access this route: No token provided', 401));
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Use process.env.JWT_SECRET
        console.log("DEBUG: [AuthMiddleware] Decoded JWT payload:", decoded); // DEBUG LOG - CRITICAL

        // Find user by ID from the token
        const user = await User.findById(decoded.userId); // Use decoded.userId as per your token payload

        if (!user) {
            console.log("DEBUG: [AuthMiddleware] User not found for decoded userId:", decoded.userId); // DEBUG LOG
            return next(new ErrorResponse('Not authorized to access this route: User not found', 401));
        }

        // Attach user, organizationId, and organizationName to the request object
        req.user = user;
        req.organizationId = decoded.organizationId; // <--- CRITICAL: Extract from decoded token
        req.organizationName = decoded.organizationName; // <--- CRITICAL: Extract from decoded token
        console.log("DEBUG: [AuthMiddleware] req.organizationId set to:", req.organizationId); // DEBUG LOG - CRITICAL
        console.log("DEBUG: [AuthMiddleware] req.organizationName set to:", req.organizationName); // DEBUG LOG

        next(); // Proceed to the next middleware/route handler

    } catch (err) {
        console.error("DEBUG: [AuthMiddleware] Token verification error in protect middleware:", err.message); // DEBUG LOG
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
