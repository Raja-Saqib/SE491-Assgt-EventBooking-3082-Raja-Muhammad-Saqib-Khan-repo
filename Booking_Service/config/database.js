const { Sequelize } = require("sequelize");
// require("dotenv").config({ path: "../booking_service.env" });
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../booking_service.env") });

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST,
        dialect: "postgres",
        logging: false
    }
);

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log("Connected to PostgreSQL");
    } catch (error) {
        console.error("Database connection failed:", error);
        process.exit(1);
    }
};

module.exports = { sequelize, connectDB };
