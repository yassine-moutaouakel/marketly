import rateLimit from "express-rate-limit";
import { env } from "../config/env";

/**
 * Strict limiter dedicated to authentication endpoints.
 * Mitigates brute-force attacks on /auth/login and /auth/register
 * (OWASP A07 - Identification and Authentication Failures).
 * Disabled in the test environment to keep the test suite deterministic.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.NODE_ENV === "test",
  message: {
    message: "Too many authentication attempts, please try again later"
  }
});
