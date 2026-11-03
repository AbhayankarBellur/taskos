import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Project } from "@/types/project";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: project.color }} />
          <h3 className="font-medium">{project.name}</h3>
        </div>
        <Badge color={project.status === "active" ? "green" : "gray"}>
          {project.status}
        </Badge>
      </div>
      <p className="text-sm text-gray-500">
        {project.description || "No description"}
      </p>
    </Card>
  );
}
