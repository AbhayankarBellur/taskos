import { Card } from "@/components/ui/card";
import type { Project } from "@/types/project";

type Props = { projects: Project[]; loading: boolean };

export function ProjectStats({ projects, loading }: Props) {
  const active = projects.filter((p) => p.status === "active").length;
  const stats = [
    { label: "Active Projects", value: active },
    { label: "Open Tasks", value: 0 },
    { label: "Completed Tasks", value: 0 }
  ];

  return (
    <div className="mb-8 grid gap-4 md:grid-cols-3">
      {stats.map(({ label, value }) => (
        <Card key={label}>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="mt-3 text-3xl font-semibold">{loading ? "–" : value}</p>
        </Card>
      ))}
    </div>
  );
}
