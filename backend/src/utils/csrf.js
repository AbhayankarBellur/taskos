import { createHmac, timingSafeEqual } from "node:crypto";
import { getEnv } from "../config/env.js";

export const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export function csrfTokenFor(sessionId) {
  return createHmac("sha256", getEnv().JWT_SECRET)
    .update(`csrf:${sessionId}`)
    .digest("base64url");
}

export function safeEqual(a, b) {
  const left = Buffer.from(String(a ?? ""));
  const right = Buffer.from(String(b ?? ""));
  return left.length === right.length && timingSafeEqual(left, right);
}
