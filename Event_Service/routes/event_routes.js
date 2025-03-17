const { get_events, get_eventById, create_event, update_event, delete_event } = require("../controllers/event_controller");

const event_routes = (req, res) => {
    if (req.method === "GET" && req.url === "/events") {
        return get_events(req, res);
    } else if (req.method === "GET" && req.url.startsWith("/events/")) {
        return get_eventById(req, res);
    } else if (req.method === "POST" && req.url === "/events") {
        return create_event(req, res);
    } else if (req.method === "PUT" && req.url.startsWith("/events/")) {
        return update_event(req, res);
    } else if (req.method === "DELETE" && req.url.startsWith("/events/")) {
        return delete_event(req, res);
    } else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Route Not Found" }));
    }
};

module.exports = event_routes;
