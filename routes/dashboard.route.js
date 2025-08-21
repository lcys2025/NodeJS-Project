import express from "express";
import Booking from "../models/Booking.model.js";
import User from "../models/User.model.js";
import dotenv from "dotenv";
import { createErrorResponse } from "../utils/responseHandler.js";
import StatusCodes from "../utils/statusCodes.js";

dotenv.config();
const router = express.Router();

// Middleware to check authentication
const isAuthenticated = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }
  next();
};

// Dashboard main view
router.get("/", isAuthenticated, async (req, res) => {
  try {
    const user = req.session.user;
    let data = {};
    
    if (user.role === 'gymer') {
      // Get upcoming bookings for gymer
      data.bookings = await Booking.find({ 
        userId: user.id,
        bookingDate: { $gte: new Date().setHours(0,0,0,0) }
      })
        .populate('trainerId', 'name')
        .sort({ bookingDate: 1 })
        .limit(5);
      
      // Get available trainers
      data.trainers = await User.find({ role: 'trainer' }).select('name _id');

      // Add remaining trainer days for gymer
      data.remainingTrainerDays = user.remainingTrainerDays;
    } 
    else if (user.role === 'trainer') {
      // Get month and year from query, or use current
      let month = req.query.month ? parseInt(req.query.month) : (new Date().getMonth() + 1);
      let year = req.query.year ? parseInt(req.query.year) : (new Date().getFullYear());

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
      const startDate = new Date(`${year}-${String(month).padStart(2, '0')}-01`);
      const endDate = new Date(year, month, 0);

      data.bookings = await Booking.find({
        trainerId: user.id,
        bookingDate: { $gte: startDate, $lte: endDate }
      }).populate('userId', 'name');

      // Format calendar data
      data.calendar = {
        month: new Date(year, month - 1).toLocaleString('default', { month: 'long' }),
        year: year,
        prevMonth,
        prevYear,
        nextMonth,
        nextYear,
        days: []
      };

      // Generate days for calendar
      const daysInMonth = new Date(year, month, 0).getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const booking = data.bookings.find(b =>
          b.bookingDate.toISOString().split('T')[0] === dateStr
        );

        data.calendar.days.push({
          date: dateStr,
          day: day,
          booked: !!booking,
          booking: booking
        });
      }
      data.remainingTrainerDays = user.remainingTrainerDays;
}

    // Check for booking success flag
    const bookingSuccess = req.query.booking === 'success';
    
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
        paymentAmount = 0;
    }

    // Add payment amount to data
    data.paymentAmount = paymentAmount;

    // Determine payment status based on user's plan
    let paymentStatus = 'pending'; // Default status
    if (user.plan === 'basic' || user.plan === 'premium' || user.plan === 'vip') {
      paymentStatus = 'confirmed'; // Example logic for confirmed plans
    }

    // Add payment status to data
    data.paymentStatus = paymentStatus;

    // Debug log for user plan
    console.log('User Plan:', user.plan);
    
    res.render("dashboard", {
      company_name: process.env.COMPANY_NAME,
      user: user,
      data: data,
      bookingSuccess // Pass to template
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    createErrorResponse(res, "Internal Server Error");
  }
});

// Update booking status (for trainers)
router.post("/update-status", isAuthenticated, async (req, res) => {
  try {
    const { bookingId, status } = req.body;
    const user = req.session.user;
    
    // Validate user is trainer
    if (user.role !== 'trainer') {
      return createErrorResponse(res, "Unauthorized", StatusCodes.UNAUTHORIZED);
    }
    
    // Validate booking belongs to trainer
    const booking = await Booking.findById(bookingId);
    if (!booking || booking.trainerId.toString() !== user.id) {
      return createErrorResponse(res, "Booking not found", StatusCodes.NOT_FOUND);
    }
    
    // Update status
    booking.status = status;
    await booking.save();
    
    return res.redirect("/dashboard");
  } catch (error) {
    console.error("Status update error:", error);
    createErrorResponse(res, "Internal Server Error");
  }
});

export default router;