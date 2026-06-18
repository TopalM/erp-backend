import path from "path";
import { prisma } from "../../../../database/prisma.client.js";

const parseDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const parseDecimal = (value) => {
  if (value === "" || value === null || value === undefined) return null;
  return Number(value);
};

const parseSubMachineId = (value) => {
  if (value === "" || value === null || value === undefined) return null;
  return Number(value);
};

const includeRelations = {
  mainMachine: {
    include: {
      tradeMark: true,
    },
  },
  subMachine: {
    include: {
      tradeMark: true,
    },
  },
  supplier: true,
};

const toClientTradeMark = (tradeMark) => {
  if (!tradeMark) return null;
  return { ...tradeMark, _id: tradeMark.id };
};

const toClientMainMachine = (mainMachine) => {
  if (!mainMachine) return null;

  return {
    ...mainMachine,
    _id: mainMachine.id,
    tradeMark: toClientTradeMark(mainMachine.tradeMark),
  };
};

const toClientSubMachine = (subMachine) => {
  if (!subMachine) return null;

  return {
    ...subMachine,
    _id: subMachine.id,
    tradeMark: toClientTradeMark(subMachine.tradeMark),
  };
};

const toClientSupplier = (supplier) => {
  if (!supplier) return null;

  return {
    ...supplier,
    _id: supplier.id,
    companyName: supplier.name,
    supplierResponsiblePerson: supplier.contactName,
    mobilePhoneNumber: supplier.contactPhone || supplier.phone,
  };
};

const toClientPeriodicMaintenance = (item) => ({
  ...item,
  _id: item.id,
  mainMachineName: toClientMainMachine(item.mainMachine),
  subMachineName: toClientSubMachine(item.subMachine),
  companyName: toClientSupplier(item.supplier),
});

const buildFilePath = (file) => {
  if (!file) return null;
  return path.join("/uploads/periodic-maintenances", file.filename).replaceAll("\\", "/");
};

const buildScheduledDates = (firstDate, annualPlanned) => {
  const count = Number(annualPlanned);
  const first = parseDate(firstDate);

  if (!first || !Number.isFinite(count) || count <= 0) return null;

  const intervalMonth = Math.floor(12 / count);
  const dates = [];

  for (let i = 0; i < count; i += 1) {
    const date = new Date(first);
    date.setMonth(first.getMonth() + i * intervalMonth);
    dates.push(date.toISOString());
  }

  return dates.join("|");
};

export const getAllPeriodicMaintenances = async () => {
  const data = await prisma.periodicMaintenance.findMany({
    where: {
      deletedAt: null,
    },
    include: includeRelations,
    orderBy: {
      id: "desc",
    },
  });

  return data.map(toClientPeriodicMaintenance);
};

export const getAllPeriodicMaintenancesForFault = async () => {
  const data = await prisma.periodicMaintenance.findMany({
    where: {
      deletedAt: null,
    },
    include: includeRelations,
    orderBy: {
      id: "desc",
    },
  });

  return data.map(toClientPeriodicMaintenance);
};

export const createPeriodicMaintenance = async (payload, file) => {
  const mainMachineId = Number(payload.mainMachineName);
  const subMachineId = parseSubMachineId(payload.subMachineName);
  const supplierId = Number(payload.companyName);

  const mainMachine = await prisma.mainMachine.findFirst({
    where: {
      id: mainMachineId,
      deletedAt: null,
    },
  });

  if (!mainMachine) {
    const error = new Error("Ana makina bulunamadı.");
    error.statusCode = 404;
    throw error;
  }

  if (mainMachine.hasSubMachine && !subMachineId) {
    const error = new Error("Bu ana makina için alt makina seçimi zorunludur.");
    error.statusCode = 400;
    throw error;
  }

  if (subMachineId) {
    const subMachine = await prisma.subMachine.findFirst({
      where: {
        id: subMachineId,
        mainMachineId,
        deletedAt: null,
      },
    });

    if (!subMachine) {
      const error = new Error("Alt makina bulunamadı veya seçilen ana makinaya bağlı değil.");
      error.statusCode = 404;
      throw error;
    }
  }

  const supplier = await prisma.supplier.findFirst({
    where: {
      id: supplierId,
      deletedAt: null,
      categories: {
        some: {
          type: "SERVICE",
        },
      },
    },
  });

  if (!supplier) {
    const error = new Error("Servis tedarikçisi bulunamadı.");
    error.statusCode = 404;
    throw error;
  }

  const created = await prisma.periodicMaintenance.create({
    data: {
      location: payload.location.trim(),

      mainMachineId,
      subMachineId,
      supplierId,

      periodicMaintenanceInvoiceDate: parseDate(payload.periodicMaintenanceInvoiceDate),
      firstPeriodicMaintenanceDate: parseDate(payload.firstPeriodicMaintenanceDate),
      periodicMaintenanceInvoiceImage: buildFilePath(file),

      invoicePrice: parseDecimal(payload.invoicePrice),
      currency: payload.currency,

      annualPlanned: payload.annualPlanned,
      whichMaintenance: 1,

      scheduledMaintenanceDates: buildScheduledDates(payload.firstPeriodicMaintenanceDate, payload.annualPlanned),
    },
    include: includeRelations,
  });

  return toClientPeriodicMaintenance(created);
};

