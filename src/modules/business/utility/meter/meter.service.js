import { prisma } from "../../../../database/prisma.client.js";

export async function listMetersService() {
  return prisma.utilityMeter.findMany({
    where: {
      deletedAt: null,
      isActive: true,
    },
    include: {
      meterType: true,
    },
    orderBy: {
      code: "asc",
    },
  });
}

export async function getMeterByIdService(id) {
  return prisma.utilityMeter.findFirst({
    where: {
      id,
      deletedAt: null,
    },
    include: {
      meterType: true,
    },
  });
}
