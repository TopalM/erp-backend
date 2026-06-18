// Environment değişkenlerini yükle
import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// PostgreSQL bağlantı adresi
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is required.");
}

// Prisma PostgreSQL adapterı
const adapter = new PrismaPg({
  connectionString: databaseUrl,
});

// Prisma client instance
export const prisma = new PrismaClient({
  adapter,

  // Development ortamında warning ve error loglarını göster
  // Production ortamında sadece error logları göster
  log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
});
