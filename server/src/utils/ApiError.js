// An error that carries an HTTP status code.

class ApiError extends Error {
  constructor(statusCode, message = "Something went wrong") {
    super(message);              // sets err.message
    this.statusCode = statusCode; // e.g. 409
  }
}

export { ApiError };