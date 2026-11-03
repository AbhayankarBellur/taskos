import { Router } from "express";
import { commentController } from "./comment.controller.js";
import { asyncHandler } from "../../utils/async-handler.js";

const router = Router({ mergeParams: true });

router.post("/", asyncHandler(commentController.create));
router.get("/", asyncHandler(commentController.list));

export default router;
