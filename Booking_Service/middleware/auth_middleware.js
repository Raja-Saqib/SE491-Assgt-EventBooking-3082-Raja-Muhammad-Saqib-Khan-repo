const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");

const verify_token = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        logger.warn("Missing or malformed Authorization header");
        return res.status(401).json({ message: "Unauthorized: Token missing or malformed" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        logger.error(`JWT verification failed: ${error.message}`);
        return res.status(403).json({ message: "Invalid or expired token" });
    }
};

module.exports = { verify_token };