export const updatePeriodicMaintenance = async (payload, file) => {
  const id = Number(payload.id);

  const current = await prisma.periodicMaintenance.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });

  if (!current) {
    const error = new Error("Periodik bakım kaydı bulunamadı.");
    error.statusCode = 404;
    throw error;
  }

  const mainMachineId = payload.mainMachineName ? Number(payload.mainMachineName) : current.mainMachineId;
  const subMachineId = payload.subMachineName !== undefined ? parseSubMachineId(payload.subMachineName) : current.subMachineId;
  const supplierId = payload.companyName ? Number(payload.companyName) : current.supplierId;

  const updated = await prisma.periodicMaintenance.update({
    where: {
      id,
    },
    data: {
      location: payload.location ?? current.location,

      mainMachineId,
      subMachineId,
      supplierId,

      periodicMaintenanceInvoiceDate: payload.periodicMaintenanceInvoiceDate
        ? parseDate(payload.periodicMaintenanceInvoiceDate)
        : current.periodicMaintenanceInvoiceDate,

      firstPeriodicMaintenanceDate: payload.firstPeriodicMaintenanceDate
        ? parseDate(payload.firstPeriodicMaintenanceDate)
        : current.firstPeriodicMaintenanceDate,

      periodicMaintenanceInvoiceImage: file ? buildFilePath(file) : current.periodicMaintenanceInvoiceImage,

      invoicePrice: payload.invoicePrice !== undefined ? parseDecimal(payload.invoicePrice) : current.invoicePrice,
      currency: payload.currency ?? current.currency,

      annualPlanned: payload.annualPlanned ?? current.annualPlanned,

      scheduledMaintenanceDates:
        payload.firstPeriodicMaintenanceDate || payload.annualPlanned
          ? buildScheduledDates(
              payload.firstPeriodicMaintenanceDate ?? current.firstPeriodicMaintenanceDate,
              payload.annualPlanned ?? current.annualPlanned,
            )
          : current.scheduledMaintenanceDates,
    },
    include: includeRelations,
  });

  return toClientPeriodicMaintenance(updated);
};

export const deletePeriodicMaintenance = async (payload) => {
  const id = Number(payload.id);

  const current = await prisma.periodicMaintenance.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });

  if (!current) {
    const error = new Error("Periodik bakım kaydı bulunamadı.");
    error.statusCode = 404;
    throw error;
  }

  const deleted = await prisma.periodicMaintenance.update({
    where: {
      id,
    },
    data: {
      deletedAt: new Date(),
    },
    include: includeRelations,
  });

  return toClientPeriodicMaintenance(deleted);
};

export const addPeriodicMaintenanceStatus = async (payload) => {
  const id = Number(payload.id);

  const current = await prisma.periodicMaintenance.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });

  if (!current) {
    const error = new Error("Periodik bakım kaydı bulunamadı.");
    error.statusCode = 404;
    throw error;
  }

  const oldActualDates = current.actualMaintenanceDates ? current.actualMaintenanceDates.split("|").filter(Boolean) : [];
  const oldDescriptions = current.description ? current.description.split("|") : [];

  const newDate = payload.actualMaintenanceDate || new Date().toISOString();
  const newDescription = payload.description || "";

  const actualDates = [...oldActualDates, newDate].join("|");
  const descriptions = [...oldDescriptions, newDescription].join("|");

  const updated = await prisma.$transaction(async (tx) => {
    const maintenance = await tx.periodicMaintenance.update({
      where: {
        id,
      },
      data: {
        actualMaintenanceDates: actualDates,
        description: descriptions,
        whichMaintenance: current.whichMaintenance + 1,
      },
      include: includeRelations,
    });

    await tx.mainMachine.update({
      where: {
        id: maintenance.mainMachineId,
      },
      data: {
        lastMaintenanceDate: parseDate(newDate) || new Date(),
      },
    });

    if (maintenance.subMachineId) {
      await tx.subMachine.update({
        where: {
          id: maintenance.subMachineId,
        },
        data: {
          lastMaintenanceDate: parseDate(newDate) || new Date(),
        },
      });
    }

    return maintenance;
  });

  return toClientPeriodicMaintenance(updated);
};
