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

router.get("/", isAuthenticated, async (req, res) => {
  try {
    // Get all trainers
    const trainers = await User.find({ role: 'trainer' }).select('name _id');
    const selectedTrainerId = req.query.trainer || null;

    console.log('Selected Trainer ID:', selectedTrainerId); // Debug log for selectedTrainerId
    if (trainers.length > 0) {
      trainers.forEach(trainer => {
        if (trainer.name == "Bee Cho") {
          trainer['avatar'] = "pic/trainer1.avif";
          trainer['description'] = "Expert in Weight Training with over 10 years of experience.";
        } else if (trainer.name == "Yami Li") {
          trainer['avatar'] = "pic/trainer2.avif";
          trainer['description'] = "Kick-boxing champion and certified instructor.";
        } else if (trainer.name == "Elvis Lam") {
          trainer['avatar'] = "pic/trainer3.avif";
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