import express from "express";
import User from "../models/User.model.js";
import bcrypt from "bcrypt";
import { createSuccessResponse, createErrorResponse } from "../utils/responseHandler.js";
import { sendEmailWithQRCode } from "../utils/emailHandler.js";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

/**
 * @route GET /auth/register
 * @desc Render register page
 */
router.get("/register", (req, res) => {
	return res.render("register", { company_name: process.env.COMPANY_NAME });
});

/**
 * @route POST /auth/register
 * @desc Register a new user
 */
router.post("/register", async (req, res) => {
	try {
		const { email, password, name, plan } = req.body;

		// validate required fields
		if (!email || !password) {
			return createErrorResponse(res, "Email and password are required");
		}

		// check if email exists
		const existingEmail = await User.findOne({ email }).lean();
		if (existingEmail) {
			return createErrorResponse(res, "Email already exists");
		}

		// hash password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Determine remaining trainer days based on plan
		let remainingTrainerDays = 0;
		switch (plan) {
			case "basic":
				remainingTrainerDays = 5;
				break;
			case "premium":
				remainingTrainerDays = 10;
				break;
			case "vip":
				remainingTrainerDays = 20;
				break;
			default:
				return createErrorResponse(res, "Invalid plan selected");
		}

		// create new user
		const savedUser = await User.create({
			password: hashedPassword,
			name: (name || "").trim(),
			email: email,
			plan: plan,
			remainingTrainerDays: remainingTrainerDays,
		});

		// Add email notification for registration event
		// Ensure email is valid before sending email notification
		if (!email || typeof email !== "string" || !email.includes("@")) {
			console.error("Invalid email address provided for notification");
			return createErrorResponse(res, "Invalid email address");
		}
		await sendEmailWithQRCode({
			to: email,
			subject: `Welcome to ${process.env.COMPANY_NAME}!`,
			text: `Thank you for registering with ${process.env.COMPANY_NAME}. Your account has been created successfully.`,
			html: "<h1>Thank you for registering!</h1><p>localhost:3030/auth/register</p>",
		});

		// create user response
		const userResp = {
			id: savedUser._id,
			name: savedUser.name,
			email: savedUser.email,
			plan: savedUser.plan,
			role: savedUser.role,
		};

		return createSuccessResponse(res, userResp);
	} catch (error) {
		console.error("POST /auth/register error:", error);
		return createErrorResponse(res, "Internal Server Error");
	}
});

/**
 * @route GET /auth/login
 * @desc Render login page
 */
router.get("/login", (req, res) => {
	return res.render("login", { email: "", password: "", company_name: process.env.COMPANY_NAME });
});

/**
 * @route POST /auth/login
 * @desc Login user
 */
router.post("/login", async (req, res) => {
	try {
		const { email, password } = req.body;
		console.log(req.body);

		// validate required fields
		if (!email || !password) {
			return createErrorResponse(res, "Email and password are required");
		}

		// find user by email
		const user = await User.findOne({ email }).select("+password");
		console.log(user);
		if (!user) {
			// generic message to avoid user enumeration
			return createErrorResponse(res, "Invalid email or password");
		}

		// compare password
		const passwordMatch = await bcrypt.compare(password, user.password);
		if (!passwordMatch) {
			return createErrorResponse(res, "Invalid email or password");
		}

		// Add email notification for login event
		// Ensure email is valid before sending email notification
		if (!email || typeof email !== "string" || !email.includes("@")) {
			console.error("Invalid email address provided for login notification");
			return createErrorResponse(res, "Invalid email address");
		}
		await sendEmailWithQRCode({
			to: email,
			subject: `Login Notification - ${process.env.COMPANY_NAME}`,
			text: `Your account was logged into ${process.env.COMPANY_NAME}. If this wasn't you, contact support immediately.`,
			html: "<h1>Thank you for logging in</h1><p>localhost:3030/auth/login</p>",
		});

		// create user response
		const userResp = {
			id: user._id,
			email: user.email,
		};

		// Add to login route after successful authentication
		req.session.user = {
			id: user._id,
			email: user.email,
			name: user.name,
			plan: user.plan,
			role: user.role,
			remainingTrainerDays: user.remainingTrainerDays,
		};

		// Redirect to dashboard instead of returning JSON
		// return res.redirect("/dashboard");
		return createSuccessResponse(res, userResp);
	} catch (error) {
		console.error("POST /auth/login error:", error);
		return createErrorResponse(res, "Internal Server Error");
	}
});

/**
 * @route GET /auth/logout
 * @desc destroy session to logout
 *        then return to login page
 */
// Add logout route
router.get("/logout", (req, res) => {
	req.session.destroy((err) => {
		if (err) {
			console.error("Logout error:", err);
		}
		res.redirect("/auth/login");
	});
});

/**
 * @route GET /auth/resetPassword
 * @desc Render reset password page
 */
router.get("/resetPassword", (req, res) => {
	return res.render("resetPassword");
});

/**
 * @route POST /auth/resetPassword
 * @desc Reset password
 */
router.post("/resetPassword", async (req, res) => {
	try {
		const { email, newPassword, confirmPassword } = req.body;

		// validate required fields
		if (!email || !newPassword || !confirmPassword) {
			return createErrorResponse(res, "Email and password are required");
		}

		// validate password
		if (newPassword !== confirmPassword) {
			return createErrorResponse(res, "Passwords do not match");
		}

		// find user by email
		const user = await User.findOne({ email: email });
		if (!user) {
			return createErrorResponse(res, "User not found");
		}

		// update user password
		user.password = await bcrypt.hash(newPassword, 10);
		await user.save();

		// Add email notification for password reset event
		// Ensure email is valid before sending email notification
		if (!email || typeof email !== "string" || !email.includes("@")) {
			console.error("Invalid email address provided for notification");
			return createErrorResponse(res, "Invalid email address");
		}
		await sendEmailWithQRCode({
			to: email,
			subject: `Password Reset Confirmation - ${process.env.COMPANY_NAME}`,
			text: `Your password for ${process.env.COMPANY_NAME} has been successfully reset. If this wasn't you, contact support immediately.`,
			html: "<h1>Thank you for resetting your password</h1><p>localhost:3030/auth/resetPassword</p>",
		});

		const userResp = { id: user._id };

		return createSuccessResponse(res, userResp);
	} catch (error) {
		console.error("POST /auth/resetPassword error:", error);
		return createErrorResponse(res, "Internal Server Error");
	}
});

export default router;
