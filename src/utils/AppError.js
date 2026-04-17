// utils/AppError.js
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.success = false;
        
        // Captures the stack trace (where the error happened)
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;