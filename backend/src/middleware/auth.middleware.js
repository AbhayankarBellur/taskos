import { sessionService } from "../modules/auth/session.service.js";
import { SESSION_COOKIE } from "../config/cookie.js";
import { SAFE_METHODS, safeEqual } from "../utils/csrf.js";
import { forbidden } from "../utils/app-error.js";

export async function requireAuth(req, res, next) {
  req.auth = await sessionService.authenticate(req.cookies?.[SESSION_COOKIE]);

  const csrfHeader = req.get("x-csrf-token");
  if (!SAFE_METHODS.has(req.method) && !safeEqual(csrfHeader, req.auth.csrfToken)) {
    throw forbidden("Invalid CSRF token");
  }
  next();
}
