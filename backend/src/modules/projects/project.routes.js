import { Router } from "express";
import { projectController } from "./project.controller.js";
import { asyncHandler } from "../../utils/async-handler.js";

const router = Router({ mergeParams: true });

router.get("/", asyncHandler(projectController.list));
router.post("/", asyncHandler(projectController.create));
router.get("/:projectId", asyncHandler(projectController.get));

export default router;
