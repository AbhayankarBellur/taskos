import { workspaceService } from "../modules/workspaces/workspace.service.js";

export async function requireWorkspace(req, res, next) {
  req.ctx = await workspaceService.resolveContext(
    req.auth.user._id,
    req.params.workspaceId
  );
  next();
}
