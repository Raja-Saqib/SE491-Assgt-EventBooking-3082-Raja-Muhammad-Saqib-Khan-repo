const Booking = require("../models/booking_model");
const User = require("../../User_Service/models/user_model");
const { successResponse, errorResponse } = require("../utils/api_response");
const logger = require("../utils/logger");
const { publishMessage } = require("../utils/rabbitmq");

// Create a new booking
const create_booking = async (req, res, next) => {
    try {
        const { userId, eventId, ticket_count } = req.body;
        const user = await User.findByPk(userId);
        
        if (!user) {
            return errorResponse(res, "User not found", 404);
        }

        const booking = await Booking.create({ userId, eventId, ticket_count });

        logger.info(`Booking created: ${booking.id} for User ${userId}`);
        publishMessage("booking.created", booking);
        return successResponse(res, "Booking created successfully", { booking });
        //res.status(201).json({ message: "Booking created successfully", booking });
    } catch (error) {
        logger.error(`Error creating booking: ${error.message}`);
        next(error);
    }
};

// Get a booking by ID
const get_bookingById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findByPk(id);

        if (!booking) {
            logger.warn(`Booking not found: ${id}`);
            return errorResponse(res, "Booking not found", 404);
            //return res.status(404).json({ message: "Booking not found" });
        }

        return successResponse(res, "Booking retrieved successfully", { booking });
        //res.json(booking);
    } catch (error) {
        logger.error(`Error fetching booking: ${error.message}`);
        next(error);
        //res.status(500).json({ message: "Error fetching booking", error: error.message });
    }
};

// Get all bookings
const get_all_bookings = async (req, res, next) => {
    try {
        let { page = 1, limit = 10 } = req.query;
        page = Math.max(1, parseInt(page));
        limit = Math.min(100, Math.max(1, parseInt(limit))); // Restrict limit to max 100
        const offset = (page - 1) * limit;
        const bookings = await Booking.findAndCountAll({ limit, offset });
        //const bookings = await Booking.findAndCountAll({ limit: parseInt(limit), offset: parseInt(offset) });
        logger.info(`Bookings fetched. Page: ${page}, Limit: ${limit}`);

        return successResponse(res, "Bookings retrieved successfully", {
            bookings: bookings.rows,
            totalPages: Math.ceil(bookings.count / limit),
            currentPage: page
        });

        // res.json({
        //     bookings: bookings.rows,
        //     totalPages: Math.ceil(bookings.count / limit),
        //     currentPage: parseInt(page)
        // });
    } catch (error) {
        logger.error(`Error fetching bookings: ${error.message}`);
        next(error);
    }
};

// Update a booking
const update_booking = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, payment_status } = req.body;

        const booking = await Booking.findByPk(id);
        if (!booking) { 
            logger.warn(`Booking not found: ${id}`);
            return errorResponse(res, "Booking not found", 404);
            //return res.status(404).json({ message: "Booking not found" });
        }

        //booking.status = status || booking.status;
        //booking.payment_status = payment_status || booking.payment_status;
         // Only Admins can update booking statuses
         if (status || payment_status) {
            if (req.user.role !== "admin") {
                logger.warn(`Unauthorized booking update attempt by user ${req.user.id}`);
                return errorResponse(res, "Unauthorized to update booking status", 403);
            }

            if (status) booking.status = status;
            if (payment_status) booking.payment_status = payment_status;

            logger.info(`Booking ${id} status updated by Admin ${req.user.id}`);
        }

        await booking.save();
        return successResponse(res, "Booking updated successfully", { booking });

        // logger.info(`Booking ${id} updated`);
        // res.json({ message: "Booking updated successfully", booking });
    } catch (error) {
        logger.error(`Error updating booking: ${error.message}`);
        next(error);
    }
};

// Delete a booking
const delete_booking = async (req, res, next) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findByPk(id);

        if (!booking) { 
            logger.warn(`Booking not found: ${id}`);
            return errorResponse(res, "Booking not found", 404);
            //return res.status(404).json({ message: "Booking not found" });
        }

        // Ensure only the user who booked or an admin can cancel
        if (req.user.id != booking.userId && req.user.role !== "admin") {
            logger.warn(`Unauthorized booking cancel attempt by user ${req.user.id}`);
            return errorResponse(res, "Unauthorized to cancel this booking", 403);
        }

        // Soft delete: Mark as "Cancelled" instead of permanent deletion
        booking.status = "Cancelled";
        await booking.save();

        logger.info(`Booking ${id} marked as cancelled`);
        return successResponse(res, "Booking cancelled successfully", { booking });

        // await booking.destroy();
        // logger.info(`Booking ${id} deleted`);
        // res.json({ message: "Booking deleted successfully" });
    } catch (error) {
        logger.error(`Error deleting booking: ${error.message}`);
        next(error);
    }
};

module.exports = { create_booking, get_bookingById, get_all_bookings, update_booking, delete_booking };
