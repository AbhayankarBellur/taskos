export type Role = "owner" | "admin" | "member" | "viewer";

export type Workspace = {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  role: Role;
  createdAt: string;
};

export type Member = {
  userId: string;
  name: string;
  email: string | null;
  role: Role;
  joinedAt: string;
};
