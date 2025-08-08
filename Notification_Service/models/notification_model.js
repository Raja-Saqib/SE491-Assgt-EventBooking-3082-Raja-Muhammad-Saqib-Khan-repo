const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
    user_id: { type: Number, required: true }, // INTEGER equivalent in MongoDB
    user_email: { type: String, required: true },
    user_phone: { type: String },
    message: { type: String, required: true },
    type: { type: String, enum: ["email", "sms"], required: true },
    status: { type: String, enum: ["pending", "sent", "failed"], default: "pending" },
    sent_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("notification_model", NotificationSchema, "notifications");
