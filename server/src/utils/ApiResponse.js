// One consistent shape for success responses.
class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;       // e.g. 201
    this.data = data;                   // the payload (user, trades, etc.)
    this.message = message;             // readable text
    this.success = statusCode < 400;    // true for 2xx/3xx
  }

  // Sends itself. The status is typed once, so the HTTP status
  // and the body statusCode always match.
  send(res) {
    return res.status(this.statusCode).json(this);
  }
}

export { ApiResponse };