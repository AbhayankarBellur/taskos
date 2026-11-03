import { idString } from "../../utils/object-id.js";

export const toWorkspace = (workspace, role) => ({
  id: idString(workspace._id),
  name: workspace.name,
  slug: workspace.slug,
  ownerId: idString(workspace.ownerId),
  role,
  createdAt: workspace.createdAt
});

export const toMember = (member, user) => ({
  userId: idString(member.userId),
  name: user?.name ?? "Unknown user",
  email: user?.email ?? null,
  role: member.role,
  joinedAt: member.joinedAt
});
