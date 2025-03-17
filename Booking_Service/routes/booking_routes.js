const express = require("express");
const { create_booking, get_bookingById, get_all_bookings, update_booking, delete_booking } = require("../controllers/booking_controller");
const { verify_token } = require("../middleware/auth_middleware");

const router = express.Router();

router.post("/", verify_token, create_booking); // Create Booking
router.get("/:id", verify_token, get_bookingById); // Get Booking by ID
router.get("/", verify_token, get_all_bookings);  // Get All Bookings (with Pagination)
router.put("/:id", verify_token, update_booking); // Update Booking
router.delete("/:id", verify_token, delete_booking); // Delete Booking

module.exports = router;
