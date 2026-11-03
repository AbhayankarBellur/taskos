import { allowedOrigins } from "../config/env.js";
import { SAFE_METHODS } from "../utils/csrf.js";
import { forbidden } from "../utils/app-error.js";

function requestOrigin(req) {
  const origin = req.get("origin");
  if (origin) return origin;
  try {
    return new URL(req.get("referer")).origin;
  } catch {
    return null;
  }
}

export function verifyOrigin(req, res, next) {
  if (SAFE_METHODS.has(req.method)) return next();
  const origin = requestOrigin(req);
  if (!origin || !allowedOrigins().includes(origin)) {
    return next(forbidden("Request origin not allowed"));
  }
  next();
}
