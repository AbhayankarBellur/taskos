import { rateLimit } from "express-rate-limit";
import { getEnv } from "../config/env.js";

export const createAuthRateLimit = () => rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: () => getEnv().AUTH_RATE_LIMIT,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts. Try again later." }
});
