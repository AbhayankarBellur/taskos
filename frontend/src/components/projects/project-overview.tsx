"use client";

import { Card } from "@/components/ui/card";
import { useProjects } from "@/hooks/use-projects";
import { ProjectGrid } from "./project-grid";

export function ProjectOverview() {
  const { projects, loading, error } = useProjects();
  const active = projects.filter((p) => p.status === "active").length;
  const stats = [
    { label: "Active Projects", value: active },
    { label: "Open Tasks", value: 0 },
    { label: "Completed Tasks", value: 0 }
  ];

  return (
    <>
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        {stats.map(({ label, value }) => (
          <Card key={label}>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="mt-3 text-3xl font-semibold">{loading ? "–" : value}</p>
          </Card>
        ))}
      </div>
      <h3 className="mb-4 text-lg font-semibold">Projects</h3>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!loading && !error && <ProjectGrid projects={projects} />}
    </>
  );
}
