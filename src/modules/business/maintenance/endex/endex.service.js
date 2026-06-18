import { prisma } from "../../../../database/prisma.client.js";

const decimalFields = [
  "fctryMainNtrlGasDgtl",
  "fctryMainNtrlGasMnl",
  "plstfyMainNtrlGasDgtl",
  "plstfyMainNtrlGasMnl",
  "kobeMainNtrlGasDgtl",
  "kobeMainNaturalGasManual",
  "kobeHotWtrNtrlGasDgtl",
  "kobeHotWtrNtrlGasMnl",
  "plstfyMainWtr",
  "fctryGardenWtr",
  "plstfyProcessWtr",
  "kobeMainWtr",
  "kobeWasteWtr",
];

function parseDateOnly(value) {
  if (!value) return null;

  const [year, month, day] = value.toString().slice(0, 10).split("-").map(Number);

  return new Date(Date.UTC(year, month - 1, day));
}

function toIntId(id, message = "Geçersiz endeks id.") {
  const parsed = Number(id);

  if (!Number.isInteger(parsed)) {
    const error = new Error(message);
    error.statusCode = 400;
    throw error;
  }

  return parsed;
}

function toDecimal(value, fieldName) {
  if (value === undefined || value === null || value === "") {
    const error = new Error(`${fieldName} alanı zorunludur.`);
    error.statusCode = 400;
    throw error;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    const error = new Error(`${fieldName} alanı geçerli bir sayı olmalıdır.`);
    error.statusCode = 400;
    throw error;
  }

  return parsed;
}

function buildEndexData(payload) {
  const data = {
    date: parseDateOnly(payload.date),
  };

  if (!data.date) {
    const error = new Error("Tarih zorunludur.");
    error.statusCode = 400;
    throw error;
  }

  decimalFields.forEach((field) => {
    data[field] = toDecimal(payload[field], field);
  });

  return data;
}

function toClientEndex(row) {
  if (!row) return row;

  return {
    ...row,
    _id: row.id,
  };
}

export async function listEndexService() {
  const rows = await prisma.endex.findMany({
    where: {
      deletedAt: null,
    },
    orderBy: [
      {
        date: "desc",
      },
      {
        id: "desc",
      },
    ],
  });

  return rows.map(toClientEndex);
}

export async function createEndexService(payload) {
  const data = buildEndexData(payload);

  const existing = await prisma.endex.findFirst({
    where: {
      date: data.date,
      deletedAt: null,
    },
  });

  if (existing) {
    const error = new Error("Bu tarihe ait endeks kaydı zaten mevcut.");
    error.statusCode = 409;
    throw error;
  }

  const row = await prisma.endex.create({
    data,
  });

  return toClientEndex(row);
}

export async function updateEndexService(id, payload) {
  const numericId = toIntId(id || payload.id);
  const data = buildEndexData(payload);

  const existing = await prisma.endex.findFirst({
    where: {
      id: numericId,
      deletedAt: null,
    },
  });

  if (!existing) {
    const error = new Error("Endeks kaydı bulunamadı.");
    error.statusCode = 404;
    throw error;
  }

  const sameDateRecord = await prisma.endex.findFirst({
    where: {
      id: {
        not: numericId,
      },
      date: data.date,
      deletedAt: null,
    },
  });

  if (sameDateRecord) {
    const error = new Error("Bu tarihe ait başka bir endeks kaydı zaten mevcut.");
    error.statusCode = 409;
    throw error;
  }

  const row = await prisma.endex.update({
    where: {
      id: numericId,
    },
    data,
  });

  return toClientEndex(row);
}

export async function deleteEndexService(id) {
  const numericId = toIntId(id);

  const existing = await prisma.endex.findFirst({
    where: {
      id: numericId,
      deletedAt: null,
    },
  });

  if (!existing) {
    const error = new Error("Endeks kaydı bulunamadı.");
    error.statusCode = 404;
    throw error;
  }

  await prisma.endex.update({
    where: {
      id: numericId,
    },
    data: {
      deletedAt: new Date(),
    },
  });

  return {
    id: numericId,
  };
}
