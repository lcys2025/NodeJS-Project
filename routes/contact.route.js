import express from "express";
import dotenv from "dotenv";
import { createSuccessResponse, createErrorResponse } from "../utils/responseHandler.js";


dotenv.config();
const router = express.Router();

/**
 * @route GET /contact
 * @desc Contact Us
 */
router.get('/', function(req, res, next) {
  res.render('contact', { company_name: process.env.COMPANY_NAME });
});

/**
 * @route POST /contact
 * @desc Contact Us
 */
router.post("/", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    console.log(name, email, message);

    // validate required fields
    if (!name || !email || !message) {
      return createErrorResponse(res, "Name, email and message are required");
    }

    // create user response 
    // FIX_ME for seding email out
    const userResp = {
      name: name,
      email: email,
      message: message,
    };

    //return createSuccessResponse(res, userResp);
    return res.redirect('/');
  } catch (error) {
    console.error("POST /contact/ error:", error);
    return createErrorResponse(res, "Internal Server Error");
  }
});

export default router;
