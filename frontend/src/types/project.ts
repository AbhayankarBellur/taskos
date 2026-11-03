export type Project = {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  color: string;
  status: "active" | "archived";
  createdAt: string;
  updatedAt: string;
};

export type NewProject = Pick<Project, "name" | "description" | "color">;
