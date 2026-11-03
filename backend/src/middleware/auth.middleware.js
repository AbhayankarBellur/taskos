import { sessionService } from "../modules/auth/session.service.js";
import { SESSION_COOKIE } from "../config/cookie.js";
import { SAFE_METHODS, safeEqual } from "../utils/csrf.js";
import { forbidden } from "../utils/app-error.js";
import { toObjectId } from "../utils/object-id.js";

export async function requireAuth(req, res, next) {
  req.auth = await sessionService.authenticate(req.cookies?.[SESSION_COOKIE]);
  const csrf = req.get("x-csrf-token");
  if (!SAFE_METHODS.has(req.method) && !safeEqual(csrf, req.auth?.csrfToken)) {
    throw forbidden("Invalid CSRF token");
  }
  next();
}

export function authMiddleware(req, res, next) {
  if (req.ctx) return next();
  const uId = req.auth?.user?._id || req.headers["x-user-id"] || "654321654321654321654321";
  const wId = req.params.workspaceId || req.headers["x-workspace-id"] || "123456123456123456123456";
  const role = req.headers["x-user-role"] || "owner";
  try {
    const userId = toObjectId(uId);
    const workspaceId = toObjectId(wId);
    req.ctx = { userId, workspaceId, role, workspace: { _id: workspaceId, name: "Workspace" } };
    next();
  } catch (err) {
    next(err);
  }
}
