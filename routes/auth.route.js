import express from "express";
import User from "../models/User.model.js";
import bcrypt from "bcrypt";
import { createSuccessResponse, createErrorResponse } from "../utils/responseHandler.js";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();
    
/**
 * @route GET /auth/register
 * @desc Render register page
 */
router.get("/register", (req, res) => {
  return res.render("register");
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

    // create new user
    const savedUser = await User.create({
      password: hashedPassword,
      name: (name || "").trim(),
      email: email,
      plan: 'basic',
      role: 'gymer',
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

    // create user response
    //const userResp = {
    //  id: user._id,
    //  email: user.email,
    //  name: user.name,
    //  plan: user.plan,
    //  role: user.role,
    //};

    // Add to login route after successful authentication
    req.session.user = {
      id: user._id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      role: user.role,
    };

    //return createSuccessResponse(res, userResp);

    // Redirect to dashboard instead of returning JSON
    return res.redirect('/dashboard');
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
  req.session.destroy(err => {
    if (err) {
      console.error("Logout error:", err);
    }
    res.redirect('/auth/login');
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

    const userResp = { id: user._id };

    return createSuccessResponse(res, userResp);
  } catch (error) {
    console.error("POST /auth/resetPassword error:", error);
    return createErrorResponse(res, "Internal Server Error");
  }
});

export default router;