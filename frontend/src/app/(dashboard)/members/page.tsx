"use client";

import { WorkspaceGate } from "@/components/auth/workspace-gate";
import { MemberList } from "@/components/workspaces/member-list";

export default function MembersPage() {
  return (
    <WorkspaceGate>
      {(workspace) => (
        <div className="max-w-3xl space-y-6">
          <h2 className="text-2xl font-semibold">Members</h2>
          <MemberList workspace={workspace} />
        </div>
      )}
    </WorkspaceGate>
  );
}
