const amqp = require("amqplib");

let channel, connection;

const connectRabbitMQ = async () => {
    try {
        connection = await amqp.connect(process.env.RABBITMQ_URL);
        channel = await connection.createChannel();
        await channel.assertQueue("booking_notifications", { durable: true });

        console.log("Connected to RabbitMQ - Booking Service");
    } catch (error) {
        console.error("Error connecting to RabbitMQ:", error.message);
    }
};

const publishMessage = async (event, data) => {
    try {
        if (!channel) {
            console.error("RabbitMQ channel is not initialized");
            return;
        }
        const message = JSON.stringify({ event, data });
        channel.sendToQueue("booking_notifications", Buffer.from(message), { persistent: true });
        console.log(`Sent message to queue: ${event}`);
    } catch (error) {
        console.error("Error publishing message:", error.message);
    }
};

process.on("exit", () => {
    if (connection) connection.close();
});

module.exports = { connectRabbitMQ, publishMessage };
