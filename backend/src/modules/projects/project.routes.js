import { Router } from "express";
import { projectController } from "./project.controller.js";
import { asyncHandler } from "../../utils/async-handler.js";

const router = Router();

router.get("/", asyncHandler(projectController.list));
router.post("/", asyncHandler(projectController.create));
router.get("/:id", asyncHandler(projectController.get));

export default router;
