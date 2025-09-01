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

// Middleware to check authentication
const isAuthenticated = (req, res, next) => {
	if (!req.session.user) {
		return res.redirect("/auth/login");
	}
	next();
};

// Middleware to ensure superuser role
const isSuperuser = (req, res, next) => {
  if (!req.session?.user) {
    return createErrorResponse(res, "Unauthorized", StatusCodes.UNAUTHORIZED);
  }
  if (req.session.user.role !== 'superuser') {
    return createErrorResponse(res, "Forbidden", StatusCodes.FORBIDDEN);
  }
  next();
};

router.get("/create", isAuthenticated, async (req, res, next) => {
  try {
    // Get all trainers
    const trainers = await User.find({ role: 'trainer' }).select('name _id');
    const selectedTrainerId = req.query.trainer || null;

    if (trainers.length > 0) {
      trainers.forEach(trainer => {
        if (trainer.name == "Bee Cho") {
          trainer['avatar'] = "../pic/trainer1.avif";
          trainer['description'] = "Expert in Weight Training with over 10 years of experience.";
        } else if (trainer.name == "Yami Li") {
          trainer['avatar'] = "../pic/trainer2.avif";
          trainer['description'] = "Kick-boxing champion and certified instructor.";
        } else if (trainer.name == "Elvis Lam") {
          trainer['avatar'] = "../pic/trainer3.avif";
          trainer['description'] = "Stretch recovery specialist and yoga coach.";
        }
      })
    }
    
    res.render("booking", { 
      company_name: process.env.COMPANY_NAME,
      trainers,
      //user: req.user || {} // Assuming you have user in session
      user: req.session.user, // Use session user here
      selectedTrainerId // Pass the selected trainer ID to the view
    });
  } catch (error) {
    console.error("Booking page error:", error);
    res.status(500).render("error", { message: "Internal Server Error" });
  }
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

    // Check if user exists and the user's role is gymer
    const user = await User.findById(userId);
    if (!user || user.role !== 'gymer') {
      return createErrorResponse(res, "Invalid user or user is not a gymer", StatusCodes.BAD_REQUEST);
    }

    // Check if trainer exists and the trainer's role is trainer
    const trainer = await User.findById(trainerId);
    if (!trainer || trainer.role !== 'trainer') {
      return createErrorResponse(res, "Invalid trainer", StatusCodes.BAD_REQUEST);
    }

    // Check if trainer date is already booked
    const existingTrainerBooking = await Booking.findOne({
      trainerId,
      bookingDate: bookingDateObj,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingTrainerBooking) {
      return createErrorResponse(res, "Trainer is already booked on this date", StatusCodes.CONFLICT);
    }

    // Check if user has remaining trainer days
    if (user.remainingTrainerDays <= 0) {
      return createErrorResponse(res, "You have no remaining trainer days. Please renew your plan to book a trainer.", StatusCodes.FORBIDDEN);
    }

    // Check if user date is already booked
    const existingUserBooking = await Booking.findOne({
      userId,
      bookingDate: bookingDateObj,
    });
    if (existingUserBooking) {
      return createErrorResponse(res, "You have already booked on this date", StatusCodes.CONFLICT);
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
        currency: 'HKD',
        status: 'pending'
      }
    });

    // Deduct 1 from remainingTrainerDays
    await User.findByIdAndUpdate(userId, { $inc: { remainingTrainerDays: -1 } });

    // Update session data
    req.session.user.remainingTrainerDays -= 1;

    // FIX_ME: Make the following email sending part a function to avoid code duplication
    // Send booking confirmation email to user
		// Ensure email is valid before sending email notification
		if (!user.email || typeof user.email !== 'string' || !user.email.includes('@')) {
			console.error("Invalid email address provided for notification");
			return createErrorResponse(res, "Invalid email address");
		}
		await sendEmailWithQRCode({
			to: user.email,
			subject: `New Booking Notification - ${process.env.COMPANY_NAME}`,
			text: `Your session with "${trainer.name}" has been booked for ${bookingDateObj.toDateString()}.`,
			html: `<h1>Thank you for booking our trainer "${trainer.name}" for ${bookingDateObj.toDateString()}</h1><p>localhost:3030/booking/create</p>`,
    });
	  if (!trainer.email || typeof trainer.email !== 'string' || !trainer.email.includes('@')) {
			console.error("Invalid email address provided for notification");
			return createErrorResponse(res, "Invalid email address");
		}
		await sendEmailWithQRCode({
			to: trainer.email,
			subject: `New Booking Notification - ${process.env.COMPANY_NAME}`,
			text: `You have a new booking from "${user.name}" on ${bookingDateObj.toDateString()}.`,
			html: `<h1>Please take good care of our gymer "${user.name}" on ${bookingDateObj.toDateString()}</h1><p>localhost:3030/booking/create</p>`,
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

    const booking = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('userId trainerId');

    if (!booking) {
      return createErrorResponse(res, "Booking not found", StatusCodes.NOT_FOUND);
    }

    // FIX_ME: Make the following email sending part a function to avoid code duplication
    // FIX_ME: The following code block is almost identical to the DELETE /booking/:id route handler.
		if (booking.status !== "completed") {
		  const updatedGymer = await User.findById(
				booking.userId,
        // the next 2 line are only for findByIdAndUpdate
				//{ $inc: { remainingTrainerDays: +1 } }, // Increment 'remainingTrainerDays' by 1
				//{ new: true } // Return the modified document
			);
			if (!updatedGymer) {
				return createErrorResponse(res, "Gymer not found", StatusCodes.NOT_FOUND);
			}
		  const updatedTrainer = await User.findById(
				booking.trainerId,
        // the next 2 lines are only for findByIdAndUpdate
        //{ $inc: { remainingTrainerDays: +1 } }, // Increment 'remainingTrainerDays' by 1
			 	//{ new: true } // Return the modified document
			);
			if (!updatedTrainer) {
				return createErrorResponse(res, "Trainer not found", StatusCodes.NOT_FOUND);
			}      
			await booking.deleteOne();
      if (!updatedGymer.email || typeof updatedGymer.email !== 'string' || !updatedGymer.email.includes('@')) {
        console.error("Invalid email address provided for booking notification");
        return res.status(400).send("Invalid email address");
      }
      await sendEmailWithQRCode({
        to: updatedGymer.email,
        subject: `Booking deleted - ${process.env.COMPANY_NAME}`,
        text: `Your booking has been deleted. Please check your account for details.`,
   			html: "<h1>Sorry, your booking has been deleted!</h1><p>localhost:3030/booking/:id (req: DELETE)</p>",
      });
      if (!updatedTrainer.email || typeof updatedTrainer.email !== 'string' || !updatedTrainer.email.includes('@')) {
        console.error("Invalid email address provided for booking notification");
        return res.status(400).send("Invalid email address");
      }
      await sendEmailWithQRCode({
        to: updatedTrainer.email,
        subject: `Booking deleted - ${process.env.COMPANY_NAME}`,
        text: `Your booking has been deleted. Please check your account for details.`,
   			html: "<h1>Sorry, your booking has been deleted!</h1><p>localhost:3030/booking/:id (req: DELETE)</p>",
      });
    }
    else {
      return createSuccessResponse(res, { id }, "Booking cannot be deleted as it is completed");
		}
    return createSuccessResponse(res, booking, "Booking status updated");
  } catch (error) {
    console.error("Update booking status error:", error);
    return createErrorResponse(res, "Internal Server Error");
  }
});

