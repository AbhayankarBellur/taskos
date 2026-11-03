"use client";

import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { authApi } from "@/lib/auth-api";
import { UNAUTHORIZED_EVENT } from "@/lib/api";
import type { AuthSession, LoginInput, RegisterInput, User } from "@/types/user";

type Status = "loading" | "authenticated" | "unauthenticated";
type State = { user: User | null; status: Status; expired: boolean };
type AuthValue = State & {
  login: (input: LoginInput) => Promise<AuthSession>;
  register: (input: RegisterInput) => Promise<AuthSession>;
  logout: () => Promise<void>;
};

const signedOut: State = { user: null, status: "unauthenticated", expired: false };
export const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>({ ...signedOut, status: "loading" });

  const accept = useCallback((session: AuthSession) => {
    setState({ user: session.user, status: "authenticated", expired: false });
    return session;
  }, []);

  useEffect(() => {
    authApi.me().then(accept).catch(() => setState(signedOut));
    const onUnauthorized = () => setState((prev) =>
      ({ ...signedOut, expired: prev.status === "authenticated" }));
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, [accept]);

  const value = useMemo<AuthValue>(() => ({
    ...state,
    login: (input) => authApi.login(input).then(accept),
    register: (input) => authApi.register(input).then(accept),
    logout: () => authApi.logout().catch(() => null).then(() => setState(signedOut))
  }), [state, accept]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
