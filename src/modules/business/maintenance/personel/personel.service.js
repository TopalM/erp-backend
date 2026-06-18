import { prisma } from "../../../../database/prisma.client.js";

function parseDateOnly(value) {
  if (!value) return null;

  const [year, month, day] = value.toString().slice(0, 10).split("-").map(Number);

  return new Date(Date.UTC(year, month - 1, day));
}

function toIntId(id, message = "Geçersiz personel id.") {
  const parsed = Number(id);

  if (!Number.isInteger(parsed)) {
    const error = new Error(message);
    error.statusCode = 400;
    throw error;
  }

  return parsed;
}

function toClientPersonel(row) {
  if (!row) return row;

  return {
    ...row,
    _id: row.id,
  };
}

export async function listPersonelsService() {
  const rows = await prisma.personel.findMany({
    where: {
      deletedAt: null,
    },
    orderBy: {
      id: "asc",
    },
  });

  return rows.map(toClientPersonel);
}

export async function createPersonelService(payload) {
  if (!payload.nameSurname) {
    const error = new Error("Personel adı soyadı zorunludur.");
    error.statusCode = 400;
    throw error;
  }

  const row = await prisma.personel.create({
    data: {
      registrationNumber: payload.registrationNumber || null,
      nameSurname: payload.nameSurname,

      department: payload.department || null,
      location: payload.location || null,

      telNumber: payload.telNumber || null,
      emergencyTelNumber: payload.emergencyTelNumber || null,

      dateOfBirth: parseDateOnly(payload.dateOfBirth),
      birthPlace: payload.birthPlace || null,
      dateOfEmployment: parseDateOnly(payload.dateOfEmployment),

      bloodType: payload.bloodType || null,
      address: payload.address || null,
      district: payload.district || null,
      city: payload.city || null,

      remainVacation: payload.remainVacation ?? 14,
      remainOtherVacation: payload.remainOtherVacation ?? 0,

      isMechanicalPersonel: Boolean(payload.isMechanicalPersonel),
      isActive: payload.isActive ?? true,
    },
  });

  return toClientPersonel(row);
}

export async function updatePersonelService(id, payload) {
  const numericId = toIntId(id || payload.id);

  const existing = await prisma.personel.findFirst({
    where: {
      id: numericId,
      deletedAt: null,
    },
  });

  if (!existing) {
    const error = new Error("Personel bulunamadı.");
    error.statusCode = 404;
    throw error;
  }

  const row = await prisma.personel.update({
    where: {
      id: numericId,
    },
    data: {
      registrationNumber: payload.registrationNumber,
      nameSurname: payload.nameSurname,

      department: payload.department,
      location: payload.location,

      telNumber: payload.telNumber,
      emergencyTelNumber: payload.emergencyTelNumber,

      dateOfBirth: payload.dateOfBirth ? parseDateOnly(payload.dateOfBirth) : undefined,
      birthPlace: payload.birthPlace,
      dateOfEmployment: payload.dateOfEmployment ? parseDateOnly(payload.dateOfEmployment) : undefined,

      bloodType: payload.bloodType,
      address: payload.address,
      district: payload.district,
      city: payload.city,

      remainVacation: payload.remainVacation,
      remainOtherVacation: payload.remainOtherVacation,

      isMechanicalPersonel: payload.isMechanicalPersonel,
      isActive: payload.isActive,
    },
  });

  return toClientPersonel(row);
}
