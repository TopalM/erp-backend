import { beforeAll, beforeEach, afterAll } from "vitest";
import { prisma } from "../../src/database/prisma.client.js";

export const cleanupTestData = async () => {
  await prisma.document.deleteMany({
    where: { entityId: { contains: "test-" } },
  });

  await prisma.assignment.deleteMany({
    where: { entityId: { contains: "test-" } },
  });

  await prisma.approval.deleteMany({
    where: { entityId: { contains: "test-" } },
  });

  await prisma.userPermission.deleteMany({
    where: {
      user: {
        email: {
          contains: "+test",
        },
      },
    },
  });

  await prisma.authEventLog.deleteMany({
    where: {
      OR: [{ email: { contains: "+test" } }, { message: { contains: "test" } }],
    },
  });

  await prisma.auditLog.deleteMany({
    where: {
      OR: [{ actorEmail: { contains: "+test" } }, { entityId: { contains: "test-" } }],
    },
  });

  await prisma.employee.deleteMany({
    where: {
      email: {
        contains: "+test",
      },
    },
  });

  await prisma.user.deleteMany({
    where: {
      email: {
        contains: "+test",
      },
    },
  });

  await prisma.role.deleteMany({
    where: {
      name: {
        startsWith: "TEST_",
      },
    },
  });

  await prisma.permission.deleteMany({
    where: {
      code: {
        startsWith: "test.",
      },
    },
  });
};

beforeAll(async () => {
  await prisma.$connect();
});

beforeEach(async () => {
  await cleanupTestData();
});

afterAll(async () => {
  await cleanupTestData();
  await prisma.$disconnect();
});
