const { successResponse } = require("../utils/api_response");
const Notification = require("../models/notification_model");
const { sendEmail } = require("../utils/email_service");
const { sendSMS } = require("../utils/sms_service");
const logger = require("../utils/logger");

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

        notification = await Notification.create({ user_id, user_email, message, type: "email", status });
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

        notification = await Notification.create({ user_id, user_phone, message, type: "sms", status });
        logger.info(`SMS notification status: ${status} for ${user_phone}`);

        return successResponse(res, `SMS ${status}`, { notification });
    } catch (error) {
        // logger.error(`SMS sending failed: ${error.message}`);
        // res.status(500).json({ message: "Error sending SMS", error: error.message });
        logger.error(`Error processing SMS notification: ${error.message}`);
        next(error);
    }
};

module.exports = { send_Email_notification, send_SMS_notification };
