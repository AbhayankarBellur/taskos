import "dotenv/config";
import { getEnv } from "./config/env.js";
import { connectDB, closeDB } from "./config/database.js";
import { ensureIndexes } from "./config/indexes.js";

try {
  const { PORT } = getEnv();
  await connectDB();
  await ensureIndexes();
  const { default: app } = await import("./app.js");
  const server = app.listen(PORT, () =>
    console.log(`TaskOS API running on ${PORT}`)
  );

  process.on("SIGTERM", () =>
    server.close(async () => {
      await closeDB();
      process.exit(0);
    })
  );
} catch (error) {
  console.error("Startup failed:", error);
  process.exit(1);
}
