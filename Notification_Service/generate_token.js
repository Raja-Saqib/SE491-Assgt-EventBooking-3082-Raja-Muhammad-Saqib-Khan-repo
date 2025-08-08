const jwt = require("jsonwebtoken");

const token = jwt.sign(
    {
        user_id: 1,
        email: "admin@example.com",
        role: "admin" // change to "user" or "auditor" as needed
    },
    "super_secret_jwt_key", // or process.env.JWT_SECRET
    { expiresIn: "1h" }
);

console.log("JWT Token:\n", token);
