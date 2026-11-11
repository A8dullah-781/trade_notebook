import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { ApiError } from "../utils/ApiError.js";

export const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req.ip),
  handler: (req, res, next) => {
    next(new ApiError(429, "Too many sign-ups from this network. Try again in 1 hour."));
  },
});


export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const ip = ipKeyGenerator(req.ip);
    const email =
      typeof req.body?.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";
    return `${ip}|${email}`;
  },
  handler: (req, res, next) => {
    next(new ApiError(429, "Too many login attempts. Try again in 15 minutes."));
  },
});

export const forgotLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 3,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const ip = ipKeyGenerator(req.ip);
    const email =
      typeof req.body?.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";
    return `${ip}|${email}`;
  },
  handler: (req, res, next) => {
    next(new ApiError(429, "Too many reset requests. Try again in 1 hour."));
  },
});

export const resendLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 3,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const ip = ipKeyGenerator(req.ip);
    const email =
      typeof req.body?.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";
    return `${ip}|${email}`;
  },
  handler: (req, res, next) => {
    next(new ApiError(429, "Too many verification emails. Try again in 1 hour."));
  },
});

export const passwordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `user:${req.user.id}`,
  handler: (req, res, next) => {
    next(new ApiError(429, "Too many password attempts. Try again in 15 minutes."));
  },
});