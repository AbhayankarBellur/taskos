import "dotenv/config";
import app from "./app.js";
import { connectDB, closeDB } from "./config/database.js";

const PORT = process.env.PORT || 5000;

try {
  await connectDB();
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
