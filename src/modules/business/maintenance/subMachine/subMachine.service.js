import { prisma } from "../../../../database/prisma.client.js";

function parseDateOnly(value) {
  if (!value) return null;
  const [year, month, day] = value.toString().slice(0, 10).split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function toIntId(id, message = "Geçersiz id.") {
  const parsed = Number(id);
  if (!Number.isInteger(parsed)) {
    const error = new Error(message);
    error.statusCode = 400;
    throw error;
  }
  return parsed;
}

function toDecimalOrNull(value) {
  if (value === undefined || value === null || value === "") return null;

  return value.toString().replace(/\./g, "").replace(",", ".");
}

function toClientSubMachine(row) {
  if (!row) return row;

  return {
    ...row,
    _id: row.id,
    mainMachineName: row.mainMachine
      ? {
          ...row.mainMachine,
          _id: row.mainMachine.id,
        }
      : row.mainMachineId,
    tradeMark: row.tradeMark
      ? {
          ...row.tradeMark,
          _id: row.tradeMark.id,
        }
      : null,
  };
}

async function generateSubMachineCode(tx) {
  const last = await tx.subMachine.findFirst({
    orderBy: { id: "desc" },
  });

  const next = Number(last?.id || 0) + 1;
  return `SM-${String(next).padStart(4, "0")}`;
}

export async function listSubMachinesService() {
  const rows = await prisma.subMachine.findMany({
    where: { deletedAt: null },
    include: {
      mainMachine: true,
      tradeMark: true,
    },
    orderBy: { id: "asc" },
  });

  return rows.map(toClientSubMachine);
}

export async function createSubMachineService(payload) {
  return prisma.$transaction(async (tx) => {
    if (
      !payload.subMachineName ||
      !payload.mainMachineName ||
      !payload.tradeMark ||
      !payload.location ||
      !payload.commissioningDate ||
      !payload.machineType ||
      !payload.model ||
      !payload.productionYear ||
      !payload.price ||
      !payload.currency ||
      !payload.description
    ) {
      const error = new Error("Lütfen tüm zorunlu alanları doldurun.");
      error.statusCode = 400;
      throw error;
    }

    const mainMachineId = toIntId(payload.mainMachineName, "Geçersiz ana makina id.");

    const mainMachine = await tx.mainMachine.findFirst({
      where: {
        id: mainMachineId,
        deletedAt: null,
        hasSubMachine: true,
      },
    });

    if (!mainMachine) {
      const error = new Error("Alt makina eklenebilecek ana makina bulunamadı.");
      error.statusCode = 404;
      throw error;
    }

    const row = await tx.subMachine.create({
      data: {
        subMachineCode: await generateSubMachineCode(tx),
        subMachineName: payload.subMachineName,

        mainMachineId,

        location: payload.location,
        commissioningDate: parseDateOnly(payload.commissioningDate),

        tradeMarkId: toIntId(payload.tradeMark, "Geçersiz marka id."),
        model: payload.model,
        productionYear: String(payload.productionYear),
        machineType: payload.machineType,
        isExproof: Boolean(payload.isExproof),

        price: toDecimalOrNull(payload.price),
        currency: payload.currency,

        isScrap: Boolean(payload.isScrap),
        scrapDate: payload.isScrap ? parseDateOnly(payload.scrapDate) : null,

        description: payload.description,
      },
      include: {
        mainMachine: true,
        tradeMark: true,
      },
    });

    return toClientSubMachine(row);
  });
}

export async function updateSubMachineService(id, payload) {
  const numericId = toIntId(id || payload.id);

  return prisma.$transaction(async (tx) => {
    const existing = await tx.subMachine.findFirst({
      where: { id: numericId, deletedAt: null },
    });

    if (!existing) {
      const error = new Error("Alt makina bulunamadı.");
      error.statusCode = 404;
      throw error;
    }

    if (payload.isScrap && !payload.scrapDate) {
      const error = new Error("Hurdaya çıkan alt makina için hurda tarihi zorunludur.");
      error.statusCode = 400;
      throw error;
    }

    const mainMachineId = toIntId(payload.mainMachineName, "Geçersiz ana makina id.");

    const mainMachine = await tx.mainMachine.findFirst({
      where: {
        id: mainMachineId,
        deletedAt: null,
        hasSubMachine: true,
      },
    });

    if (!mainMachine) {
      const error = new Error("Alt makina bağlanabilecek ana makina bulunamadı.");
      error.statusCode = 404;
      throw error;
    }

    const row = await tx.subMachine.update({
      where: { id: numericId },
      data: {
        subMachineName: payload.subMachineName,
        mainMachineId,

        location: payload.location,
        commissioningDate: parseDateOnly(payload.commissioningDate),

        tradeMarkId: toIntId(payload.tradeMark, "Geçersiz marka id."),
        model: payload.model,
        productionYear: String(payload.productionYear),
        machineType: payload.machineType,
        isExproof: Boolean(payload.isExproof),

        price: toDecimalOrNull(payload.price),
        currency: payload.currency,

        isScrap: Boolean(payload.isScrap),
        scrapDate: payload.isScrap ? parseDateOnly(payload.scrapDate) : null,

        description: payload.description,
      },
      include: {
        mainMachine: true,
        tradeMark: true,
      },
    });

    return toClientSubMachine(row);
  });
}
