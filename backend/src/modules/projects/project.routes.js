import { Router } from "express";
import { projectController } from "./project.controller.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import taskRoutes from "../tasks/task.routes.js";

const router = Router({ mergeParams: true });
router.use(authMiddleware);

router.get("/", asyncHandler(projectController.list));
router.post("/", asyncHandler(projectController.create));
router.get("/:projectId", asyncHandler(projectController.get));
router.get("/:id", asyncHandler(projectController.get));

router.use("/:projectId/tasks", taskRoutes);

export default router;
