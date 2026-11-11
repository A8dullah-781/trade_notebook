// An error that carries an HTTP status code.

class ApiError extends Error {
  constructor(statusCode, message = "Something went wrong", code = null) {
    super(message);               // sets err.message
    this.statusCode = statusCode; // e.g. 409
    this.code = code;             // e.g. "EMAIL_NOT_VERIFIED", or null
  }
}

export { ApiError };