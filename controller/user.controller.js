// // controller/user.controller.js
// import User from "../models/User.model.js";
// import StatusCodes from "../utils/statusCodes.js";
// import { successResponse, errorResponse } from "../utils/responseHandler.js";

// /**
//  * User Controller - Handles all user-related operations
//  * Provides CRUD functionality for user management
//  */
// class UserController {
// 	/**
// 	 * Retrieve all users from the database
// 	 * @param {Object} req - Express request object
// 	 * @param {Object} res - Express response object
// 	 */
// 	getAllUsers = async (req, res) => {
// 		try {
// 			const users = await User.find();
// 			return res.status(StatusCodes.SUCCESS).json(successResponse(users, "Users retrieved successfully"));
// 		} catch (error) {
// 			return res
// 				.status(StatusCodes.INTERNAL_SERVER_ERROR)
// 				.json(errorResponse("Internal server error", StatusCodes.INTERNAL_SERVER_ERROR));
// 		}
// 	};

//   getUserById = async (req, res) => {
//     try {

//     } catch (error) {
//       return res
//       .status(StatusCodes.INTERNAL_SERVER_ERROR)
//       .json(errorResponse("Internal server error", StatusCodes.INTERNAL_SERVER_ERROR));
//     }
//   }

// 	/**
// 	 * Retrieve a specific user by username
// 	 * @param {Object} req - Express request object
// 	 * @param {Object} res - Express response object
// 	 */
// 	getUserByUsername = async (req, res) => {
// 		try {
// 			const { username } = req.params;

// 			// Validate username parameter
// 			if (!username) {
// 				return res.status(StatusCodes.BAD_REQUEST).json(errorResponse("Username is required", StatusCodes.BAD_REQUEST));
// 			}

// 			const user = await User.findOne({ username });

// 			if (!user) {
// 				return res.status(StatusCodes.NOT_FOUND).json(errorResponse("User not found", StatusCodes.NOT_FOUND));
// 			}

// 			const userResponse = {
// 				id: user._id,
// 				username: user.username,
// 				name: user.name,
// 				email: user.email,
// 			};

// 			return res.status(StatusCodes.SUCCESS).json(successResponse(userResponse, "User retrieved successfully"));
// 		} catch (error) {
// 			return res
// 				.status(StatusCodes.INTERNAL_SERVER_ERROR)
// 				.json(errorResponse("Internal server error", StatusCodes.INTERNAL_SERVER_ERROR));
// 		}
// 	};

// 	/**
// 	 * Create a new user
// 	 * @param {Object} req - Express request object
// 	 * @param {Object} res - Express response object
// 	 */
// 	createUser = async (req, res) => {
// 		try {
// 			const { username, password, name, email } = req.body;

// 			// Validate required fields
// 			if (!username || !password) {
// 				return res
// 					.status(StatusCodes.BAD_REQUEST)
// 					.json(errorResponse("Username, and password are required", StatusCodes.BAD_REQUEST));
// 			}

// 			// Hash the password
// 			const hashedPassword = await bcrypt.hash(password, 10);

// 			// Create new user
// 			const user = new User({
// 				username,
// 				password: hashedPassword,
// 				name,
// 				email,
// 			});

// 			await user.save();

// 			// Return success response without password
// 			const userResponse = {
// 				id: user._id,
// 				username: user.username,
// 				name: user.name,
// 				email: user.email,
// 			};

// 			return res
// 				.status(StatusCodes.CREATED)
// 				.json(successResponse(userResponse, `User created successfully`, StatusCodes.CREATED));
// 		} catch (error) {
// 			return res
// 				.status(StatusCodes.INTERNAL_SERVER_ERROR)
// 				.json(errorResponse("Internal server error", StatusCodes.INTERNAL_SERVER_ERROR));
// 		}
// 	};

// 	/**
// 	 * Update an existing user
// 	 * @param {Object} req - Express request object
// 	 * @param {Object} res - Express response object
// 	 */
// 	updateUser = async (req, res) => {
// 		try {
// 			const { username } = req.params;
// 			const updates = req.body;

// 			// Validate username parameter
// 			if (!username) {
// 				return res.status(StatusCodes.BAD_REQUEST).json(errorResponse("Username is required", StatusCodes.BAD_REQUEST));
// 			}

// 			// Validate update data
// 			if (Object.keys(updates).length === 0) {
// 				return res
// 					.status(StatusCodes.BAD_REQUEST)
// 					.json(errorResponse("Update data is required", StatusCodes.BAD_REQUEST));
// 			}

// 			const user = await User.findOneAndUpdate({ username }, updates, {
// 				new: true,
// 				runValidators: true,
// 			});

// 			if (!user) {
// 				return res.status(StatusCodes.NOT_FOUND).json(errorResponse("User not found", StatusCodes.NOT_FOUND));
// 			}

// 			// Return success response without password
// 			const userResponse = {
// 				id: user._id,
// 				username: user.username,
// 				name: user.name,
// 				email: user.email,
// 			};

// 			return res.status(StatusCodes.SUCCESS).json(successResponse(userResponse, "User updated successfully"));
// 		} catch (error) {
// 			return res
// 				.status(StatusCodes.INTERNAL_SERVER_ERROR)
// 				.json(errorResponse("Internal server error", StatusCodes.INTERNAL_SERVER_ERROR));
// 		}
// 	};

// 	/**
// 	 * Delete a user by username
// 	 * @param {Object} req - Express request object
// 	 * @param {Object} res - Express response object
// 	 */
// 	deleteUser = async (req, res) => {
// 		try {
// 			const { username } = req.params;

// 			// Validate username parameter
// 			if (!username) {
// 				return res.status(StatusCodes.BAD_REQUEST).json(errorResponse("Username is required", StatusCodes.BAD_REQUEST));
// 			}

// 			const user = await User.findOneAndDelete({ username });

// 			if (!user) {
// 				return res.status(StatusCodes.NOT_FOUND).json(errorResponse("User not found", StatusCodes.NOT_FOUND));
// 			}

// 			return res.status(StatusCodes.SUCCESS).json(successResponse(user.username, "User deleted successfully"));
// 		} catch (error) {
// 			return res
// 				.status(StatusCodes.INTERNAL_SERVER_ERROR)
// 				.json(errorResponse("Failed to delete user", StatusCodes.INTERNAL_SERVER_ERROR));
// 		}
// 	};
// }

// export default UserController;