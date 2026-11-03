import type { Workspace } from "./workspace";

export type User = { id: string; name: string; email: string; createdAt: string };

export type AuthSession = { user: User; csrfToken: string; workspace?: Workspace };

export type LoginInput = { email: string; password: string };

export type RegisterInput = LoginInput & { name: string; workspaceName?: string };
