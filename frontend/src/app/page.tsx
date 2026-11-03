import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { ProjectOverview } from "@/components/projects/project-overview";

export default function Home() {
  return (
    <AppShell>
      <div className="mb-8 flex justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Overview</h2>
          <p className="text-sm text-gray-500">Your workspace at a glance.</p>
        </div>
        <Button>New Project</Button>
      </div>
      <ProjectOverview />
    </AppShell>
  );
}
