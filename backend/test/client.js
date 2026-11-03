import { randomBytes } from "node:crypto";

export const ORIGIN = "http://localhost:3000";

export function client(base) {
  const state = { cookie: null, csrf: null };
  async function request(method, path, body, headers = {}) {
    const res = await fetch(base + path, {
      method,
      headers: { "Content-Type": "application/json", Origin: ORIGIN,
        ...(state.cookie && { Cookie: state.cookie }),
        ...(state.csrf && { "X-CSRF-Token": state.csrf }), ...headers },
      body: body === undefined ? undefined : JSON.stringify(body)
    });
    const setCookie = res.headers.get("set-cookie");
    if (setCookie) state.cookie = setCookie.split(";")[0];
    const json = await res.json();
    if (json.data?.csrfToken) state.csrf = json.data.csrfToken;
    return { status: res.status, body: json, setCookie };
  }
  return { request, state };
}

export const uniqueEmail = (name) =>
  `${name}.${randomBytes(3).toString("hex")}@example.com`;
