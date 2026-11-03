import { SignJWT, jwtVerify } from "jose";
import { createHash } from "node:crypto";
import { getEnv } from "../config/env.js";

const ALGORITHM = "HS256";
const AUDIENCE = "taskos-web";
const secretKey = () => new TextEncoder().encode(getEnv().JWT_SECRET);

export function signSessionToken({ userId, sessionId, expiresAt }) {
  return new SignJWT({ sid: sessionId })
    .setProtectedHeader({ alg: ALGORITHM })
    .setSubject(userId)
    .setIssuer(getEnv().JWT_ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(Math.floor(expiresAt.getTime() / 1000))
    .sign(secretKey());
}

export async function verifySessionToken(token) {
  const { payload } = await jwtVerify(token, secretKey(), {
    issuer: getEnv().JWT_ISSUER,
    audience: AUDIENCE,
    algorithms: [ALGORITHM]
  });
  return { userId: payload.sub, sessionId: payload.sid };
}

export const hashToken = (token) =>
  createHash("sha256").update(token).digest("hex");
