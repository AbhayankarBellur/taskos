import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { mcpKeyController } from "./mcp-key.controller.js";
import { requireAuth } from "../../middleware/auth.middleware.js";

const router = Router();
const createLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  message: { success: false, message: "Too many key operations" }
});

router.use(requireAuth);
router.post("/", createLimit, mcpKeyController.create);
router.get("/", mcpKeyController.list);
router.delete("/:id", mcpKeyController.revoke);

export default router;
