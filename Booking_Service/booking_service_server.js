require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { connectDB } = require("./config/database");
const booking_routes = require("./routes/booking_routes");
const errorHandler = require("./middleware/error_middleware");
const logger = require("./utils/logger");

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());

// Log API requests
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
});

app.use("/bookings", booking_routes);

// Centralized error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5002;
connectDB().then(() => {
    app.listen(PORT, () => logger.info(`Booking Service running on port ${PORT}`));
});
