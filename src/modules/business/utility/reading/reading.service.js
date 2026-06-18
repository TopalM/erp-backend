import { prisma } from "../../../../database/prisma.client.js";

function toDateOnly(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    const error = new Error("Geçersiz tarih.");
    error.statusCode = 400;
    throw error;
  }

  return date;
}

export async function listReadingsService(query = {}) {
  const where = {};

  if (query.meterId) {
    where.meterId = String(query.meterId);
  }

  if (query.startDate || query.endDate) {
    where.readingDate = {};

    if (query.startDate) {
      where.readingDate.gte = toDateOnly(query.startDate);
    }

    if (query.endDate) {
      where.readingDate.lte = toDateOnly(query.endDate);
    }
  }

  return prisma.utilityMeterReading.findMany({
    where,
    include: {
      meter: {
        include: {
          meterType: true,
        },
      },
    },
    orderBy: [
      {
        readingDate: "desc",
      },
      {
        meter: {
          code: "asc",
        },
      },
    ],
  });
}

export async function createReadingService(payload) {
  const meter = await prisma.utilityMeter.findFirst({
    where: {
      id: payload.meterId,
      deletedAt: null,
      isActive: true,
    },
  });

  if (!meter) {
    const error = new Error("Sayaç bulunamadı.");
    error.statusCode = 404;
    throw error;
  }

  return prisma.utilityMeterReading.upsert({
    where: {
      meterId_readingDate: {
        meterId: payload.meterId,
        readingDate: toDateOnly(payload.readingDate),
      },
    },
    update: {
      value: payload.value,
      note: payload.note || null,
    },
    create: {
      meterId: payload.meterId,
      readingDate: toDateOnly(payload.readingDate),
      value: payload.value,
      note: payload.note || null,
    },
    include: {
      meter: {
        include: {
          meterType: true,
        },
      },
    },
  });
}

export async function updateReadingService(id, payload) {
  const existing = await prisma.utilityMeterReading.findUnique({
    where: {
      id,
    },
  });

  if (!existing) {
    const error = new Error("Sayaç okuması bulunamadı.");
    error.statusCode = 404;
    throw error;
  }

  return prisma.utilityMeterReading.update({
    where: {
      id,
    },
    data: {
      ...(payload.readingDate !== undefined && {
        readingDate: toDateOnly(payload.readingDate),
      }),
      ...(payload.value !== undefined && {
        value: payload.value,
      }),
      ...(payload.note !== undefined && {
        note: payload.note || null,
      }),
    },
    include: {
      meter: {
        include: {
          meterType: true,
        },
      },
    },
  });
}

export async function deleteReadingService(id) {
  const existing = await prisma.utilityMeterReading.findUnique({
    where: {
      id,
    },
  });

  if (!existing) {
    const error = new Error("Sayaç okuması bulunamadı.");
    error.statusCode = 404;
    throw error;
  }

  await prisma.utilityMeterReading.delete({
    where: {
      id,
    },
  });

  return null;
}
