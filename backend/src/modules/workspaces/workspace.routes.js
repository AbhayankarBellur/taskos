import { Router } from "express";
import { workspaceController as workspaces } from "./workspace.controller.js";
import { memberController as members } from "./member.controller.js";
import projectRoutes from "../projects/project.routes.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { requireWorkspace } from "../../middleware/workspace.middleware.js";
import { asyncHandler as handle } from "../../utils/async-handler.js";

const router = Router();
const scoped = Router({ mergeParams: true });

router.use(requireAuth);
router.get("/", handle(workspaces.list));
router.post("/", handle(workspaces.create));

scoped.get("/", handle(workspaces.get));
scoped.patch("/", handle(workspaces.update));
scoped.get("/members", handle(members.list));
scoped.post("/members", handle(members.add));
scoped.patch("/members/:userId", handle(members.changeRole));
scoped.delete("/members/:userId", handle(members.remove));
scoped.use("/projects", projectRoutes);

router.use("/:workspaceId", requireWorkspace, scoped);

export default router;
