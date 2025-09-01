import express from "express";
import User from "../models/User.model.js";
import bcrypt from "bcrypt";
import { createSuccessResponse, createErrorResponse } from "../utils/responseHandler.js";
import { sendEmailWithQRCode } from "../utils/emailHandler.js";
import dotenv from "dotenv";
import passport from "passport";
import StatusCodes from "../utils/statusCodes.js";


dotenv.config();
const router = express.Router();

/**
 * @route GET /auth/register
 * @desc Render register page
 */
router.get("/register", (req, res) => {
	try {
		const prefilledEmail = req.query.email === undefined ? undefined : String(req.query.email).toLowerCase().trim();
		const emailLocked = req.query.lock === "1" || req.query.lock === "true";
		return res.render("register", {
			company_name: process.env.COMPANY_NAME,
			prefilledEmail,
			emailLocked,
		});
	} catch (error) {
		console.error("GET /auth/register error:", error);
		return res.redirect("/");
	}
});

/**
 * @route POST /auth/register
 * @desc Register a new user
 */
router.post("/register", async (req, res) => {
	try {
		const { name, email, password, confirmPassword, plan } = req.body;
		// validate required fields
		if (!name || !email || !password || !confirmPassword || !plan) {
			//return createErrorResponse(res, "Name, email, password, confirm password and plan are required");
			console.error("POST /auth/register 'Name, email, password, confirm password and plan are required' error.");
			return res.redirect(StatusCodes.SEE_OTHER, "/");
		}

		// check if email exists
		const existingEmail = await User.findOne({ email }).lean();
		if (existingEmail) {
			//return createErrorResponse(res, "Email already exists");
			console.error("POST /auth/register 'Email already exists' error.");
			return res.redirect(StatusCodes.SEE_OTHER, "/");
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
				//return createErrorResponse(res, "Invalid plan selected");
				console.error("POST /auth/register 'Invalid plan selected' error.");
				return res.redirect(StatusCodes.SEE_OTHER, "/");
		}

		// create new user
		const savedUser = await User.create({
			password: hashedPassword,
			name: (name || "").trim(),
			email: email,
			plan: plan,
			remainingTrainerDays: remainingTrainerDays,
		});

		await sendEmailWithQRCode({
			res: res,
			to: email,
			subject: '',
			text: '',
			html: '',
            keyword: 'POST /auth/register'
		});

		// create user response
		const userResp = {
			id: savedUser._id,
			name: savedUser.name,
			email: savedUser.email,
			plan: savedUser.plan,
			role: savedUser.role,
		};

		//return createSuccessResponse(res, userResp);
		res.redirect(StatusCodes.FOUND, "/auth/login");
	} catch (error) {
		//return createErrorResponse(res, "Internal Server Error");
		console.error("POST /auth/register error:", error);
		return res.redirect("/");
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

		// validate required fields
		if (!email || !password) {
			//return createErrorResponse(res, "Email and password are required");
			console.error("POST /auth/login 'Email and password are required' error.");
			return res.redirect(StatusCodes.SEE_OTHER, "/");
		}

		// find user by email
		const user = await User.findOne({ email }).select("+password");
		if (!user) {
			// generic message to avoid user enumeration
			//return createErrorResponse(res, "Invalid email or not yet registered");
			console.error("POST /auth/login 'Invalid email or not yet registered' error.");
			return res.redirect(StatusCodes.SEE_OTHER, "/");
		}

		// compare password
		const passwordMatch = await bcrypt.compare(password, user.password);
		if (!passwordMatch) {
			//return createErrorResponse(res, "Invalid password");
			console.error("POST /auth/login 'Invalid password' error.");
			return res.redirect(StatusCodes.SEE_OTHER, "/");
		}

		await sendEmailWithQRCode({
			res: res,
			to: email,
			subject: '',
			text: '',
			html: '',
            keyword: 'POST /auth/login'
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
		//return createSuccessResponse(res, userResp);
		res.redirect(StatusCodes.FOUND, "/dashboard");
	} catch (error) {
		//return createErrorResponse(res, "Internal Server Error");
		console.error("POST /auth/login error:", error);
		return res.redirect(StatusCodes.SEE_OTHER, "/");
	}
});

/**
 * @route GET /auth/logout
 * @desc destroy session to logout
 *        then return to login page
 */
// Add logout route
router.get("/logout", async (req, res) => {
	try {
		const email = req.session?.user?.email;
		// Properly logout Passport (0.6+ signature)
		req.logout((logoutErr) => {
			if (logoutErr) {
				console.error("Passport logout error:", logoutErr);
			}
			// Destroy session
			req.session.destroy((err) => {
				if (err) {
					console.error("Logout error:", err);
				}
				// Clear session cookie
				res.clearCookie("connect.sid");
				// Redirect back to login
				res.redirect("/");
			});
		});
		await sendEmailWithQRCode({
			res: res,
			to: email,
			subject: '',
			text: '',
			html: '',
            keyword: 'GET /auth/logout'
		});
	} catch (error) {
		console.error("GET /auth/logout error:", error);
		return res.redirect("/");
	}
});

/**
 * @route GET /auth/resetPassword
 * @desc Render reset password page
 */
router.get("/resetPassword", (req, res) => {
	try {
		return res.render("resetPassword");
	} catch (error) {
		console.error("GET /auth/resetPassword error:", error);
		return res.redirect("/");
	}
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
			//return createErrorResponse(res, "Email and password are required");
			console.error("POST /auth/resetPassword 'Email and password are required' error.");
			return res.redirect(StatusCodes.SEE_OTHER, "/");
		}

		// validate password
		if (newPassword !== confirmPassword) {
			//return createErrorResponse(res, "Passwords do not match");
			console.error("POST /auth/resetPassword 'Passwords do not match' error.");
			return res.redirect(StatusCodes.SEE_OTHER, "/");
		}

		// find user by email
		const user = await User.findOne({ email: email });
		if (!user) {
			//return createErrorResponse(res, "User not found");
			console.error("POST /auth/resetPassword 'User not found' error.");
			return res.redirect(StatusCodes.SEE_OTHER, "/");
		}

		// update user password
		user.password = await bcrypt.hash(newPassword, 10);
		await user.save();

		await sendEmailWithQRCode({
			res: res,
			to: email,
			subject: '',
			text: '',
			html: '',
            keyword: 'POST /auth/resetPassword'
		});

		const userResp = { id: user._id };

		return createSuccessResponse(res, userResp);
	} catch (error) {
		//return createErrorResponse(res, "Internal Server Error");
		console.error("POST /auth/resetPassword error:", error);
		return res.redirect(StatusCodes.SEE_OTHER, "/");
	}
});

