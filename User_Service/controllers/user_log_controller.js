const { User_Log, User } = require("../models");
const { Op } = require("sequelize");
const { successResponse, errorResponse } = require("../utils/api_response");
const logger = require("../utils/logger");
const { Parser } = require("json2csv");
const fs = require("fs");
const path = require("path");

const get_user_logs = async (req, res, next) => {
    try {
        const { userId, action, startDate, endDate } = req.query;

        const whereClause = {};

        let { page = 1, limit = 10 } = req.query;
        page = Math.max(1, parseInt(page));
        limit = Math.min(100, Math.max(1, parseInt(limit))); // Restrict limit to max 100
        const offset = (page - 1) * limit;

        if (userId) whereClause.userId = userId;
        if (action) whereClause.action = { [Op.like]: `%${action}%` };
        if (startDate && endDate) {
            whereClause.timestamp = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }

        const logs = await User_Log.findAndCountAll({
            where: whereClause,
            include: { model: User, attributes: ["name"] },
            order: [["timestamp", "DESC"]],
            limit,
            offset
            // limit: parseInt(limit),
            // offset: parseInt(offset)

            //limit: 10 // Fetch the last 10 actions
        });

        //res.json(logs);
        
        // res.json({
        //     logs: logs.rows,
        //     totalPages: Math.ceil(logs.count / limit),
        //     currentPage: parseInt(page)
        // });
        
        logger.info(`User logs fetched - Page: ${page}, Limit: ${limit}`);
        return successResponse(res, "User logs retrieved successfully", {
            logs: logs.rows,
            totalPages: Math.ceil(logs.count / limit),
            currentPage: page
        });
    } catch (error) {
        logger.error(`Error fetching user logs: ${error.message}`);
        next(error);
        //return errorResponse(res, "Error fetching logs", 500);
        //res.status(500).json({ message: "Error fetching logs", error: error.message });
    }
};

const download_logsCSV = async (req, res, next) => {
    try {
        // Restrict to Admins only
        // if (req.user.role !== "admin") {
        //     logger.warn(`Unauthorized log download attempt by user ${req.user.id}`);
        //     return errorResponse(res, "Access denied: Admins only", 403);
        //     //return res.status(403).json({ message: "Access denied: Admins only" });
        // }
        const logs = await User_Log.findAll({
            include: { model: User, attributes: ["name"] },
            order: [["timestamp", "DESC"]]
        });

        const logsData = logs.map(log => ({
            user: log.User ? log.User.name : "Unknown",
            action: log.action,
            timestamp: new Date(log.timestamp).toLocaleString()
        }));

        const json2csvParser = new Parser();
        const csv = json2csvParser.parse(logsData);

        const filePath = path.join(__dirname, "../logs/user_logs.csv");
        fs.writeFileSync(filePath, csv);

        logger.info("User logs CSV generated");

        res.download(filePath, "user_logs.csv", (err) => {
            if (err) {
                logger.error(`Error sending CSV file: ${err.message}`);
                next(err);
                //return errorResponse(res, "Error downloading CSV", 500);
            }

            // Delete file after sending to prevent storage overload
            fs.unlink(filePath, (err) => {
                if (err) logger.warn(`Failed to delete CSV file: ${err.message}`);
            });
        });

        //res.download(filePath);
    } catch (error) {
        logger.error(`Error generating CSV: ${error.message}`);
        next(error);
        //return errorResponse(res, "Error generating CSV", 500);
        //res.status(500).json({ message: "Error generating CSV", error: error.message });
    }
};

module.exports = { get_user_logs, download_logsCSV };
