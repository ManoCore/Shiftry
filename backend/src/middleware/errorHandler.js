// const ErrorResponse = require('../utils/errorResponse');

// const errorHandler = (err, req, res, next) => {
//   let error = { ...err };
//   error.message = err.message;

//   // Log to console for dev
//   console.error(err.stack.red);

//   // Mongoose bad ObjectId
//   if (err.name === 'CastError') {
//     const message = `Resource not found with id of ${err.value}`;
//     error = new ErrorResponse(message, 404);
//   }

//   // Mongoose duplicate key
//   if (err.code === 11000) {
//     const message = 'Duplicate field value entered';
//     error = new ErrorResponse(message, 400);
//   }

//   // Mongoose validation error
//   if (err.name === 'ValidationError') {
//     const message = Object.values(err.errors).map(val => val.message);
//     error = new ErrorResponse(message, 400);
//   }

//   res.status(error.statusCode || 500).json({
//     success: false,
//     error: error.message || 'Server Error'
//   });
// };

// module.exports = errorHandler;


const ErrorResponse = require('../utils/errorResponse'); // Adjust path

const errorHandler = (err, req, res, next) => {
    let error = { ...err }; // Copy the error object
    error.message = err.message; // Ensure message is copied

    // Log the error for debugging (optional, but highly recommended)
    console.error(err.stack); // Full stack trace
    console.error(`Error Name: ${err.name}, Message: ${err.message}, Code: ${err.statusCode}`);


    // Handle Mongoose Bad ObjectId (e.g., if an ID in the URL is malformed)
    if (err.name === 'CastError') {
        const message = `Resource not found with id of ${err.value}`;
        error = new ErrorResponse(message, 404);
    }

    // Handle Mongoose Duplicate Key Error (e.g., duplicate email)
    if (err.code === 11000) {
        const message = `Duplicate field value entered: ${Object.keys(err.keyValue)}`;
        error = new ErrorResponse(message, 400);
    }

    // Handle Mongoose Validation Error (e.g., missing required fields)
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(val => val.message);
        error = new ErrorResponse(messages.join(', '), 400);
    }

    // --- Specific handler for your custom ErrorResponse ---
    if (err instanceof ErrorResponse) {
        // If it's already an ErrorResponse, use its message and statusCode
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Server Error'
        });
    } else {
        // For any other unexpected errors, send a generic server error
        res.status(error.statusCode || 500).json({
            success: false,
            message: 'Server Error' // Hide sensitive details in production
        });
    }
};

module.exports = errorHandler;