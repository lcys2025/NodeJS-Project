import express from "express";
import dotenv from "dotenv";
import { createSuccessResponse, createErrorResponse } from "../utils/responseHandler.js";
import { sendEmailWithQRCode } from "../utils/emailHandler.js";

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

    if (!email || typeof email !== "string" || !email.includes("@")) {
      console.error("Invalid email address provided for notification");
      return createErrorResponse(res, "Invalid email address");
    }
    await sendEmailWithQRCode({
      to: email,
      subject: `Thank you for contacting ${process.env.COMPANY_NAME}!`,
      text: `Thank you for contacting ${process.env.COMPANY_NAME}. Your message is important to us.`,
      html: `<h1>Thank you for contacting us!</h1><p>message: ${message}</p><p>localhost:3030/contact</p>`,
    });

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
