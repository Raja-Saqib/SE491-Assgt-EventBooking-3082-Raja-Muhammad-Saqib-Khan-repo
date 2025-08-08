require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const connectDB = require("./config/database");
const notification_routes = require("./routes/notification_routes");
const logger = require("./utils/logger");
// const { api_key_auth } = require("./middleware/api_key_auth");
const verifyJWT = require("./middleware/jwt_auth");
const requireRole = require("./middleware/role");
const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());

// Apply to all routes (or select routes)
// app.use("/notifications", api_key_auth, notification_routes);

app.use("/notifications", verifyJWT, notification_routes);

const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Notification Service API",
            version: "1.0.0",
            description: "API documentation for Notification Microservice",
        },
    },
    apis: ["./routes/*.js"], // Path to the API docs
};

const swaggerSpec = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Handles the root / path
app.get("/", (req, res) => {
  res.send("Notification Service is running.");
});

app.use("/notifications", notification_routes);

const PORT = process.env.PORT || 5003;
connectDB().then(() => {
    app.listen(PORT, () => logger.info(`Notification Service running on port ${PORT}`));
});
