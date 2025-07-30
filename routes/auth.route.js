// routes/auth.routes.js
import express from "express";
import AuthController from "../controller/auth.controller.js";

const router = express.Router();
const authController = new AuthController();

/**
 * @route POST /auth/register
 * @desc Register a new user
 * @access Public
 */
router.post("/register", authController.register);

/**
 * @route POST /auth/login
 * @desc Login user
 * @access Public
 */
router.post("/login", authController.login);

export default router;