import { api, send, setCsrfToken } from "./api";
import type { AuthSession, LoginInput, RegisterInput } from "@/types/user";

const remember = (session: AuthSession) => {
  setCsrfToken(session.csrfToken);
  return session;
};

export const authApi = {
  me: () => api<AuthSession>("/auth/me").then(remember),
  login: (input: LoginInput) =>
    send<AuthSession>("POST", "/auth/login", input).then(remember),
  register: (input: RegisterInput) =>
    send<AuthSession>("POST", "/auth/register", input).then(remember),
  logout: () => send<null>("POST", "/auth/logout").finally(() => setCsrfToken(null))
};
