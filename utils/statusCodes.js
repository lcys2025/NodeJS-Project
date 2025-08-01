/**
 * HTTP Status Codes constants
 * Provides standardized HTTP status codes for consistent responses
 */
const StatusCodes = {
  // Success codes
  SUCCESS: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  
  // Client error codes
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  
  // Server error codes
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503
};

export default StatusCodes;