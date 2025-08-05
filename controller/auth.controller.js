import User from "../models/User.model.js";
import bcrypt from "bcrypt";
import StatusCodes from "../utils/StatusCodes.js";
import { successResponse, errorResponse } from "../utils/responseHandler.js";

/**
 * Auth Controller - Handles authentication operations
 * Provides login and registration functionality
 */
class AuthController {
  /**
   * User registration
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  register = async (req, res) => {
    try {
      const { password, name, email } = req.body;
      console.log(password, name, email); // for testing debug
      
      // Validate required fields
      if (!email || !password) {
        return res.status(StatusCodes.BAD_REQUEST).json(
          errorResponse("Email, password are required", StatusCodes.BAD_REQUEST)
        );
      }

      // Check if email already exists
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(StatusCodes.CONFLICT).json(
          errorResponse("Email already exists", StatusCodes.CONFLICT)
        );
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      const user = new User({
        username: email,
        password: hashedPassword,
        name,
        email
      });

      await user.save();
      
      // Return success response without password
      const userResponse = {
        id: user._id,
        name: user.name,
        email: user.email
      };
      
      return res.status(StatusCodes.CREATED).json(
        successResponse(userResponse, "User registered successfully", StatusCodes.CREATED)
      );
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
        errorResponse("Internal server error", StatusCodes.INTERNAL_SERVER_ERROR)
      );
    }
  };

  /**
   * User login
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  login = async (req, res) => {
    try {
      const { email, password } = req.body;
      console.log(email, password);
      
      // Validate required fields
      if (!email || !password) {
        return res.status(StatusCodes.BAD_REQUEST).json(
          errorResponse("Email and password are required", StatusCodes.BAD_REQUEST)
        );
      }

      // Find user by username
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(StatusCodes.UNAUTHORIZED).json(
          errorResponse("Invalid username or password", StatusCodes.UNAUTHORIZED)
        );
      }

      // Compare passwords
      const isPasswordValid = bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(StatusCodes.UNAUTHORIZED).json(
          errorResponse("Invalid username or password", StatusCodes.UNAUTHORIZED)
        );
      }
      
      // Prepare user data for response (exclude password)
      const userResponse = {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email
      };

      return res.status(StatusCodes.SUCCESS).json(
        successResponse(userResponse, "Login successful")
      );
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(
        errorResponse("Internal server error", StatusCodes.INTERNAL_SERVER_ERROR)
      );
    }
  };
}

export default AuthController;