import "dotenv/config";

import app from "./app.js";

import { connectPostgres, disconnectPostgres } from "./database/postgres.connection.js";

const PORT = process.env.PORT || 5000;

// Uygulamayı başlat
const bootstrap = async () => {
  try {
    // PostgreSQL bağlantısını aç
    await connectPostgres();

    // HTTP sunucusunu başlat
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Application startup failed:", error);

    process.exit(1);
  }
};

bootstrap();

// Güvenli kapanış işlemleri
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
