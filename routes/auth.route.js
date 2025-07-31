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
// before user interaction (output: empty form)
router.get('/register', (req, res) => {
  res.render('register');
});
// after user interaction (output: post response)
router.post("/register", authController.register);

/**
 * @route POST /auth/login
 * @desc Login user
 * @access Public
 */
// before user interaction (output: empty form)
router.get('/login', (req, res) => {
  res.render('login');
});
// after user interaction (output: post response)
router.post("/login", authController.login);

export default router;