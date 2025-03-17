require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const connectDB = require("./config/database");
const notificationRoutes = require("./routes/notification_routes");
const logger = require("./utils/logger");

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());

app.use("/notifications", notification_routes);

const PORT = process.env.PORT || 5003;
connectDB().then(() => {
    app.listen(PORT, () => logger.info(`Notification Service running on port ${PORT}`));
});
