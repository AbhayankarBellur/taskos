import { Router } from "express";
import { taskController } from "./task.controller.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import assessmentRoutes from "../assessments/assessment.routes.js";
import dependencyRoutes from "../dependencies/dependency.routes.js";
import commentRoutes from "../comments/comment.routes.js";
import { eventService } from "../events/event.service.js";

const router = Router({ mergeParams: true });
router.use(authMiddleware);

router.post("/", asyncHandler(taskController.create));
router.get("/", asyncHandler(taskController.list));
router.get("/:taskId", asyncHandler(taskController.get));
router.patch("/:taskId", asyncHandler(taskController.update));
router.delete("/:taskId", asyncHandler(taskController.archive));

router.patch("/:taskId/status", asyncHandler(taskController.transition));
router.patch("/:taskId/assignee", asyncHandler(taskController.assign));
router.patch("/:taskId/block", asyncHandler(taskController.block));
router.patch("/:taskId/unblock", asyncHandler(taskController.unblock));
router.post("/:taskId/subtasks", asyncHandler(taskController.createSubtask));

router.get("/:taskId/events", asyncHandler(async (req, res) => {
  const data = await eventService.listByTaskId(req.ctx, req.params.taskId);
  res.json({ success: true, data });
}));

router.use("/:taskId/assessments", assessmentRoutes);
router.use("/:taskId/dependencies", dependencyRoutes);
router.use("/:taskId/comments", commentRoutes);

export default router;
