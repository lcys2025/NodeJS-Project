import express from "express";
import AuthController from "../controller/auth.controller.js";

const router = express.Router();
const authController = new AuthController();

/**
 * @route GET /auth/register
 * @desc Render register page
 * @access Public
 */
router.get('/register', (req, res) => {
  res.render('register');
});

/**
 * @route POST /auth/register
 * @desc Register a new user
 * @access Public
 */
router.post("/register", authController.register);

/**
 * @route GET /auth/login
 * @desc Render login page
 * @access Public
 */
router.get('/login', (req, res) => {
  // 传递空的 email 和 password 变量以避免 ReferenceError
  res.render('login', { email: '', password: '' });
});

/**
 * @route POST /auth/login
 * @desc Login user
 * @access Public
 */
router.post("/login", authController.login);

/**
 * @route GET /auth/resetPassword
 * @desc Render reset password page
 * @access Public
 */
router.get('/resetPassword', (req, res) => {
  res.render('resetPassword');
});

router.post("/resetPassword", (req, res) => {
  res.render("404");
});

export default router;