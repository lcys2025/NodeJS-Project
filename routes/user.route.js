import User from "../models/User.model.js";
import express from "express";
import { createSuccessResponse, createErrorResponse } from "../utils/responseHandler.js";

const router = express.Router();

/**
 * @route GET /user/list
 * @desc Get all users
 */
router.get("/list", async (req, res, next) => {
	try {
		let userList = await User.find().select("name email");
		createSuccessResponse(res, userList);
	} catch (error) {
		createErrorResponse(res, (error = error));
	}
});

/**
 * @route GET /user/searchById/:id
 * @desc Get user by id
 */
router.get("/searchById/:id", async (req, res, next) => {
	try {
		const { id } = req.params;
		let user = await User.findOne({ _id: id }).select("name email");
		createSuccessResponse(res, user);
	} catch (error) {
		createErrorResponse(res, (error = error));
	}
});

/**
 * @route GET /user/searchByEmail/:email
 * @desc Get user by email
 */
router.get("/searchByEmail/:email", async (req, res, next) => {
	try {
		const { email } = req.params;
		let user = await User.findOne({ email: email }).select("name email");
		createSuccessResponse(res, user);
	} catch (error) {
		createErrorResponse(res, (error = error));
	}
});

/**
* @route GET /user/deleted/:id
* @desc deleted user by id
*/
router.post("/deleted/:id", async (req, res, next) => {
	try {
		const { id } = req.params;
		let user = await User.deleteOne({ _id: id });
		createSuccessResponse(res, { id });
	} catch (error) {
		createErrorResponse(res, (error = error));
	}
});

export default router;