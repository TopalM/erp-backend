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
};

const toClientTradeMark = (tradeMark) => {
  if (!tradeMark) return null;

  return {
    ...tradeMark,
    _id: tradeMark.id,
  };
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

const toClientFaultMaintenance = (item) => ({
  ...item,
  _id: item.id,
  mainMachineName: toClientMainMachine(item.mainMachine),
  subMachineName: toClientSubMachine(item.subMachine),
});

const getUserEmail = (user) => {
  return user?.email || user?.username || user?.name || null;
};

export const getAllFaultMaintenances = async () => {
  const data = await prisma.faultMaintenance.findMany({
    where: {
      deletedAt: null,
    },
    include: includeRelations,
    orderBy: {
      id: "desc",
    },
  });

  return data.map(toClientFaultMaintenance);
};

export const createFaultMaintenance = async (payload, user) => {
  const mainMachineId = Number(payload.mainMachineName);
  const subMachineId = parseSubMachineId(payload.subMachineName);

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

  const created = await prisma.faultMaintenance.create({
    data: {
      requester: getUserEmail(user),
      savedBy: getUserEmail(user),
      revisedBy: getUserEmail(user),

      location: payload.location.trim(),

      mainMachineId,
      subMachineId,

      description: payload.description.trim(),

      status: 0,
    },
    include: includeRelations,
  });

  return toClientFaultMaintenance(created);
};

export const updateFaultMaintenance = async (payload, user) => {
  const id = Number(payload.id);

  const current = await prisma.faultMaintenance.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });

  if (!current) {
    const error = new Error("Arıza bakım kaydı bulunamadı.");
    error.statusCode = 404;
    throw error;
  }

  if (![0, 1].includes(current.status)) {
    const error = new Error("Sadece bekleyen veya müdahale bekleyen kayıtlar düzenlenebilir.");
    error.statusCode = 400;
    throw error;
  }

  const mainMachineId = payload.mainMachineName ? Number(payload.mainMachineName) : current.mainMachineId;
  const subMachineId = payload.subMachineName !== undefined ? parseSubMachineId(payload.subMachineName) : current.subMachineId;

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

  const updated = await prisma.faultMaintenance.update({
    where: {
      id,
    },
    data: {
      revisedBy: getUserEmail(user),
      revisedDate: new Date(),

      location: payload.location ?? current.location,
      mainMachineId,
      subMachineId,

      description: payload.description ?? current.description,
      faultType: payload.faultType ?? current.faultType,
      reasonFailure: payload.reasonFailure ?? current.reasonFailure,
    },
    include: includeRelations,
  });

  return toClientFaultMaintenance(updated);
};

export const deleteFaultMaintenance = async (payload) => {
  const id = Number(payload.id);

  const current = await prisma.faultMaintenance.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });

  if (!current) {
    const error = new Error("Arıza bakım kaydı bulunamadı.");
    error.statusCode = 404;
    throw error;
  }

  if (![0, 1].includes(current.status)) {
    const error = new Error("Bu durumdaki bakım kaydı silinemez.");
    error.statusCode = 400;
    throw error;
  }

  const deleted = await prisma.faultMaintenance.update({
    where: {
      id,
    },
    data: {
      deletedAt: new Date(),
    },
    include: includeRelations,
  });

  return toClientFaultMaintenance(deleted);
};

export const requestFaultMaintenance = async (payload, user) => {
  const id = Number(payload.id);

  const current = await prisma.faultMaintenance.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });

  if (!current) {
    const error = new Error("Arıza bakım kaydı bulunamadı.");
    error.statusCode = 404;
    throw error;
  }

  if (current.status !== 0) {
    const error = new Error("Sadece durum bekleyen kayıtlar talebe gönderilebilir.");
    error.statusCode = 400;
    throw error;
  }

  const updated = await prisma.faultMaintenance.update({
    where: {
      id,
    },
    data: {
      status: 1,
      revisedBy: getUserEmail(user),
      revisedDate: new Date(),
    },
    include: includeRelations,
  });

  return toClientFaultMaintenance(updated);
};

export const updateFaultMaintenanceStatus = async (payload, user) => {
  const id = Number(payload.id);

  const current = await prisma.faultMaintenance.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });

  if (!current) {
    const error = new Error("Arıza bakım kaydı bulunamadı.");
    error.statusCode = 404;
    throw error;
  }

  const status = Number(payload.status);

  const updated = await prisma.$transaction(async (tx) => {
    const maintenance = await tx.faultMaintenance.update({
      where: {
        id,
      },
      data: {
        status,

        revisedBy: getUserEmail(user),
        revisedDate: new Date(),

        endOfWorkDescription: payload.endOfWorkDescription ?? current.endOfWorkDescription,
        faultType: payload.faultType ?? current.faultType,
        reasonFailure: payload.reasonFailure ?? current.reasonFailure,

        workingPersonel: payload.workingPersonel ?? current.workingPersonel,
        materials: payload.materials ?? current.materials,
        quantities: payload.quantities ?? current.quantities,
        unitPrices: payload.unitPrices ?? current.unitPrices,
        totalPrices: payload.totalPrices ?? current.totalPrices,

        totalPriceWithMaterialAndWorking: parseDecimal(payload.totalPriceWithMaterialAndWorking),

        workStartDateTime: parseDate(payload.workStartDateTime) ?? current.workStartDateTime,
        workEndDateTime: parseDate(payload.workEndDateTime) ?? current.workEndDateTime,

        rejectReason: payload.rejectReason ?? current.rejectReason,
      },
      include: includeRelations,
    });

    if (status === 3) {
      await tx.mainMachine.update({
        where: {
          id: maintenance.mainMachineId,
        },
        data: {
          lastMaintenanceDate: maintenance.workEndDateTime || new Date(),
        },
      });

      if (maintenance.subMachineId) {
        await tx.subMachine.update({
          where: {
            id: maintenance.subMachineId,
          },
          data: {
            lastMaintenanceDate: maintenance.workEndDateTime || new Date(),
          },
        });
      }
    }

    return maintenance;
  });

  return toClientFaultMaintenance(updated);
};
