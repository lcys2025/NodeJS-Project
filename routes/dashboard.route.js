import express from "express";
import Booking from "../models/Booking.model.js";
import User from "../models/User.model.js";
import dotenv from "dotenv";
import { createErrorResponse, createSuccessResponse } from "../utils/responseHandler.js";
import StatusCodes from "../utils/statusCodes.js";
import { sendEmailWithQRCode } from "../utils/emailHandler.js";

dotenv.config();
const router = express.Router();

// Middleware to check authentication
const isAuthenticated = async (req, res, next) => {
	if (req.session.user) {
		return next();
	}
	if (req.isAuthenticated()) {
		const email = req.user.email;
		// Fetch user from DB to sync session data
		const user = await User.findOne({ email });
		req.session.user = {
			id: user._id,
			email: user.email,
			name: user.name,
			plan: user.plan,
			role: user.role,
			remainingTrainerDays: user.remainingTrainerDays,
		};
		return next();
	}
	res.redirect("auth/login");
};

// Dashboard main view
router.get("/", isAuthenticated, async (req, res, next) => {
	try {
		const user = req.session.user;
		let data = {};

		if (user.role === "gymer") {
			// Get upcoming bookings for gymer
			data.bookings = await Booking.find({
				userId: user.id,
				bookingDate: { $gte: new Date().setHours(0, 0, 0, 0) },
			})
				.populate("trainerId", "name")
				.sort({ bookingDate: 1 })
				.limit(5);

			// Get available trainers
			data.trainers = await User.find({ role: "trainer" }).select("name _id");

			// Add remaining trainer days for gymer
			data.remainingTrainerDays = user.remainingTrainerDays;
		} else if (user.role === "trainer") {
			// Get month and year from query, or use current
			let month = req.query.month ? parseInt(req.query.month) : new Date().getMonth() + 1;
			let year = req.query.year ? parseInt(req.query.year) : new Date().getFullYear();

			// Calculate previous and next month/year
			let prevMonth = month - 1;
			let prevYear = year;
			if (prevMonth < 1) {
				prevMonth = 12;
				prevYear -= 1;
			}
			let nextMonth = month + 1;
			let nextYear = year;
			if (nextMonth > 12) {
				nextMonth = 1;
				nextYear += 1;
			}

			// Get bookings for the month
			const startDate = new Date(`${year}-${String(month).padStart(2, "0")}-01`);
			const endDate = new Date(year, month, 0);

			data.bookings = await Booking.find({
				trainerId: user.id,
				bookingDate: { $gte: startDate, $lte: endDate },
			}).populate("userId", "name");

			// Format calendar data
			data.calendar = {
				month: new Date(year, month - 1).toLocaleString("default", { month: "long" }),
				year: year,
				prevMonth,
				prevYear,
				nextMonth,
				nextYear,
				days: [],
			};

			// Generate days for calendar
			const daysInMonth = new Date(year, month, 0).getDate();
			for (let day = 1; day <= daysInMonth; day++) {
				const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
				const booking = data.bookings.find((b) => b.bookingDate.toISOString().split("T")[0] === dateStr);

				data.calendar.days.push({
					date: dateStr,
					day: day,
					booked: !!booking,
					booking: booking,
				});
			}
			data.remainingTrainerDays = user.remainingTrainerDays;
		} else if (user.role === "superuser") {
			data.bookings = await Booking.find({ bookingDate: { $gte: new Date().setHours(0, 0, 0, 0) } })
				.populate("trainerId", "name")
				.sort({ bookingDate: 1 });
		}

		// Check for booking success flag
		const bookingSuccess = req.query.booking === "success";

		// Determine payment amount based on user's plan
		let paymentAmount = 0;
		switch (user.plan) {
			case "basic":
				paymentAmount = 100;
				break;
			case "premium":
				paymentAmount = 150;
				break;
			case "vip":
				paymentAmount = 200;
				break;
			default:
				paymentAmount = 0;
		}

		// Add payment amount to data
		data.paymentAmount = paymentAmount;

		// Determine payment status based on user's plan
		let paymentStatus = "pending"; // Default status
		if (user.plan === "basic" || user.plan === "premium" || user.plan === "vip") {
			paymentStatus = "confirmed"; // Example logic for confirmed plans
		}

		data.paymentStatus = paymentStatus;

		res.render("dashboard", {
			company_name: process.env.COMPANY_NAME,
			user: user,
			data: data,
			bookingSuccess, // Pass to template
		});
		next();
	} catch (error) {
		console.error("Dashboard error:", error);
		createErrorResponse(res, "Internal Server Error");
	}
});

// Update booking status (for trainers)
router.post("/update-status", isAuthenticated, async (req, res, next) => {
	try {
		const { bookingId, status } = req.body;
		const user = req.session.user;

		// Validate user is trainer
		if (user.role !== "trainer") {
			return createErrorResponse(res, "Unauthorized", StatusCodes.UNAUTHORIZED);
		}

		// Validate booking belongs to trainer
		const booking = await Booking.findById(bookingId);
		if (!booking || booking.trainerId.toString() !== user.id) {
			return createErrorResponse(res, "Booking not found", StatusCodes.NOT_FOUND);
		}

        // FIX_ME: Make the following email sending part a function to avoid code duplication
		// Update status
		if (status === "cancelled") {
			const updatedUser = await User.findByIdAndUpdate(
				booking.userId,
				{ $inc: { remainingTrainerDays: +1 } }, // Increment 'remainingTrainerDays' by 1
				{ new: true } // Return the modified document
			);
			if (!updatedUser) {
				return createErrorResponse(res, "User not found", StatusCodes.NOT_FOUND);
			}
			await booking.deleteOne();
			// Add email notification for password reset event
			// Ensure email is valid before sending email notification
			if (!updatedUser.email || typeof updatedUser.email !== "string" || !updatedUser.email.includes("@")) {
				//return createErrorResponse(res, "Invalid email address");
				console.error("POST /bashboard/update-status 'Invalid email address' error.");
				return res.redirect(StatusCodes.SEE_OTHER, "/");
			}
			await sendEmailWithQRCode({
				to: updatedUser.email,
				subject: `Booking cancelled Confirmation - ${process.env.COMPANY_NAME}`,
				text: `Your booking has been cancelled for ${process.env.COMPANY_NAME}.`,
				html: "<h1>Sorry, your booking has been cancelled.</h1><p>localhost:3030//bashboard/update-status (req: POST)</p>",
			});
			if (!user.email || typeof user.email !== "string" || !user.email.includes("@")) {
				//return createErrorResponse(res, "Invalid email address");
				console.error("POST /bashboard/update-status 'Invalid email address' error.");
				return res.redirect(StatusCodes.SEE_OTHER, "/");
			}
			await sendEmailWithQRCode({
				to: user.email,
				subject: `Booking cancelled Confirmation - ${process.env.COMPANY_NAME}`,
				text: `Your booking has been cancelled for ${process.env.COMPANY_NAME}.`,
				html: "<h1>Sorry, your booking has been cancelled.</h1><p>localhost:3030//bashboard/update-status (req: POST)</p>",
			});
		} else {
			booking.status = status;
			await booking.save();
		}

		return res.json(createSuccessResponse(res, {}));
	} catch (error) {
		console.error("Status update error:", error);
		createErrorResponse(res, "Internal Server Error");
	}
});

export default router;
