const { Sequelize } = require("sequelize");
require("dotenv").config({ path: "user_service.env" });
const logger = require("../utils/logger");

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: "postgres",
    logging: false, // Set to true if you want SQL queries logged
});

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        logger.info("PostgreSQL Connected - User_Service");
    } catch (error) {
        logger.error(`Database connection failed: ${error.message}`);
        process.exit(1); // Exit process if DB connection fails
    }
};

module.exports = { sequelize, connectDB };
