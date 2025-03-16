const logger = require("../utils/logger");
const { errorResponse } = require("../utils/api_response");

// Error handling middleware
const errorHandler = (err, req, res, next) => {
    logger.error(`${req.method} ${req.url} - ${err.message}`, { stack: err.stack });
    return errorResponse(res, err.message || "Internal Server Error", err.statusCode || 500);

    // res.status(err.statusCode || 500).json({
    //     message: err.message || "Internal Server Error",
    // });
};

module.exports = errorHandler;