/**
 * @route DELETE /booking/:id
 * @desc Delete a booking (superuser only)
 */
router.delete("/:id", isAuthenticated, isSuperuser, async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    if (!booking) {
      return createErrorResponse(res, "Booking not found", StatusCodes.NOT_FOUND);
    }

		// Update status
		if (booking.status !== "completed") {
		  const updatedGymer = await User.findByIdAndUpdate(
				booking.userId,
				{ $inc: { remainingTrainerDays: +1 } }, // Increment 'remainingTrainerDays' by 1
				{ new: true } // Return the modified document
			);
			if (!updatedGymer) {
				return createErrorResponse(res, "Gymer not found", StatusCodes.NOT_FOUND);
			}
		  const updatedTrainer = await User.findById(
				booking.trainerId
        // the next 2 lines are only for findByIdAndUpdate
				//{ $inc: { remainingTrainerDays: +1 } }, // Increment 'remainingTrainerDays' by 1
			  //{ new: true } // Return the modified document
			);
			if (!updatedTrainer) {
				return createErrorResponse(res, "Trainer not found", StatusCodes.NOT_FOUND);
			}      
			await booking.deleteOne();

      // FIX_ME: Make the following email sending part a function to avoid code duplication
      if (!updatedGymer.email || typeof updatedGymer.email !== 'string' || !updatedGymer.email.includes('@')) {
        console.error("Invalid email address provided for booking notification");
        return res.status(400).send("Invalid email address");
      }
      await sendEmailWithQRCode({
        to: updatedGymer.email,
        subject: `Booking deleted - ${process.env.COMPANY_NAME}`,
        text: `Your booking has been deleted. Please check your account for details.`,
   			html: "<h1>Sorry, your booking has been deleted!</h1><p>localhost:3030/booking/:id (req: DELETE)</p>",
      });
      console.log("Email sent to gymer:", updatedGymer.email);
      console.log("Email sennd to trainer:", updatedTrainer.email);
      if (!updatedTrainer.email || typeof updatedTrainer.email !== 'string' || !updatedTrainer.email.includes('@')) {
        console.error("Invalid email address provided for booking notification");
        return res.status(400).send("Invalid email address");
      }
      await sendEmailWithQRCode({
        to: updatedTrainer.email,
        subject: `Booking deleted - ${process.env.COMPANY_NAME}`,
        text: `Your booking has been deleted. Please check your account for details.`,
   			html: "<h1>Sorry, your booking has been deleted!</h1><p>localhost:3030/booking/:id (req: DELETE)</p>",
      });
		}
    else {
      return createSuccessResponse(res, { id }, "Booking cannot be deleted as it is completed");
		}
    return createSuccessResponse(res, { id }, "Booking deleted successfully");
  } catch (error) {
    console.error("Delete booking error:", error);
    return createErrorResponse(res, "Internal Server Error");
  }
});

export default router;
