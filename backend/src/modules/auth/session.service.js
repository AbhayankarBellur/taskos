import { ObjectId } from "mongodb";
import { authRepository } from "./auth.repository.js";
import { userService } from "../users/user.service.js";
import { SESSION_TTL_MS } from "../../config/cookie.js";
import { signSessionToken, verifySessionToken, hashToken } from "../../utils/token.js";
import { csrfTokenFor } from "../../utils/csrf.js";
import { unauthorized } from "../../utils/app-error.js";

const invalidSession = () => unauthorized("Invalid or expired session");

const isActive = (session, token, claims) =>
  session && !session.revokedAt && session.expiresAt > new Date() &&
  session.tokenHash === hashToken(token) &&
  session.userId.toString() === claims.userId;

export const sessionService = {
  async create(userId) {
    const _id = new ObjectId();
    const sessionId = _id.toString();
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
    const token = await signSessionToken({ userId: userId.toString(), sessionId, expiresAt });
    await authRepository.createSession({
      _id, userId, tokenHash: hashToken(token),
      expiresAt, revokedAt: null, createdAt: new Date()
    });
    return { token, csrfToken: csrfTokenFor(sessionId) };
  },

  async authenticate(token) {
    if (!token) throw unauthorized();
    const claims = await verifySessionToken(token).catch(() => {
      throw invalidSession();
    });
    if (!ObjectId.isValid(claims.sessionId)) throw invalidSession();
    const session = await authRepository.findSession(new ObjectId(claims.sessionId));
    if (!isActive(session, token, claims)) throw invalidSession();
    const user = await userService.findById(session.userId);
    if (!user) throw invalidSession();
    return { user, sessionId: claims.sessionId, csrfToken: csrfTokenFor(claims.sessionId) };
  },

  revoke: (sessionId) => authRepository.revokeSession(new ObjectId(sessionId))
};
