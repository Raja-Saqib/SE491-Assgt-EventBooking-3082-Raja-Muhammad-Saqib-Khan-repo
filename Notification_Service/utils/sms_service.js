// const twilio = require("twilio");
// require("dotenv").config();

// const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// const sendSMS = async (to, message) => {
//     await client.messages.create({ body: message, from: process.env.TWILIO_PHONE_NUMBER, to });
// };

// module.exports = { sendSMS };

require("dotenv").config();

const isDev = process.env.NODE_ENV !== "production";

let client;

if (isDev) {
    // Mock Twilio client for development/testing
    client = {
        messages: {
            create: async ({ body, from, to }) => {
                console.log("[MOCK SMS SENT]");
                console.log("From:", from);
                console.log("To:", to);
                console.log("Message:", body);
                return { sid: "SMXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" };
            },
        },
    };
} else {
    // Real Twilio client for production
    const twilio = require("twilio");
    client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

const sendSMS = async (to, message) => {
    try {
        const result = await client.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to,
        });
        console.log("SMS sent:", result.sid);
    } catch (err) {
        console.error("Failed to send SMS:", err);
    }
};

module.exports = { sendSMS };
