import { authService } from "./auth.service.js";
import { SESSION_COOKIE, cookieOptions, clearCookieOptions } from "../../config/cookie.js";

const startSession = (res, status, { token, ...data }) => {
  res.cookie(SESSION_COOKIE, token, cookieOptions());
  res.status(status).json({ success: true, data });
};

export const authController = {
  register: async (req, res) =>
    startSession(res, 201, await authService.register(req.body)),

  login: async (req, res) =>
    startSession(res, 200, await authService.login(req.body)),

  logout: async (req, res) => {
    await authService.logout(req.auth.sessionId);
    res.clearCookie(SESSION_COOKIE, clearCookieOptions());
    res.json({ success: true, data: null });
  },

  me: (req, res) =>
    res.json({ success: true, data: authService.me(req.auth) })
};
