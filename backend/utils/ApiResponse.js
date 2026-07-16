// backend/utils/ApiResponse.js

export class ApiResponse {
  constructor(statusCode, message, data = null) {
    this.statusCode = statusCode;
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
  }
}

// Helper shorthand functions used in controllers
export const sendSuccess = (res, message, data = null, statusCode = 200) => {
  return res.status(statusCode).json(new ApiResponse(statusCode, message, data));
};

export const sendError = (res, message, statusCode = 400) => {
  return res.status(statusCode).json(new ApiResponse(statusCode, message));
};