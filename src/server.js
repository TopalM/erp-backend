import "dotenv/config";

import app from "./app.js";

import { connectPostgres, disconnectPostgres } from "./database/postgres.connection.js";
import { bootstrapStorage } from "./modules/platform/storage/storage.bootstrap.js";

const PORT = process.env.PORT || 5000;

const bootstrap = async () => {
  try {
    await connectPostgres();

    await bootstrapStorage();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Application startup failed:", error);

    await disconnectPostgres();

    process.exit(1);
  }
};

bootstrap();

process.on("SIGINT", async () => {
  console.log("SIGINT received.");

  await disconnectPostgres();

  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("SIGTERM received.");

  await disconnectPostgres();

  process.exit(0);
});
