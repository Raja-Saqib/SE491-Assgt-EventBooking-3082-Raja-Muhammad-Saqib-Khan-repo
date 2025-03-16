const express = require("express");
const { register_user, login_user, get_userById, update_user, delete_user, get_all_users, validate_user_token } = require("../controllers/user_controller");
const { verify_token, authorize_roles } = require("../middleware/auth_middleware");
const { get_user_logs, download_logsCSV } = require("../controllers/user_log_controller");
const router = express.Router();
const pool = require("../user_db");

// Get all users
// router.get("/", async (req, res) => {
//     try {
//         const result = await pool.query("SELECT * FROM users");
//         res.json(result.rows);
//     } catch (err) {
//         console.error(err.message);
//         res.status(500).send("Server error");
//     }
// });

// Get all of user and their details (used by other microservices)
router.get("/", verify_token, authorize_roles("admin"), get_all_users); // Only Admin can get all users

// Get user details by ID (used by other microservices)
router.get("/:id", verify_token, get_userById); // Any authenticated user can view their profile

// Update user details by ID (used by other microservices)
router.put("/:id", verify_token, authorize_roles("admin", "organizer"), update_user); // Only Admin & Organizer can update users

// Delete user by ID (now not used by other microservices)
router.delete("/:id", verify_token, authorize_roles("admin"), delete_user); // Only Admin can delete users

// Validate a user token (used by other microservices)
router.post("/validate-token", validate_user_token);

// Register a user
router.post("/register", register_user);

// Login the user
router.post("/login", login_user);

// Log to track the user activities
router.get("/logs", verify_token, authorize_roles("admin"), get_user_logs);

// Download the log CSV
router.get("/logs/download", verify_token, authorize_roles("admin"), download_logsCSV);

module.exports = router;

