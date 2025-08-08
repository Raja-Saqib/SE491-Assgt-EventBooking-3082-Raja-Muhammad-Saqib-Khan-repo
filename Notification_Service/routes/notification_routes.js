/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Get all notifications
 *     parameters:
 *       - in: query
 *         name: user_email
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of notifications
 */

/**
 * @swagger
 * /notifications/export:
 *   get:
 *     summary: Export notifications to CSV
 *     responses:
 *       200:
 *         description: Returns CSV file
 */

const express = require("express");
const { send_Email_notification, send_SMS_notification, get_all_notifications, export_notifications_csv } = require("../controllers/notification_controller");

const requireRole = require("../middleware/role");

const router = express.Router();

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Get all notifications (admin only)
 *     tags: [Notifications]
 */
router.get("/", requireRole(["admin", "auditor"]), get_all_notifications);

/**
 * @swagger
 * /notifications/export:
 *   get:
 *     summary: Export notifications to CSV (admin only)
 *     tags: [Notifications]
 */
router.get("/export", requireRole("admin"), export_notifications_csv);

/**
 * @swagger
 * /notifications/email:
 *   post:
 *     summary: Send an email notification
 *     tags: [Notifications]
 */
router.post("/email", requireRole(["admin", "user"]), send_Email_notification);

/**
 * @swagger
 * /notifications/sms:
 *   post:
 *     summary: Send an SMS notification
 *     tags: [Notifications]
 */
router.post("/sms", requireRole(["admin", "user"]), send_SMS_notification);

// // POST routes
// router.post("/email", send_Email_notification);
// router.post("/sms", send_SMS_notification);

// // GET route with controller
// router.get("/", get_all_notifications);
// router.get("/export", export_notifications_csv); // export csv route

module.exports = router;
