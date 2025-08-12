import express from "express";
import User from "../models/User.model.js";
import bcrypt from "bcrypt";
import { createSuccessResponse, createErrorResponse } from "../utils/responseHandler.js";

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
    const { email, password, name } = req.body;

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
      username: email,
      password: hashedPassword,
      name: (name || "").trim(),
      email: email,
    });

    // create user response
    const userResp = {
      id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
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
  return res.render("login", { email: "", password: "" });
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
      return createErrorResponse(res, "Email and password are required");
    }

    // find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // generic message to avoid user enumeration
      return createErrorResponse(res, "Invalid username or password");
    }

    // compare password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return createErrorResponse(res, "Invalid username or password");
    }

    // create user response
    const userResp = {
      id: user._id,
      username: user.username,
      email: user.email,
      name: user.name,
    };

    return createSuccessResponse(res, userResp);
  } catch (error) {
    console.error("POST /auth/login error:", error);
    return createErrorResponse(res, "Internal Server Error");
  }
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