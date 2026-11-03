import { Router } from "express";
import { authController } from "./auth.controller.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { createAuthRateLimit } from "../../middleware/rate-limit.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";

const router = Router();

router.post("/register", createAuthRateLimit(), asyncHandler(authController.register));
router.post("/login", createAuthRateLimit(), asyncHandler(authController.login));
router.post("/logout", requireAuth, asyncHandler(authController.logout));
router.get("/me", requireAuth, asyncHandler(authController.me));

export default router;
