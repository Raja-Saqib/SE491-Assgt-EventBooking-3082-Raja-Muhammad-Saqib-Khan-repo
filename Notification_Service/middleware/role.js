const requireRole = (roles = []) => {
    if (typeof roles === "string") {
        roles = [roles]; // support single role
    }

    return (req, res, next) => {
        const userRole = req.user?.role;

        if (!roles.includes(userRole)) {
            return res.status(403).json({ message: "Access denied: Insufficient role" });
        }

        next();
    };
};

module.exports = requireRole;