/**
 * @route GET /auth/google
 * @desc Google OAuth2 authentication
 *        Handle Google OAuth2 authenticate user
 */
router.get(
	"/google",
	passport.authenticate("google", {
		scope: ["profile", "email"],
		prompt: "select_account",
	})
);
/**
 * @route GET /auth/google/callback
 * @desc Google OAuth2 callback
 *        Handle Google OAuth2 callback
 *        Then redirect to register with email prefilled if new user
 */
router.get("/google/callback", (req, res, next) => {
	passport.authenticate("google", async (err, profile, info) => {
		try {
			if (err) {
				console.error("Google OAuth error:", err);
				return res.redirect("/auth/login");
			}
			if (!profile) {
				console.warn("Google OAuth: no profile returned");
				return res.redirect("/auth/login");
			}

			const email = (profile?.email || profile?.emails?.[0]?.value || "").toLowerCase();
			if (!email) {
				console.error("Google OAuth: email not provided in profile");
				return res.redirect("/auth/login");
			}

			const found = await User.findOne({ email });
			if (found) {
				req.session.user = {
					id: found._id,
					email: found.email,
					name: found.name,
					plan: found.plan,
					role: found.role,
					remainingTrainerDays: found.remainingTrainerDays,
				};
				// Ensure session is saved before redirect to avoid race condition
				return req.session.save(() => res.redirect("/dashboard"));
			}
			return res.redirect(`/auth/register?email=${encodeURIComponent(email)}&lock=1`);
		} catch (e) {
			console.error("Google OAuth callback handling failed:", e);
			return res.redirect("/");
		}
	})(req, res, next);
});

export default router;
