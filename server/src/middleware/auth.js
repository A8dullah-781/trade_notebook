import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";

export function authMiddleware(req, res, next) {
  // 1. Read the Authorization header: "Bearer <token>"
  const header = req.headers.authorization;

  // 2. Missing, or wrong format: reject
  if (!header || !header.startsWith("Bearer ")) {
    throw new ApiError(401, "Not authenticated");
  }

  // 3. Take the token part (after "Bearer ")
  const token = header.split(" ")[1];

  try {
    // 4. Verify signature and expiry. Returns the payload, or throws.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 5. Remember who is calling, for the controllers after us
    req.user = { id: decoded.id };

    // 6. Go on to the next function (the controller)
    next();
  } catch (err) {
    // Bad signature, expired, or garbage token
    throw new ApiError(401, "Not authenticated");
  }
}