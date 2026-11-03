import { Router } from "express";
import { assessmentController } from "./assessment.controller.js";
import { asyncHandler } from "../../utils/async-handler.js";

const router = Router({ mergeParams: true });

router.post("/", asyncHandler(assessmentController.create));
router.get("/", asyncHandler(assessmentController.list));
router.get("/latest", asyncHandler(assessmentController.latest));

export default router;
