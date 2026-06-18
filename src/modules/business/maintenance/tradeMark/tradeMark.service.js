import { prisma } from "../../../../database/prisma.client.js";

function toIntId(id, message = "Geçersiz id.") {
  const parsed = Number(id);

  if (!Number.isInteger(parsed)) {
    const error = new Error(message);
    error.statusCode = 400;
    throw error;
  }

  return parsed;
}

function toClientTradeMark(row) {
  if (!row) return row;

  return {
    ...row,
    _id: row.id,
  };
}

export async function listTradeMarksService() {
  const rows = await prisma.machineTradeMark.findMany({
    where: { deletedAt: null },
    orderBy: { tradeMark: "asc" },
  });

  return rows.map(toClientTradeMark);
}

export async function createTradeMarkService(payload) {
  const tradeMark = payload.tradeMark?.trim();

  if (!tradeMark) {
    const error = new Error("Marka adı zorunludur.");
    error.statusCode = 400;
    throw error;
  }

  const existing = await prisma.machineTradeMark.findFirst({
    where: {
      tradeMark: {
        equals: tradeMark,
        mode: "insensitive",
      },
      deletedAt: null,
    },
  });

  if (existing) {
    const error = new Error("Bu marka zaten kayıtlı.");
    error.statusCode = 409;
    throw error;
  }

  const row = await prisma.machineTradeMark.create({
    data: { tradeMark },
  });

  return toClientTradeMark(row);
}

export async function updateTradeMarkService(id, payload) {
  const numericId = toIntId(id || payload.id);
  const tradeMark = payload.tradeMark?.trim();

  if (!tradeMark) {
    const error = new Error("Marka adı zorunludur.");
    error.statusCode = 400;
    throw error;
  }

  const existing = await prisma.machineTradeMark.findFirst({
    where: {
      id: numericId,
      deletedAt: null,
    },
  });

  if (!existing) {
    const error = new Error("Marka bulunamadı.");
    error.statusCode = 404;
    throw error;
  }

  const duplicate = await prisma.machineTradeMark.findFirst({
    where: {
      id: { not: numericId },
      tradeMark: {
        equals: tradeMark,
        mode: "insensitive",
      },
      deletedAt: null,
    },
  });

  if (duplicate) {
    const error = new Error("Bu marka adı zaten kullanılıyor.");
    error.statusCode = 409;
    throw error;
  }

  const row = await prisma.machineTradeMark.update({
    where: { id: numericId },
    data: { tradeMark },
  });

  return toClientTradeMark(row);
}

export async function deleteTradeMarkService(id) {
  const numericId = toIntId(id);

  const usedMainMachineCount = await prisma.mainMachine.count({
    where: {
      tradeMarkId: numericId,
      deletedAt: null,
    },
  });

  const usedSubMachineCount = await prisma.subMachine.count({
    where: {
      tradeMarkId: numericId,
      deletedAt: null,
    },
  });

  if (usedMainMachineCount > 0 || usedSubMachineCount > 0) {
    const error = new Error("Bu marka makina kayıtlarında kullanıldığı için silinemez.");
    error.statusCode = 400;
    throw error;
  }

  await prisma.machineTradeMark.update({
    where: { id: numericId },
    data: { deletedAt: new Date() },
  });

  return {
    success: true,
    message: "Marka silindi.",
  };
}
