import { getEnv } from "./env.js";

export const SESSION_COOKIE = "taskos_session";
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function clearCookieOptions() {
  const production = getEnv().NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: production,
    sameSite: production ? "none" : "lax",
    path: "/"
  };
}

export function cookieOptions() {
  return { ...clearCookieOptions(), maxAge: SESSION_TTL_MS };
}
