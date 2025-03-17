const dotenv = require("dotenv");
const fs = require("fs");
const http = require("http");

const connectDB = require("./event_db");
const event_routes = require("./routes/event_routes");

dotenv.config();
connectDB();

// Function for Logging
const logToFile = (message) => {
    const log_Message = `${new Date().toISOString()} - ${message}\n`;
    fs.appendFile("server.log", log_Message, (err) => {
        if (err) console.error("Error logging to file:", err);
    });
};

const server = http.createServer((req, res) => {
    logToFile(`${req.method} ${req.url}`);
    event_routes(req, res);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    logToFile(`Server started on port ${PORT}`);
});
