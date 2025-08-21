import express from "express";
import Booking from "../models/Booking.model.js";
import User from "../models/User.model.js";
import { createSuccessResponse, createErrorResponse } from "../utils/responseHandler.js";
import StatusCodes from "../utils/statusCodes.js";
import { sendEmailWithQRCode } from "../utils/emailHandler.js";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

// Helper to format date to YYYY-MM-DD
const formatDate = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// Add this middleware to protect routes
router.use((req, res, next) => {
  if (!req.session.user) {
    return createErrorResponse(res, "Authentication required", StatusCodes.UNAUTHORIZED);
  }
  next();
});

/**
 * @route POST /booking/create
 * @desc Create a new booking (date only)
 */
router.post("/create", async (req, res) => {
  try {
    //const { userId, trainerId, bookingDate, sessionType, notes } = req.body;

    // Get user ID from session instead of body
    const userId = req.session.user.id;
    const { trainerId, bookingDate, sessionType, notes } = req.body;

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

    // Check if user has remaining trainer days
    if (user.remainingTrainerDays <= 0) {
      return createErrorResponse(res, "You have no remaining trainer days. Please renew your plan to book a trainer.", StatusCodes.FORBIDDEN);
    }

    // Determine payment amount based on user's plan
    let paymentAmount = 0;
    switch (user.plan) {
      case 'basic':
        paymentAmount = 100;
        break;
      case 'premium':
        paymentAmount = 150;
        break;
      case 'vip':
        paymentAmount = 200;
        break;
      default:
        return createErrorResponse(res, "Invalid plan selected", StatusCodes.BAD_REQUEST);
    }

    // Create new booking
    const newBooking = await Booking.create({
      userId,
      trainerId,
      bookingDate: bookingDateObj,
      sessionType,
      notes: notes || '',
      payment: {
        amount: paymentAmount,
        currency: 'USD',
        status: 'pending'
      }
    });

    // Deduct 1 from remainingTrainerDays
    await User.findByIdAndUpdate(userId, { $inc: { remainingTrainerDays: -1 } });

    // Update session data
    req.session.user.remainingTrainerDays -= 1;

    // Send booking confirmation email to user
		// Ensure email is valid before sending email notification
		if (!user.email || typeof user.email !== 'string' || !user.email.includes('@')) {
			console.error("Invalid email address provided for notification");
			return createErrorResponse(res, "Invalid email address");
		}
		await sendEmailWithQRCode({
			to: user.email,
			subject: `New Booking Notification - ${process.env.COMPANY_NAME}`,
			text: `Your session with ${trainer.name} has been booked for ${bookingDateObj.toDateString()}.`,
			html: `<!DOCTYPE html><h1>Thank you for booking our trainer ${trainer.name} for ${bookingDateObj.toDateString()}</h1><p>localhost:3030/booking/create</p>`,
    });
	  if (!trainer.email || typeof trainer.email !== 'string' || !trainer.email.includes('@')) {
			console.error("Invalid email address provided for notification");
			return createErrorResponse(res, "Invalid email address");
		}
		await sendEmailWithQRCode({
			to: trainer.email,
			subject: `New Booking Notification - ${process.env.COMPANY_NAME}`,
			text: `You have a new booking from ${user.name} on ${bookingDateObj.toDateString()}.`,
			html: `<!DOCTYPE html><h1>Please take good care of our gymer ${user.name} on ${bookingDateObj.toDateString()}</h1><p>localhost:3030/booking/create</p>`,
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
    ).populate('userId trainerId');

    if (!updatedBooking) {
      return createErrorResponse(res, "Booking not found", StatusCodes.NOT_FOUND);
    }

    // Send status update email to user
    try {
      await sendEmailWithQRCode(
        updatedBooking.userId.email,
        `Booking Status Update - ${process.env.COMPANY_NAME}`,
        `<h1>Booking Status Updated</h1>
        <p>Your session with ${updatedBooking.trainerId.name} on ${updatedBooking.bookingDate.toDateString()}</p>
        <p>has been updated to: ${status}</p>`
      );
    } catch (emailError) {
      console.error("Failed to send status update email:", emailError);
    }

    // Add email notification for booking update
    // Ensure email is valid before sending email notification
    if (!updatedBooking.userEmail || typeof updatedBooking.userEmail !== 'string' || !updatedBooking.userEmail.includes('@')) {
      console.error("Invalid email address provided for booking notification");
      return res.status(400).send("Invalid email address");
    }

    await sendEmailWithQRCode({
      to: updatedBooking.userEmail,
      subject: `Booking Update - ${process.env.COMPANY_NAME}`,
      text: `Your booking has been updated. Please check your account for details.`
    });

    return createSuccessResponse(res, updatedBooking, "Booking status updated");
  } catch (error) {
    console.error("Update booking status error:", error);
    return createErrorResponse(res, "Internal Server Error");
  }
});

export default router;