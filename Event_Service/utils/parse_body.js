const parse_body = (req) => {
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

module.exports = parse_body;
