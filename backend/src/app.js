import express from "express";
import cors from "cors";
import helmet from "helmet";
import projectRoutes from "./modules/projects/project.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());

app.get("/health", (req, res) =>
  res.json({ success: true, service: "TaskOS API" })
);

app.use("/api/v1/projects", projectRoutes);
app.use(errorHandler);

export default app;
