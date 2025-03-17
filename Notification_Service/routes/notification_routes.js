const express = require("express");
const { send_Email_notification, send_SMS_notification } = require("../controllers/notification_controller");

const router = express.Router();

router.post("/email", send_Email_notification);
router.post("/sms", send_SMS_notification);

module.exports = router;
