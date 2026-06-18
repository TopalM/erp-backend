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
  return value;
}

function toClientMainMachine(row) {
  if (!row) return row;

  return {
    ...row,
    _id: row.id,
    tradeMark: row.tradeMark
      ? {
          ...row.tradeMark,
          _id: row.tradeMark.id,
        }
      : null,
    subMachines:
      row.subMachines?.map((sub) => ({
        ...sub,
        _id: sub.id,
        mainMachineName: row.id,
        tradeMark: sub.tradeMark ? { ...sub.tradeMark, _id: sub.tradeMark.id } : null,
      })) || [],
  };
}

async function generateMainMachineCode(tx) {
  const last = await tx.mainMachine.findFirst({
    orderBy: { id: "desc" },
  });

  const next = Number(last?.id || 0) + 1;
  return `AM-${String(next).padStart(4, "0")}`;
}

export async function listMainMachinesService() {
  const rows = await prisma.mainMachine.findMany({
    where: { deletedAt: null },
    include: {
      tradeMark: true,
      subMachines: {
        where: { deletedAt: null },
        include: { tradeMark: true },
        orderBy: { id: "asc" },
      },
    },
    orderBy: { id: "asc" },
  });

  return rows.map(toClientMainMachine);
}

export async function createMainMachineService(payload) {
  return prisma.$transaction(async (tx) => {
    const hasSubMachine = Boolean(payload.hasSubMachine);

    if (!payload.mainMachineName || !payload.location || !payload.commissioningDate) {
      const error = new Error("Ana makina adı, lokasyon ve devreye alma tarihi zorunludur.");
      error.statusCode = 400;
      throw error;
    }

    if (!hasSubMachine) {
      if (
        !payload.tradeMark ||
        !payload.model ||
        !payload.productionYear ||
        !payload.machineType ||
        !payload.price ||
        !payload.currency ||
        !payload.description
      ) {
        const error = new Error("Tekil ana makina için marka, model, üretim yılı, makina tipi, fiyat, para birimi ve açıklama zorunludur.");
        error.statusCode = 400;
        throw error;
      }
    }

    if (payload.isScrap && !payload.scrapDate) {
      const error = new Error("Hurdaya çıkan makina için hurda tarihi zorunludur.");
      error.statusCode = 400;
      throw error;
    }

    const row = await tx.mainMachine.create({
      data: {
        mainMachineCode: await generateMainMachineCode(tx),
        mainMachineName: payload.mainMachineName,
        location: payload.location,
        commissioningDate: parseDateOnly(payload.commissioningDate),

        hasSubMachine,

        tradeMarkId: hasSubMachine ? null : toIntId(payload.tradeMark, "Geçersiz marka id."),
        model: hasSubMachine ? null : payload.model,
        productionYear: hasSubMachine ? null : String(payload.productionYear),
        machineType: hasSubMachine ? null : payload.machineType,
        isExproof: hasSubMachine ? false : Boolean(payload.isExproof),

        price: hasSubMachine ? null : toDecimalOrNull(payload.price),
        currency: hasSubMachine ? null : payload.currency,

        isScrap: hasSubMachine ? false : Boolean(payload.isScrap),
        scrapDate: hasSubMachine ? null : parseDateOnly(payload.scrapDate),

        description: hasSubMachine ? null : payload.description,
      },
      include: {
        tradeMark: true,
        subMachines: {
          where: { deletedAt: null },
          include: { tradeMark: true },
        },
      },
    });

    return toClientMainMachine(row);
  });
}

export async function updateMainMachineService(id, payload) {
  const numericId = toIntId(id || payload.id);

  return prisma.$transaction(async (tx) => {
    const existing = await tx.mainMachine.findFirst({
      where: { id: numericId, deletedAt: null },
    });

    if (!existing) {
      const error = new Error("Ana makina bulunamadı.");
      error.statusCode = 404;
      throw error;
    }

    const hasSubMachine = Boolean(payload.hasSubMachine);

    const row = await tx.mainMachine.update({
      where: { id: numericId },
      data: {
        mainMachineName: payload.mainMachineName,
        location: payload.location,
        commissioningDate: parseDateOnly(payload.commissioningDate),

        hasSubMachine,

        tradeMarkId: hasSubMachine ? null : toIntId(payload.tradeMark, "Geçersiz marka id."),
        model: hasSubMachine ? null : payload.model,
        productionYear: hasSubMachine ? null : String(payload.productionYear),
        machineType: hasSubMachine ? null : payload.machineType,
        isExproof: hasSubMachine ? false : Boolean(payload.isExproof),

        price: hasSubMachine ? null : toDecimalOrNull(payload.price),
        currency: hasSubMachine ? null : payload.currency,

        isScrap: hasSubMachine ? false : Boolean(payload.isScrap),
        scrapDate: hasSubMachine ? null : parseDateOnly(payload.scrapDate),

        description: hasSubMachine ? null : payload.description,
      },
      include: {
        tradeMark: true,
        subMachines: {
          where: { deletedAt: null },
          include: { tradeMark: true },
        },
      },
    });

    return toClientMainMachine(row);
  });
}
