require("dotenv").config({ path: "user_service.env" });
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const user_routes = require("./routes/user_routes");
const errorHandler = require("./middleware/error_middleware");
const logger = require("./utils/logger");
//const { connectDB } = require("../Booking_Service/config/database");
const { connectDB } = require("./config/database");

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());

// Handles the root / path
app.get('/', (req, res) => {
  res.send('User Service is up and running!');
});

app.use("/users", user_routes);

// Log API requests
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
    app.listen(PORT, () => logger.info(`User Service running on port ${PORT}`));
});
