const api_key_auth = (req, res, next) => {
    const clientKey = req.headers["x-api-key"];
    const serverKey = process.env.API_KEY;

    if (!clientKey || clientKey !== serverKey) {
        return res.status(401).json({ message: "Unauthorized: Invalid API Key" });
    }

    next();
};

module.exports = { api_key_auth };