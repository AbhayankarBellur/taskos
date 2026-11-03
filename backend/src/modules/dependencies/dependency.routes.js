import { Router } from "express";
import { dependencyController } from "./dependency.controller.js";
import { asyncHandler } from "../../utils/async-handler.js";

const router = Router({ mergeParams: true });

router.post("/", asyncHandler(dependencyController.add));
router.get("/", asyncHandler(dependencyController.list));
router.delete("/:dependencyId", asyncHandler(dependencyController.remove));

export default router;
