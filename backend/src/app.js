import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import authRoutes from "./modules/auth/auth.routes.js";
import workspaceRoutes from "./modules/workspaces/workspace.routes.js";
import projectRoutes from "./modules/projects/project.routes.js";
import mcpKeyRoutes from "./modules/mcp-keys/mcp-key.routes.js";
import mcpRoutes from "./mcp/mcp.routes.js";
import { allowedOrigins } from "./config/env.js";
import { verifyOrigin } from "./middleware/origin.middleware.js";
import { notFoundHandler } from "./middleware/not-found.middleware.js";
import { errorHandler } from "./middleware/error.middleware.js";

const app = express();
app.set("trust proxy", 1);
app.use(helmet());
app.use(cors({ origin: allowedOrigins(), credentials: true }));
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());
app.use("/mcp", mcpRoutes);
app.use(verifyOrigin);

app.get("/health", (req, res) =>
  res.json({ success: true, service: "TaskOS API" })
);

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/workspaces", workspaceRoutes);
app.use("/api/v1/projects", projectRoutes);
app.use("/api/v1/mcp-keys", mcpKeyRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
