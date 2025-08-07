const Event = require("../models/event_model");
const parse_body = require("../utils/parse_body");
const logger = require("../utils/logger");
const { isValidObjectId } = require("mongoose");
const Joi = require("joi");

// Helper function to validate event data
// const validate_event_data = (data) => {
//     const { title, held_on } = data;
//     if (!title || !held_on) {
//         return { valid: false, message: "Title and held_on are required." };
//     }
//     return { valid: true };
// };

const eventSchema = Joi.object({ 
    title: Joi.string().required(), 
    held_on: Joi.date().required(), 
});

const validate_event_data = (data) => {
    const { error } = eventSchema.validate(data);
    if (error) return { valid: false, message: error.message };
    return { valid: true };
};


// Helper function to extract id from URL
const extractIdFromUrl = (req) => {
    return new URL(req.url, `http://${req.headers.host}`).pathname.split("/")[2];
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
        // const search = url.searchParams.get("search") || "";
        const search = url.searchParams.get("search")?.trim() || "";
        // const sort = url.searchParams.get("sort") || "start_time";
        //const sort = url.searchParams.get("sort") || "held_on";
        
        // VALID SORT FIELD CHECK
        const validSortFields = ["held_on", "title"];
        const requestedSort = url.searchParams.get("sort");
        const sort = validSortFields.includes(requestedSort) ? requestedSort : "held_on";
        // let page = parseInt(url.searchParams.get("page")) || 1;
        // let limit = parseInt(url.searchParams.get("limit")) || 5;
        let page = Number.isNaN(Number(url.searchParams.get("page"))) ? 1 : parseInt(url.searchParams.get("page")); 
        let limit = Number.isNaN(Number(url.searchParams.get("limit"))) ? 5 : parseInt(url.searchParams.get("limit"));

        
        page = Math.max(1, page);
        limit = Math.min(100, Math.max(1, limit));
        
        const skip = (page - 1) * limit;
        // const filter = search ? { title: new RegExp(search, "i") } : {};
        // const filter = search ? { title: new RegExp(search, "i"), deleted: false } : { deleted: false };
        function escapeRegex(text) { 
            return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'); 
        }
        const safeSearch = escapeRegex(search); 
        const filter = search ? { title: new RegExp(safeSearch, "i"), deleted: false } : { deleted: false };
        // logger.info(`Applied Filter: ${JSON.stringify(filter)}`);
        // logger.info(`Request URL: ${req.url}, Applied Filter: ${JSON.stringify(filter)}`);
        // logger.info("Request received", { url: req.url, applied_filter: filter, });
        logger.info("Request received", { url: req.url, applied_filter: filter, sort, page, limit, });
        
        // COUNT TOTAL MATCHING DOCUMENTS FIRST
        const totalCount = await Event.countDocuments(filter);
        logger.info("Total matching events", { totalCount });

        const events = await Event.find(filter).sort(sort).skip(skip).limit(limit);
        //logger.info(`Fetched ${events.length} events`);
        logger.info("Fetched events", { count: events.length, });

        // const filter = search ? { title: new RegExp(search, "i") } : {};
        // const events = await Event.find(filter).sort(sort).skip(skip).limit(limit);

        const totalPages = Math.ceil(totalCount / limit);

        res.writeHead(200, { "Content-Type": "application/json" });
        // res.end(JSON.stringify({ events, totalPages: Math.ceil(events.length / limit), currentPage: page })); 
        res.end(JSON.stringify({ events, totalPages, currentPage: page }));
        //res.end(JSON.stringify(events));
    } catch (err) {
        // logger.error(`Error fetching events: ${err.message}`);
        logger.error(`Error fetching events for query: ${req.url} - ${err.message}`);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Server Error" }));
    }
};

