const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "event_service.env") });

console.log("MONGO_URI:", process.env.MONGO_URI);

//from event_db.js
await mongoose.connect(process.env.MONGO_URI); // Removed deprecated options

/*const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Connected to MongoDB!");
    } catch (err) {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    }
};

module.exports = connectDB;
*/

//from event_service_service.js

//require("dotenv").config();

const Event = require("../models/Event");

// Helper function to validate event data
const validateEventData = (data) => {
    const { title, start_time, end_time } = data;
    if (!title || !start_time || !end_time) {
        return { valid: false, message: "Title, start_time, and end_time are required." };
    }
    if (new Date(start_time) >= new Date(end_time)) {
        return { valid: false, message: "Start time must be before end time." };
    }
    return { valid: true };
};

// Create an event with validation
const createEvent = async (req, res) => {
    let body = "";
    req.on("data", chunk => (body += chunk));
    req.on("end", async () => {
        try {
            const eventData = JSON.parse(body);
            const validation = validateEventData(eventData);
            if (!validation.valid) {
                res.writeHead(400, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ message: validation.message }));
            }
            
            const newEvent = await Event.create(eventData);
            res.writeHead(201, { "Content-Type": "application/json" });
            res.end(JSON.stringify(newEvent));
        } catch (err) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: "Invalid JSON format." }));
        }
    });
};

// To update an event with validation
const updateEvent = async (req, res) => {
    const eventId = req.url.split("/")[2];
    let body = "";

    req.on("data", chunk => (body += chunk));
    req.on("end", async () => {
        try {
            const eventData = JSON.parse(body);
            const validation = validateEventData(eventData);
            if (!validation.valid) {
                res.writeHead(400, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ message: validation.message }));
            }

            const updatedEvent = await Event.findByIdAndUpdate(eventId, eventData, { new: true });
            if (!updatedEvent) {
                res.writeHead(404, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ message: "Event not found" }));
            }

            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(updatedEvent));
        } catch (err) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: "Invalid JSON format." }));
        }
    });
};

module.exports = { createEvent, updateEvent };

//To implement logging system
//npm install fs

const http = require("http");
const fs = require("fs");
const dotenv = require("dotenv");
const connectDB = require("./db");
const eventRoutes = require("./routes/eventRoutes");

dotenv.config();
connectDB();

// Logging function
const logToFile = (message) => {
    const logMessage = `${new Date().toISOString()} - ${message}\n`;
    fs.appendFile("server.log", logMessage, (err) => {
        if (err) console.error("Error logging to file:", err);
    });
};

const server = http.createServer((req, res) => {
    logToFile(`${req.method} ${req.url}`);
    eventRoutes(req, res);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    logToFile(`Server started on port ${PORT}`);
});

//Add pagination & filtering
// Get events with pagination & filtering
const getEvents = async (req, res) => {
    const urlParts = req.url.split("?");
    const queryParams = new URLSearchParams(urlParts[1]);

    const search = queryParams.get("search") || "";
    const sort = queryParams.get("sort") || "start_time";
    const page = parseInt(queryParams.get("page")) || 1;
    const limit = parseInt(queryParams.get("limit")) || 5;
    const skip = (page - 1) * limit;

    try {
        const filter = search ? { title: new RegExp(search, "i") } : {};
        const events = await Event.find(filter).sort(sort).skip(skip).limit(limit);

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(events));
    } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Server error" }));
    }
};

module.exports = { getEvents };

//Improving JSON Body Parsing
const parseBody = (req) => {
    return new Promise((resolve, reject) => {
        let body = "";
        req.on("data", chunk => (body += chunk));
        req.on("end", () => {
            try {
                resolve(JSON.parse(body));
            } catch (err) {
                reject("Invalid JSON format");
            }
        });
    });
};

module.exports = parseBody;

//In controller.js for parsing
const parseBody = require("../utils/parseBody");

// const createEvent = async (req, res) => {
//     try {
//         const eventData = await parseBody(req);
//         const newEvent = await Event.create(eventData);
//         res.writeHead(201, { "Content-Type": "application/json" });
//         res.end(JSON.stringify(newEvent));
//     } catch (err) {
//         res.writeHead(400, { "Content-Type": "application/json" });
//         res.end(JSON.stringify({ message: err }));
//     }
// };

//For authentication
//npm install bcryptjs jsonwebtoken dotenv

//Add in .env
JWT_SECRET=your_secret_key
//JWT_EXPIRY=1h

//Creating models/user.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "organizer", "user"], default: "user" }
});

// Hash password before saving
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

module.exports = mongoose.model("User", UserSchema);

//Create controllers/authController.js for Controller for SignUp and Login
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// Generate JWT Token
const generateToken = (user) => {
    return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRY });
};

// User Signup
const signup = async (req, res) => {
    let body = "";
    req.on("data", chunk => (body += chunk));
    req.on("end", async () => {
        try {
            const { name, email, password, role } = JSON.parse(body);
            if (!name || !email || !password) {
                res.writeHead(400, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ message: "All fields are required" }));
            }

            const existingUser = await User.findOne({ email });
            if (existingUser) {
                res.writeHead(400, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ message: "Email already in use" }));
            }

            const user = await User.create({ name, email, password, role });
            const token = generateToken(user);

            res.writeHead(201, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ token, user: { id: user._id, name, email, role } }));
        } catch (err) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: "Invalid JSON format" }));
        }
    });
};

// User Login
const login = async (req, res) => {
    let body = "";
    req.on("data", chunk => (body += chunk));
    req.on("end", async () => {
        try {
            const { email, password } = JSON.parse(body);
            if (!email || !password) {
                res.writeHead(400, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ message: "Email and password required" }));
            }

            const user = await User.findOne({ email });
            if (!user || !(await bcrypt.compare(password, user.password))) {
                res.writeHead(401, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ message: "Invalid credentials" }));
            }

            const token = generateToken(user);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ token, user: { id: user._id, name: user.name, email, role: user.role } }));
        } catch (err) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: "Invalid JSON format" }));
        }
    });
};

module.exports = { signup, login };

//For protecting routes with middleware, Create middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
require("dotenv").config();

const protect = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.writeHead(401, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ message: "Unauthorized: No token provided" }));
    }

    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Unauthorized: Invalid token" }));
    }
};

const authorize = (roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        res.writeHead(403, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ message: "Forbidden: Insufficient permissions" }));
    }
    next();
};

module.exports = { protect, authorize };

//For secure event routes, Modify routes/eventRoutes.js to use authentication.
const { getEvents, createEvent, updateEvent, deleteEvent } = require("../controllers/eventController");
const { protect, authorize } = require("../middleware/authMiddleware");

const eventRoutes = async (req, res) => {
    if (req.method === "GET" && req.url === "/events") {
        return getEvents(req, res);
    } 
    else if (req.method === "POST" && req.url === "/events") {
        return protect(req, res, () => authorize(["admin", "organizer"])(req, res, () => createEvent(req, res)));
    } 
    else if (req.method === "PUT" && req.url.startsWith("/events/")) {
        return protect(req, res, () => authorize(["admin", "organizer"])(req, res, () => updateEvent(req, res)));
    } 
    else if (req.method === "DELETE" && req.url.startsWith("/events/")) {
        return protect(req, res, () => authorize(["admin"])(req, res, () => deleteEvent(req, res)));
    } 
    else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Route Not Found" }));
    }
};

module.exports = eventRoutes;
