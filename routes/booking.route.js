import express from "express";
import Booking from "../models/Booking.model.js";
import User from "../models/User.model.js";
import { createSuccessResponse, createErrorResponse } from "../utils/responseHandler.js";
import StatusCodes from "../utils/statusCodes.js";

const router = express.Router();

// Helper to format date to YYYY-MM-DD
const formatDate = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/**
 * @route POST /booking/create
 * @desc Create a new booking (date only)
 */
router.post("/create", async (req, res) => {
  try {
    const { userId, trainerId, bookingDate, sessionType, notes } = req.body;

    // Validate required fields
    if (!userId || !trainerId || !bookingDate || !sessionType) {
      return createErrorResponse(res, "Missing required fields", StatusCodes.BAD_REQUEST);
    }

    // Convert to Date object and normalize to start of day
    const bookingDateObj = new Date(bookingDate);
    bookingDateObj.setHours(0, 0, 0, 0);

    // Check if user exists and is a gymer
    const user = await User.findById(userId);
    if (!user || user.role !== 'gymer') {
      return createErrorResponse(res, "Invalid user or user is not a gymer", StatusCodes.BAD_REQUEST);
    }

    // Check if trainer exists
    const trainer = await User.findById(trainerId);
    if (!trainer || trainer.role !== 'trainer') {
      return createErrorResponse(res, "Invalid trainer", StatusCodes.BAD_REQUEST);
    }

    // Check if date is already booked
    const existingBooking = await Booking.findOne({
      trainerId,
      bookingDate: bookingDateObj,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingBooking) {
      return createErrorResponse(res, "Trainer is already booked on this date", StatusCodes.CONFLICT);
    }

    // Create new booking
    const newBooking = await Booking.create({
      userId,
      trainerId,
      bookingDate: bookingDateObj,
      sessionType,
      notes: notes || '',
      payment: {
        amount: 100, // Fixed price for demo
        currency: 'USD',
        status: 'pending'
      }
    });

    return createSuccessResponse(res, newBooking, "Booking created successfully", StatusCodes.CREATED);
  } catch (error) {
    console.error("Booking creation error:", error);
    return createErrorResponse(res, "Internal Server Error");
  }
});

/**
 * @route GET /booking/user/:userId
 * @desc Get bookings for a user
 */
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const bookings = await Booking.find({ userId })
      .populate('trainerId', 'name email')
      .sort({ bookingDate: -1 });

    // Format dates for display
    const formattedBookings = bookings.map(booking => ({
      ...booking.toObject(),
      bookingDate: formatDate(booking.bookingDate)
    }));

    return createSuccessResponse(res, formattedBookings);
  } catch (error) {
    console.error("Get user bookings error:", error);
    return createErrorResponse(res, "Internal Server Error");
  }
});

/**
 * @route GET /booking/trainer/:trainerId
 * @desc Get bookings and availability for a trainer
 */
router.get("/trainer/:trainerId", async (req, res) => {
  try {
    const { trainerId } = req.params;
    const { month } = req.query; // Format: YYYY-MM
    
    if (!month) {
      return createErrorResponse(res, "Month parameter is required", StatusCodes.BAD_REQUEST);
    }

    // Calculate start and end of month
    const startDate = new Date(`${month}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(0);

    // Get all bookings for the trainer in this month
    const bookings = await Booking.find({
      trainerId,
      bookingDate: {
        $gte: startDate,
        $lte: endDate
      }
    });

    // Extract booked dates
    const bookedDates = bookings.map(booking => formatDate(booking.bookingDate));

    return createSuccessResponse(res, {
      trainerId,
      month,
      bookedDates
    });
  } catch (error) {
    console.error("Get trainer availability error:", error);
    return createErrorResponse(res, "Internal Server Error");
  }
});

/**
 * @route PUT /booking/:id/status
 * @desc Update booking status
 */
router.put("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'];

    if (!validStatuses.includes(status)) {
      return createErrorResponse(res, "Invalid status", StatusCodes.BAD_REQUEST);
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedBooking) {
      return createErrorResponse(res, "Booking not found", StatusCodes.NOT_FOUND);
    }

    return createSuccessResponse(res, updatedBooking, "Booking status updated");
  } catch (error) {
    console.error("Update booking status error:", error);
    return createErrorResponse(res, "Internal Server Error");
  }
});

export default router;