// To get a single event by ID
const get_eventById = async (req, res) => {
    //const eventId = req.url.split("/")[2]; // Extract event ID from URL

    try {
        const eventId = extractIdFromUrl (req);

        // logger.info("Fetching event by ID", { eventId });
        logger.info("Incoming request to fetch single event", { eventId, url: req.url, method: req.method, });

        if (!isValidObjectId(eventId)) {
            logger.warn("Invalid event ID format", { eventId });
            res.writeHead(400, { "Content-Type": "application/json" });
            return res.end(JSON.stringify({ message: "Invalid event ID format", code: "INVALID_ID_FORMAT" }));
        }

        // const event = await Event.findById(eventId);
        
        // Check for existence and not soft-deleted
        const event = await Event.findOne({ _id: eventId, deleted: false });
        if (!event) {
            logger.warn("Event not found or deleted", { eventId });
            res.writeHead(404, { "Content-Type": "application/json" });
            return res.end(JSON.stringify({ message: "Event not found", code: "EVENT_NOT_FOUND" }));
        }

        logger.info("Event found", { eventId });
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(event));
    } catch (err) {
        // logger.error(`Error fetching event: ${err.message}`);
        if (err.name === "CastError") {
            // logger.warn("Invalid ObjectId", { reason: err.message });
            logger.warn("Invalid ObjectId (CastError)", { reason: err.message, eventId: req.url });
            res.writeHead(400, { "Content-Type": "application/json" });
            return res.end(JSON.stringify({ message: "Invalid event ID format", code: "INVALID_ID_FORMAT" }));
        }
        // logger.error(`Error fetching event by ID: ${err.message}`, { url: req.url });
        // res.writeHead(400, { "Content-Type": "application/json" });
        // res.end(JSON.stringify({ message: "Invalid event ID" }));

        // logger.error(`Error fetching event: ${err.message}`);
        logger.error("Unexpected error fetching event by ID", { error: err.message, url: req.url, });
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Server Error" }));
    }
};

// To create a new event
const create_event = async (req, res) => {
    try {
            const event_data = await parse_body(req);

            logger.debug("Parsed event data", { event_data });

            const validation = validate_event_data(event_data);
            if (!validation.valid) {
                logger.warn("Validation failed", { reason: validation.message });
                res.writeHead(400, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ message: validation.message, code: "VALIDATION_FAILED" }));
            }

            const new_event = await Event.create(event_data);
            // logger.info(`Event created: ${new_event.id}`);
            logger.info("Event created", { id: new_event.id, method: req.method, url: req.url, });

            res.writeHead(201, { "Content-Type": "application/json" });
            res.end(JSON.stringify(new_event));
        } catch (err) {
            // logger.error(`Error creating event: ${err.message}`);
            logger.error("Error creating event", { error: err.message, url: req.url, });

            // res.writeHead(400, { "Content-Type": "application/json" });
            // res.end(JSON.stringify({ message: "Invalid Event Data" }));
            if (err.name === "ValidationError") {
                res.writeHead(400, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ message: "Validation error", code: "MONGO_VALIDATION_ERROR" }));
            }

            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: "Server Error" }));
        }
    // let body = "";
    // req.on("data", chunk => (body += chunk));
    // req.on("end", async () => {
    //     try {
    //         const event_data = await parse_body(req);

    //         logger.debug("Parsed event data", { event_data });

    //         const validation = validate_event_data(event_data);
    //         if (!validation.valid) {
    //             logger.warn("Validation failed", { reason: validation.message });
    //             res.writeHead(400, { "Content-Type": "application/json" });
    //             return res.end(JSON.stringify({ message: validation.message, code: "VALIDATION_FAILED" }));
    //         }

    //         const new_event = await Event.create(event_data);
    //         // logger.info(`Event created: ${new_event.id}`);
    //         logger.info("Event created", { id: new_event.id });

    //         res.writeHead(201, { "Content-Type": "application/json" });
    //         res.end(JSON.stringify(new_event));
    //     } catch (err) {
    //         // logger.error(`Error creating event: ${err.message}`);
    //         logger.error("Error creating event", { error: err.message });

    //         // res.writeHead(400, { "Content-Type": "application/json" });
    //         // res.end(JSON.stringify({ message: "Invalid Event Data" }));
    //         if (err.name === "ValidationError") {
    //             res.writeHead(400, { "Content-Type": "application/json" });
    //             return res.end(JSON.stringify({ message: "Validation error", code: "MONGO_VALIDATION_ERROR" }));
    //         }

    //         res.writeHead(500, { "Content-Type": "application/json" });
    //         res.end(JSON.stringify({ message: "Server Error" }));
    //     }
    // });
};

//To update an event
const update_event = async (req, res) => {
    //const eventId = req.url.split("/")[2]; // Extract event ID from URL
    let body = "";

    req.on("data", chunk => (body += chunk));
    req.on("end", async () => {
        try {
            const eventId = extractIdFromUrl (req);
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
        const eventId = extractIdFromUrl (req);
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
