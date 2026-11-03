// Usage: node scripts/migrate-legacy-projects.js --owner-email you@example.com [--workspace <id>] [--apply]
import "dotenv/config";
import { parseArgs } from "node:util";
import { connectDB, closeDB } from "../src/config/database.js";
import { userService } from "../src/modules/users/user.service.js";
import { workspaceService } from "../src/modules/workspaces/workspace.service.js";
import { projectRepository } from "../src/modules/projects/project.repository.js";

const { values } = parseArgs({ options: {
  "owner-email": { type: "string" }, workspace: { type: "string" },
  apply: { type: "boolean", default: false }
} });

async function resolveTarget(email, workspaceId) {
  const user = await userService.findByEmail(String(email).trim().toLowerCase());
  if (!user) throw new Error(`No user registered with ${email}`);
  const owned = (await workspaceService.listForUser(user._id)).filter((w) => w.role === "owner");
  const target = workspaceId ? owned.find((w) => w.id === workspaceId) : owned.length === 1 && owned[0];
  if (!target) throw new Error("Pass --workspace <id> for a workspace this user owns");
  return { user, workspace: await workspaceService.resolveContext(user._id, target.id) };
}

try {
  if (!values["owner-email"]) throw new Error("--owner-email is required");
  await connectDB();
  const { user, workspace } = await resolveTarget(values["owner-email"], values.workspace);
  const legacy = await projectRepository.findLegacy();
  console.log(`Target: ${workspace.workspace.name} (${workspace.workspace.id}), owner ${user.email}`);
  console.log(`Legacy projects without workspaceId: ${legacy.length}`);
  legacy.forEach((p) => console.log(`  - ${p._id} ${p.name}`));
  if (!values.apply) console.log("Dry run. Re-run with --apply to migrate.");
  else {
    const { modifiedCount } = await projectRepository.assignLegacy(workspace.workspaceId, user._id);
    console.log(`Migrated ${modifiedCount} project(s).`);
  }
} catch (error) {
  console.error(`Migration failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  await closeDB();
}
