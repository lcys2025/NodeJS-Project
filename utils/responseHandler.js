/**
 * Standardized API Response Handler
 * Provides consistent response format across the application
 */

import StatusCodes from "./statusCodes.js";

const createSuccessResponse = (res, data = null, message = "Operation successful", statusCode = StatusCodes.SUCCESS) => {

  const resObject = {
    success: true,
    data: data ?? {},
    message,
    statusCode
  };

  res.status(statusCode).json(resObject);
};

const createErrorResponse = (res, message = "Internal Server Error", statusCode = StatusCodes.INTERNAL_SERVER_ERROR, error = null) => {
  
  const resObject = {
    success: false,
    error: error ?? {},
    message,
    statusCode
  };

  res.status(statusCode).json(resObject);
};

export { createSuccessResponse, createErrorResponse };