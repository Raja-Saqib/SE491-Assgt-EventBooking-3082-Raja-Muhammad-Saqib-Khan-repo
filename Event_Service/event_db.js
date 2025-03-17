const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "event_service.env") });

const mongoose = require("mongoose");

console.log("MONGO_URI from .env:", process.env.MONGO_URI);

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is missing or not loaded from .env");
        }

        await mongoose.connect(process.env.MONGO_URI); 

        console.log("MongoDB Connected!");
    } catch (err) {
        console.error("MongoDB Connection Error:", err);
        process.exit(1);
    }
};

module.exports = connectDB;
