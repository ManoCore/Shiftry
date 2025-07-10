// utils/ErrorResponse.js (or wherever you define custom errors)

class ErrorResponse extends Error {
    constructor(message, statusCode) {
        super(message); // Pass message to the parent Error constructor
        this.statusCode = statusCode;
    }
}

module.exports = ErrorResponse;