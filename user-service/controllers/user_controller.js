const { User, User_Log } = require("../models");
const { successResponse, errorResponse } = require("../utils/api_response");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");
require("dotenv").config({ path: "user_service.env" });

// Fetch user details by ID (for microservices)
const get_userById = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.params.id, { attributes: ["id", "name", "email", "role"] });
        if (!user) {
            logger.warn(`User not found: ${req.params.id}`);
            return errorResponse(res, "User not found", 404);
            //return res.status(404).json({ message: "User not found" });
        }
        return successResponse(res, "User retrieved successfully", { user });
        //res.json(user);
    } catch (error) {
        logger.error(`Error fetching user: ${error.message}`);
        next(error);
        //res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Validate a user token (for microservices)
const validate_user_token = async (req, res) => {
    const { token } = req.body;
    if (!token) {
        logger.warn("Token validation attempt with missing token");
        return errorResponse(res, "Token is required", 400);
        //return res.status(400).json({ message: "Token is required" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        logger.info(`Token validation successful for user ${decoded.id}`);

        return successResponse(res, "Token is valid", { valid: true, userId: decoded.id, role: decoded.role });
        //res.json({ valid: true, userId: decoded.id, role: decoded.role });
    } catch (error) {
        logger.warn(`Invalid token attempt: ${error.message}`);

        if (error.name === "TokenExpiredError") {
            return errorResponse(res, "Token has expired", 401);
        }
        return errorResponse(res, "Invalid token", 401);
        //res.status(401).json({ message: "Invalid token" });
    }
};

// Get user registered (for microservices)
const register_user = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;
        const assigned_role = role || "user"; // Default role is "user"

        const user = await User.create({ name, email, password, role: assigned_role });
        await User_Log.create({ userId: user.id, action: "User Registered" });
        logger.info(`User registered: ${user.id}`);

        return successResponse(res, "User registered successfully", { user });
        //res.status(201).json({ message: "User registered successfully", user });
    } catch (error) {
        logger.error(`Error registering user: ${error.message}`);
        next(error);
        //res.status(400).json({ message: "Error registering user", error: error.message });
    }
};

// Get user logged in (for microservices)
const login_user = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });

        // if (!user || !(await bcrypt.compare(password, user.password))) {
        if (!user || !(await user.valid_password(password))) {
            return errorResponse(res, "Invalid email or password", 401);
            //return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRY });
        logger.info(`User login: ${user.id}`);
        
        return successResponse(res, "Login successful", { token, role: user.role });
        //res.json({ message: "Login successful", token, role: user.role });
    } catch (error) {
        logger.error(`Error logging in user: ${error.message}`);
        next(error);
        //res.status(400).json({ message: "Error logging in", error: error.message });
    }
};

// Get all users (Admin Only)
const get_all_users = async (req, res, next) => {
    try {
        if (req.user.role !== "admin") {
            logger.warn(`Unauthorized access attempt by user ${req.user.id}`);
            return errorResponse(res, "Access denied: Admins only", 403);
            //return res.status(403).json({ message: "Access denied: Admins only" });
        }
        const users = await User.findAll({ attributes: ["id", "name", "email", "role"] });
        logger.info(`Admin ${req.user.id} fetched all users`);
        return successResponse(res, "Users retrieved successfully", { users });
        //res.json(users);
    } catch (error) {
        logger.error(`Error fetching users: ${error.message}`);
        next(error);
    }
};

// Update user profile
const update_user = async (req, res, next) => {
    try {
        const userId = req.params.id;
        if (req.user.id != userId && req.user.role !== "admin") {
            logger.warn(`Unauthorized update attempt by user ${req.user.id}`);
            return errorResponse(res, "Unauthorized to update this user", 403);
            //return res.status(403).json({ message: "Unauthorized to update this user" });
        }

        const { name, email, password, role } = req.body;
        const user = await User.findByPk(userId);

        if (!user) {
            logger.warn(`User not found: ${userId}`);
            return errorResponse(res, "User not found", 404);
            //return res.status(404).json({ message: "User not found" });
        } 

        // Log role changes (only if Admin is updating another user's role)
        if (role && role !== user.role && req.user.role === "admin") {
            await User_Log.create({ userId: user.id, action: `Role changed to ${role}` });
            logger.info(`User ${userId} role changed to ${role} by Admin ${req.user.id}`);
            user.role = role;
        }

        if (name) user.name = name;
        if (email) user.email = email;
        if (password) user.password = await bcrypt.hash(password, 10);
        //if (role && req.user.role === "admin") user.role = role;  // Only Admins can change roles

        await user.save();
        logger.info(`User ${userId} updated successfully`);
        return successResponse(res, "User updated successfully", { user });
        //res.json({ message: "User updated successfully", user });
    } catch (error) {
        logger.error(`Error updating user: ${error.message}`);
        next(error);
    }
};

// Delete user account
const delete_user = async (req, res, next) => {
    try {
        const userId = req.params.id;

        // Ensure only Admins or the user themselves can delete the account
        if (req.user.id != userId && req.user.role !== "admin") {
            logger.warn(`Unauthorized delete attempt by user ${req.user.id}`);
            return errorResponse(res, "Unauthorized to delete this user", 403);
            //return res.status(403).json({ message: "Unauthorized to delete this user" });
        }

        const user = await User.findByPk(userId);
        if (!user) { 
            logger.warn(`User not found: ${userId}`);
            return errorResponse(res, "User not found", 404);
            //return res.status(404).json({ message: "User not found" }); 
        }

        // Log the deletion action
        await User_Log.create({ userId: user.id, action: "User Deleted" });

        await user.destroy();
        logger.info(`User ${userId} deleted successfully`);
        return successResponse(res, "User deleted successfully");
        //res.json({ message: "User deleted successfully" });
    } catch (error) {
        logger.error(`Error deleting user: ${error.message}`);
        next(error);
    }
};

module.exports = { get_userById, validate_user_token, update_user, delete_user, get_all_users, register_user, login_user };
