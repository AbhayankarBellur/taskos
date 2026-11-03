export type Project = {
  id: string;
  name: string;
  description: string;
  color: string;
  status: "active" | "archived";
  createdAt: string;
  updatedAt: string;
};
