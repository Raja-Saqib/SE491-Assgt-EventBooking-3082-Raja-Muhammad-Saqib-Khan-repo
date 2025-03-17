const Event = require("../models/event_model");
const parse_body = require("../utils/parse_body");
const logger = require("../utils/logger");

// Helper function to validate event data
const validate_event_data = (data) => {
    const { title, held_on } = data;
    if (!title || !held_on) {
        return { valid: false, message: "Title and held_on are required." };
    }
    return { valid: true };
};

// To get all events (excluding soft-deleted ones)
const get_events = async (req, res) => {
    // const urlParts = req.url.split("?");
    // const queryParams = new URLSearchParams(urlParts[1]);
    
    // const search = queryParams.get("search") || "";
    // const sort = queryParams.get("sort") || "start_time";
    // const page = parseInt(queryParams.get("page")) || 1;
    // const limit = parseInt(queryParams.get("limit")) || 5;
    // const skip = (page - 1) * limit;

    try {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const search = url.searchParams.get("search") || "";
        const sort = url.searchParams.get("sort") || "start_time";
        let page = parseInt(url.searchParams.get("page")) || 1;
        let limit = parseInt(url.searchParams.get("limit")) || 5;
        
        page = Math.max(1, page);
        limit = Math.min(100, Math.max(1, limit));
        
        const skip = (page - 1) * limit;
        //const filter = search ? { title: new RegExp(search, "i") } : {};
        const filter = search ? { title: new RegExp(search, "i"), deleted: false } : { deleted: false };
        
        const events = await Event.find(filter).sort(sort).skip(skip).limit(limit);

        // const filter = search ? { title: new RegExp(search, "i") } : {};
        // const events = await Event.find(filter).sort(sort).skip(skip).limit(limit);

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ events, totalPages: Math.ceil(events.length / limit), currentPage: page }));
        //res.end(JSON.stringify(events));
    } catch (err) {
        logger.error(`Error fetching events: ${err.message}`);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Server Error" }));
    }
};

// To get a single event by ID
const get_eventById = async (req, res) => {
    //const eventId = req.url.split("/")[2]; // Extract event ID from URL

    try {
        const eventId = new URL(req.url, `http://${req.headers.host}`).pathname.split("/")[2];
        const event = await Event.findById(eventId);
        if (!event) {
            res.writeHead(404, { "Content-Type": "application/json" });
            return res.end(JSON.stringify({ message: "Event not found" }));
        }

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(event));
    } catch (err) {
        logger.error(`Error fetching event: ${err.message}`);
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Invalid event ID" }));
    }
};

// To create a new event
const create_event = async (req, res) => {
    let body = "";
    req.on("data", chunk => (body += chunk));
    req.on("end", async () => {
        try {
            const event_data = await parse_body(req);
            const validation = validate_event_data(event_data);
            if (!validation.valid) {
                res.writeHead(400, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ message: validation.message }));
            }

            const new_event = await Event.create(event_data);
            logger.info(`Event created: ${new_event.id}`);

            res.writeHead(201, { "Content-Type": "application/json" });
            res.end(JSON.stringify(new_event));
        } catch (err) {
            logger.error(`Error creating event: ${err.message}`);
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: "Invalid Event Data" }));
        }
    });
};

//To update an event
const update_event = async (req, res) => {
    //const eventId = req.url.split("/")[2]; // Extract event ID from URL
    let body = "";

    req.on("data", chunk => (body += chunk));
    req.on("end", async () => {
        try {
            const eventId = new URL(req.url, `http://${req.headers.host}`).pathname.split("/")[2];
            const event_data = await parse_body(req);
            const validation = validate_event_data(event_data);
            if (!validation.valid) {
                res.writeHead(400, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ message: validation.message }));
            }

            const update_event = await Event.findByIdAndUpdate(eventId, event_data, { new: true });

            if (!update_event) {
                res.writeHead(404, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ message: "Event not found" }));
            }

            logger.info(`Event updated: ${eventId}`);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(update_event));
        } catch (err) {
            logger.error(`Error updating event: ${err.message}`);
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: "Invalid data" }));
        }
    });
};

// To delete an event/To soft delete an event
const delete_event = async (req, res) => {
    //const eventId = req.url.split("/")[2]; // Extract event ID from URL

    try {
        const eventId = new URL(req.url, `http://${req.headers.host}`).pathname.split("/")[2];
        //const delete_event = await Event.findByIdAndDelete(eventId);
        const event = await Event.findById(eventId);

        //if (!delete_event) {
        if (!event || event.deleted) {
            res.writeHead(404, { "Content-Type": "application/json" });
            return res.end(JSON.stringify({ message: "Event not found" }));
        }

        event.deleted = true;
        await event.save();

        //logger.info(`Event deleted: ${eventId}`);
        logger.info(`Event soft deleted: ${eventId}`);
        res.writeHead(200, { "Content-Type": "application/json" });
        //res.end(JSON.stringify({ message: "Event deleted successfully" }));
        res.end(JSON.stringify({ message: "Event soft deleted successfully" }));
    } catch (err) {
        //logger.error(`Error deleting event: ${err.message}`);
        logger.error(`Error soft deleting event: ${err.message}`);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Server error" }));
    }
};

module.exports = { get_events, get_eventById, create_event, update_event, delete_event };
