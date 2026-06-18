import { beforeAll, afterAll } from "vitest";

import { prisma } from "../src/database/prisma.client.js";

// Testlerde kullanılacak gerçek mail adresi.
// Bu adres local testlerde kullanıcı olarak oluşturulur ve test sonunda silinir.
const testAuthEmail = process.env.TEST_AUTH_EMAIL;

// Testler başlamadan önce çalışır.
// Prisma bağlantısını açar, VIEWER rolünü hazırlar
// ve varsa eski test kullanıcısını temizler.
beforeAll(async () => {
  await prisma.$connect();

  if (!testAuthEmail) {
    throw new Error("TEST_AUTH_EMAIL environment variable is required.");
  }

  await prisma.user.deleteMany({
    where: {
      email: testAuthEmail,
    },
  });

  await prisma.role.upsert({
    where: {
      name: "VIEWER",
    },
    update: {},
    create: {
      name: "VIEWER",
      description: "Test görüntüleyici rolü",
    },
  });
});

// Tüm testler tamamlandıktan sonra çalışır.
// Test için oluşturulan kullanıcıyı temizler ve Prisma bağlantısını kapatır.
afterAll(async () => {
  if (testAuthEmail) {
    await prisma.user.deleteMany({
      where: {
        email: testAuthEmail,
      },
    });
  }

  await prisma.$disconnect();
});
