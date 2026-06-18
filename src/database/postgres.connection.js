import { prisma } from "./prisma.client.js";

// PostgreSQL bağlantısını başlatır.
// Uygulama açılırken çağrılır.
export const connectPostgres = async () => {
  try {
    // Prisma bağlantısını aç
    await prisma.$connect();

    // Veritabanına basit bir test sorgusu gönder
    await prisma.$queryRaw`SELECT 1`;

    console.log("PostgreSQL connection established successfully.");
  } catch (error) {
    console.error("PostgreSQL connection failed:", error);

    throw error;
  }
};

// PostgreSQL bağlantısını güvenli şekilde kapatır.
// Uygulama kapanırken çağrılır.
export const disconnectPostgres = async () => {
  try {
    await prisma.$disconnect();

    console.log("PostgreSQL connection closed successfully.");
  } catch (error) {
    console.error("PostgreSQL disconnect failed:", error);
  }
};
