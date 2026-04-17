// src/utils/catch-async.js
const catchAsync = (handler) => {
    return (req, res, next) => {
        handler(req, res, next).catch((err) => next(err));
    };
};

module.exports = catchAsync;