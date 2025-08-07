const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    category: { type: String },
    venue: { type: String },
    held_on: { type: Date, required: true },
    deleted: { type: Boolean, default: false }
});

module.exports = mongoose.model("event_model", EventSchema, "events");
