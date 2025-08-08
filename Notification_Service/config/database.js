const mongoose = require("mongoose");
// require("dotenv").config();
// require('dotenv').config({ path: __dirname + '/../notification_service.env' });
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../notification_service.env') });

const connectDB = async () => {
    try {
        console.log("MONGO_URI from .env:", process.env.MONGO_URI);

        // await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Database connection failed:", error);
        process.exit(1);
    }
};

module.exports = connectDB;
