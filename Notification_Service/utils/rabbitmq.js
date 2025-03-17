const amqp = require("amqplib");
const { sendEmail } = require("./emailService");
const { sendSMS } = require("./smsService");
const Notification = require("../models/Notification");
const logger = require("./logger");

const MAX_RETRIES = 3; // Maximum retry attempts

const connectRabbitMQ = async () => {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertQueue("notifications");
    channel.consume("notifications", async (msg) => {
        const notificationData = JSON.parse(msg.content.toString());
        const { user_email, user_phone, message, type, retryCount = 0 } = notificationData;
        try {
            if (type === "email") {
                await sendEmail(user_email, "Booking Confirmation", message);
            } else if (type === "sms") {
                await sendSMS(user_phone, message);
            }

            // Update notification as sent
            await Notification.create({ user_email, user_phone, message, type, status: "sent" });
            logger.info(`Notification sent successfully to ${user_email || user_phone}`);

            channel.ack(msg);
        } catch (error) {
            logger.error(`Failed to send notification: ${error.message}`);

            if (retryCount < MAX_RETRIES) {
                logger.warn(`Retrying notification (${retryCount + 1}/${MAX_RETRIES})...`);
                notificationData.retryCount = retryCount + 1;
                channel.sendToQueue("notifications", Buffer.from(JSON.stringify(notificationData)), {
                    expiration: 10000 // Retry after 10 seconds
                });
            } else {
                // Update notification as failed
                await Notification.create({ user_email, user_phone, message, type, status: "failed" });
                logger.error(`Notification failed after ${MAX_RETRIES} attempts.`);
            }

            channel.ack(msg);
        }
        // console.log("Received Notification:", notificationData);
        
        // if (notificationData.type === "email") {
        //     await sendEmail(notificationData.userEmail, "Booking Confirmation", notificationData.message);
        // } else if (notificationData.type === "sms") {
        //     await sendSMS(notificationData.userPhone, notificationData.message);
        // }
        
        // channel.ack(msg);
    });
};

module.exports = { connectRabbitMQ };
