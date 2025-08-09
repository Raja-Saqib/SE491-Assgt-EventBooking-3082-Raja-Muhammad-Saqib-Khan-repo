const { successResponse } = require("../utils/api_response");
const notification_model = require("../models/notification_model");
const { sendEmail } = require("../utils/email_service");
const { sendSMS } = require("../utils/sms_service");
const logger = require("../utils/logger");
const { Parser } = require("json2csv");

// Send Email Notification
const send_Email_notification = async (req, res, next) => {
    try {
        const { user_id, user_email, message } = req.body;
        // await sendEmail(user_email, "Event Booking Confirmation", message);
        
        // const notification = await Notification.create({ user_id, user_email, message, type: "email", status: "sent" });
        // logger.info(`Email sent to ${user_email} and logged.`);

        // res.status(200).json({ message: "Email sent successfully", notification });

        let status = "pending";
        let attempts = 0;
        let notification;

        while (attempts < 3) {
            try {
                await sendEmail(user_email, "Event Booking Confirmation", message);
                status = "sent";
                break; // Exit loop if successful
            } catch (error) {
                attempts++;
                logger.warn(`Email send attempt ${attempts} failed for ${user_email}: ${error.message}`);
            }
        }

        if (status === "pending") {
            status = "failed";
            logger.error(`Email sending failed after 3 attempts for ${user_email}`);
        }

        notification = await notification_model.create({ user_id, user_email, message, type: "email", status });
        logger.info(`Email notification status: ${status} for ${user_email}`);

        return successResponse(res, `Email ${status}`, { notification });
    } catch (error) {
        // logger.error(`Email sending failed: ${error.message}`);
        // res.status(500).json({ message: "Error sending email", error: error.message });
        logger.error(`Error processing email notification: ${error.message}`);
        next(error);
    }
};

// Send SMS Notification
const send_SMS_notification = async (req, res) => {
    try {
        const { user_id, user_phone, message } = req.body;
        // await sendSMS(user_phone, message);
        
        // const notification = await Notification.create({ user_id, user_phone, message, type: "sms", status: "sent" });
        // logger.info(`SMS sent to ${user_phone} and logged.`);

        // res.status(200).json({ message: "SMS sent successfully", notification });

        let status = "pending";
        let attempts = 0;
        let notification;

        while (attempts < 3) {
            try {
                await sendSMS(user_phone, message);
                status = "sent";
                break; // Exit loop if successful
            } catch (error) {
                attempts++;
                logger.warn(`SMS send attempt ${attempts} failed for ${user_phone}: ${error.message}`);
            }
        }

        if (status === "pending") {
            status = "failed";
            logger.error(`SMS sending failed after 3 attempts for ${user_phone}`);
        }

        notification = await notification_model.create({ user_id, user_phone, message, type: "sms", status });
        logger.info(`SMS notification status: ${status} for ${user_phone}`);

        return successResponse(res, `SMS ${status}`, { notification });
    } catch (error) {
        // logger.error(`SMS sending failed: ${error.message}`);
        // res.status(500).json({ message: "Error sending SMS", error: error.message });
        logger.error(`Error processing SMS notification: ${error.message}`);
        next(error);
    }
};

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Retrieve all notifications (admin/auditor only), Get filtered, sorted notifications
 *     tags: [Notifications]
 *     parameters:
 *       - in: query
 *         name: user_email
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, sent, failed]
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [email, sms]
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *           description: Search message or email
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           example: sent_at:desc
 *     responses:
 *       200:
 *         description: List of filtered notifications
 */

// GET all notifications with pagination, optional filters, date filtering, sorting, search by keyword
const get_all_notifications = async (req, res, next) => {
    try {
        const { 
            user_email, user_id, status, type, page = 1, limit = 10, 
            from, to, sort = "desc", search, keyword } = req.query; // Default to page 1 and limit 10

        // const query = {};
        let query = {};

        // Filters
        if (user_email) query.user_email = user_email;
        if (user_id) query.user_id = Number(user_id); // Cast to number
        if (status) query.status = status;
        if (type) query.type = type;

        // Date filter (on sent_at)
        if (from || to) {
            query.sent_at = {};
            if (from) query.sent_at.$gte = new Date(from);
            if (to) query.sent_at.$lte = new Date(to);
        }

        if (keyword) {
            query.$or = [
                { message: { $regex: keyword, $options: "i" } },
                { user_email: { $regex: keyword, $options: "i" } }
            ];
        }

        // Sorting
        // const sortOrder = sort === "asc" ? 1 : -1;

        let sortOption = {};
        if (sort) {
            const [field, direction] = sort.split(":");
            sortOption[field] = direction === "desc" ? -1 : 1;
        } else {
            sortOption = { sent_at: -1 }; // default
        }

        // const notifications = await notification_model.find(query).sort(sortOption);
        // return successResponse(res, "Notifications retrieved", { count: notifications.length, notifications });

        // Querying
        const notifications = await notification_model.find(query) // Fetch all notifications
            // .sort({ sent_at: sortOrder }) // Default sort by sent_at
            .sort(sortOption)
            .skip((page - 1) * limit) // Skip documents
            .limit(Number(limit)); // Limit number of documents

        const total = await notification_model.countDocuments(query); // Count total notifications

        res.status(200).json({ notifications, total, page: Number(page), totalPages: Math.ceil(total / limit), }); // Send notifications as JSON response
    } catch (error) {
        console.error("Error fetching notifications:", error.message);
        logger.error(`Failed to fetch notifications: ${error.message}`);
        next(error); // Let Express handle it
    }
};

/**
 * @swagger
 * /notifications/export:
 *   get:
 *     summary: Export notifications as CSV
 *     tags: [Notifications]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: CSV file download
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 */


const export_notifications_csv = async (req, res, next) => {
    try {
        const {
            user_email, user_id, status, type,
            from, to, sort = "desc", search 
        } = req.query;

        // const query = {};
        let query = {};
        if (user_email) query.user_email = user_email;
        if (user_id) query.user_id = Number(user_id);
        if (status) query.status = status;
        if (type) query.type = type;

        if (from || to) {
            query.sent_at = {};
            if (from) query.sent_at.$gte = new Date(from);
            if (to) query.sent_at.$lte = new Date(to);
        }

        if (search) {
            query.message = { $regex: search, $options: "i" };
        }

        const sortOrder = sort === "asc" ? 1 : -1;

        const notifications = await notification_model.find(query).sort({ sent_at: sortOrder });

        const fields = [
            "user_id", "user_email", "user_phone", "message", "type", "status", "sent_at"
        ];

        const parser = new Parser({ fields });
        const csv = parser.parse(notifications);

        // const notifications = await notification_model.find(query).lean();
        // const fields = ['user_id', 'user_email', 'user_phone', 'message', 'type', 'status', 'sent_at'];
        // const json2csvParser = new Parser({ fields });
        // const csv = json2csvParser.parse(notifications);

        res.header("Content-Type", "text/csv");
        res.attachment("notifications_export.csv");
        return res.send(csv);
    } catch (error) {
        console.error("CSV export error:", error.message);
        logger.error(`CSV export failed: ${error.message}`);
        next(error);
    }
};

module.exports = { send_Email_notification, send_SMS_notification, get_all_notifications, export_notifications_csv };
