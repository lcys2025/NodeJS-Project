import express from "express";
import User from "../models/User.model.js";
import Booking from "../models/Booking.model.js";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

// Middleware to check authentication
const isAuthenticated = (req, res, next) => {
	if (!req.session.user) {
		return res.redirect("/auth/login");
	}
	next();
};

router.get("/", isAuthenticated, async (req, res, next) => {
  try {
    // Get all trainers
    const bookings = await Booking.find(); 
    const users = await User.find(); 
    console.log(bookings.length);
    res.render("bookings", { 
        company_name: process.env.COMPANY_NAME,
        bookings,
        users,
        //user: req.user || {} // Assuming you have user in session
        user: req.session.user, // Use session user here
      });
  } catch (error) {
    console.error("Booking page error:", error);
    res.status(500).render("error", { message: "Internal Server Error" });
  }
});

router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const bookings = await Booking.find({ userId })
      .populate('trainerId', 'name')
      .sort({ bookingDate: -1 });
    
    res.render("bookings", {
      company_name: process.env.COMPANY_NAME,
      bookings,
      user: req.user || {}
    });
  } catch (error) {
    console.error("Bookings page error:", error);
    res.status(500).render("error", { message: "Internal Server Error" });
  }
});

export default router;