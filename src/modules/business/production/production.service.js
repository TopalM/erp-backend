import { prisma } from "../../../database/prisma.client.js";

const STATUS = {
  PLANNED: "PLANNED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  WAITING: "WAITING",
};

const TYPE = {
  PRODUCTION: "PRODUCTION",
  BREAKDOWN: "BREAKDOWN",
};

const delayReasonMap = {
  "Arıza / Müdahale": "BREAKDOWN_INTERVENTION",
  Bakım: "MAINTENANCE",
  "Operasyonel Bekleme": "OPERATIONAL_WAITING",
  "Hammadde Bekleme": "RAW_MATERIAL_WAITING",
  "Analiz Bekleme": "ANALYSIS_WAITING",
  Temizlik: "CLEANING",
  Diğer: "OTHER",
};

const delayReasonReverseMap = Object.fromEntries(Object.entries(delayReasonMap).map(([key, value]) => [value, key]));

function toDate(value) {
  return value ? new Date(value) : null;
}

function addMinutes(dateValue, minute) {
  const date = new Date(dateValue);
  date.setMinutes(date.getMinutes() + Number(minute || 0));
  return date;
}

function decimalToNumber(value) {
  if (value === null || value === undefined) return value;
  return Number(value);
}

function mapStatusToClient(status) {
  if (status === STATUS.PLANNED) return "Planlandı";
  if (status === STATUS.COMPLETED) return "Tamamlandı";
  if (status === STATUS.CANCELLED) return "İptal Edildi";
  return "Bekleme";
}

function mapJob(job) {
  const productName = job.productName || job.product?.name || job.productCode || "";

  return {
    ...job,

    type: job.type === TYPE.BREAKDOWN ? "BREAKDOWN" : "PRODUCTION",
    status: mapStatusToClient(job.status),

    product: productName,
    productId: job.productId || null,
    productCode: job.productCode || job.product?.code || null,
    productName,

    delayReason: job.delayReason ? delayReasonReverseMap[job.delayReason] : null,

    plannedQuantity: decimalToNumber(job.plannedQuantity),
    plannedTwoEH: decimalToNumber(job.plannedTwoEH),
    plannedPTA: decimalToNumber(job.plannedPTA),

    actualQuantity: decimalToNumber(job.actualQuantity),

    rekuper: decimalToNumber(job.rekuper),
    twoEthylAlcohol: decimalToNumber(job.twoEthylAlcohol),
    totalTwoEthylAlcohol: decimalToNumber(job.totalTwoEthylAlcohol),
    pta: decimalToNumber(job.pta),
    aa: decimalToNumber(job.aa),
    tma: decimalToNumber(job.tma),
    catalyst: decimalToNumber(job.catalyst),
    causticSoda: decimalToNumber(job.causticSoda),

    reactionStartTemperature: decimalToNumber(job.reactionStartTemperature),
    reactionStartCatalystAmount: decimalToNumber(job.reactionStartCatalystAmount),
    catalyst2Temperature: decimalToNumber(job.catalyst2Temperature),
    catalyst2Amount: decimalToNumber(job.catalyst2Amount),
    catalyst3Temperature: decimalToNumber(job.catalyst3Temperature),
    catalyst3Amount: decimalToNumber(job.catalyst3Amount),

    washingTemperature: decimalToNumber(job.washingTemperature),
    strippingStartTemperature: decimalToNumber(job.strippingStartTemperature),
    flashPointTemperature: decimalToNumber(job.flashPointTemperature),
    flashPointValue: decimalToNumber(job.flashPointValue),
    finalFlashPointTemperature: decimalToNumber(job.finalFlashPointTemperature),
    finalFlashPointValue: decimalToNumber(job.finalFlashPointValue),

    extraAlcohol1: decimalToNumber(job.extraAlcohol1),
    extraAlcohol2: decimalToNumber(job.extraAlcohol2),
    extraAlcohol3: decimalToNumber(job.extraAlcohol3),
    rekuperLitre: decimalToNumber(job.rekuperLitre),

    reactionRows:
      job.reactionRows?.map((row) => ({
        ...row,
        temperature: decimalToNumber(row.temperature),
        acidIndex: decimalToNumber(row.acidIndex),
        consumption: decimalToNumber(row.consumption),
      })) || [],

    inputs:
      job.inputs?.map((input) => ({
        ...input,
        quantity: decimalToNumber(input.quantity),
      })) || [],

    outputs:
      job.outputs?.map((output) => ({
        ...output,
        quantity: decimalToNumber(output.quantity),
      })) || [],
  };
}

function cleanUndefined(data) {
  Object.keys(data).forEach((key) => {
    if (data[key] === undefined) delete data[key];
  });

  return data;
}

async function renumberProductions(tx = prisma) {
  const jobs = await tx.productionJob.findMany({
    where: {
      isDeleted: false,
      type: TYPE.PRODUCTION,
    },
    orderBy: [{ year: "asc" }, { week: "asc" }, { plannedStart: "asc" }, { reactor: { sortOrder: "asc" } }, { plannedEnd: "asc" }, { id: "asc" }],
    select: { id: true },
  });

  await Promise.all(
    jobs.map((job, index) =>
      tx.productionJob.update({
        where: { id: job.id },
        data: { batchNo: String(index + 1) },
      }),
    ),
  );
}

async function assertNoReactorConflict(tx = prisma) {
  const jobs = await tx.productionJob.findMany({
    where: {
      isDeleted: false,
      type: TYPE.PRODUCTION,
      status: { not: STATUS.CANCELLED },
    },
    orderBy: [{ reactorId: "asc" }, { plannedStart: "asc" }],
  });

  for (let i = 0; i < jobs.length; i += 1) {
    const first = jobs[i];

    for (let j = i + 1; j < jobs.length; j += 1) {
      const second = jobs[j];

      if (first.reactorId !== second.reactorId) break;

      if (first.plannedStart < second.plannedEnd && first.plannedEnd > second.plannedStart) {
        const error = new Error(`Aynı reaktörde zaman çakışması var. Batch: ${first.batchNo || first.id} / ${second.batchNo || second.id}`);
        error.statusCode = 409;
        throw error;
      }
    }
  }
}

async function shiftPlannedJobsAfter({ reactorId, afterDate, nextStart, tx = prisma }) {
  const jobs = await tx.productionJob.findMany({
    where: {
      reactorId,
      isDeleted: false,
      status: STATUS.PLANNED,
      type: TYPE.PRODUCTION,
      plannedStart: { gt: afterDate },
    },
    orderBy: { plannedStart: "asc" },
  });

  let cursor = new Date(nextStart);

  for (const job of jobs) {
    const newStart = cursor;
    const newEnd = addMinutes(newStart, job.plannedDurationMinute);

    await tx.productionJob.update({
      where: { id: job.id },
      data: {
        plannedStart: newStart,
        plannedEnd: newEnd,
      },
    });

    cursor = newEnd;
  }
}

function buildProductFields(job) {
  return {
    productId: job.productId || null,
    productCode: job.productCode || job.product || null,
    productName: job.productName || job.product || null,
  };
}

export async function listWeekService({ year, week }) {
  const [jobs, setting, origins, reactors] = await Promise.all([
    prisma.productionJob.findMany({
      where: {
        year,
        week,
        isDeleted: false,
      },
      include: {
        reactor: true,
        product: true,
        reactionRows: { orderBy: { rowOrder: "asc" } },
        inputs: {
          include: {
            product: true,
            rawMaterialReceiptItem: {
              include: {
                receipt: {
                  include: {
                    supplier: true,
                  },
                },
              },
            },
          },
        },
        outputs: {
          include: {
            product: true,
          },
        },
      },
      orderBy: [{ reactor: { sortOrder: "asc" } }, { plannedStart: "asc" }],
    }),

    prisma.productionPeriodSetting.findUnique({
      where: {
        year_week: { year, week },
      },
    }),

    prisma.productionRawMaterialOrigin.findMany({
      where: { isActive: true },
      orderBy: [{ rawMaterialName: "asc" }, { brandName: "asc" }],
    }),

    prisma.productionReactor.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  return {
    jobs: jobs.map(mapJob),
    setting,
    origins,
    reactors,
  };
}

export async function createRawMaterialOriginService(payload) {
  return prisma.productionRawMaterialOrigin.create({
    data: {
      rawMaterialKey: payload.rawMaterialKey,
      rawMaterialName: payload.rawMaterialName,
      brandName: payload.brandName,
    },
  });
}

export async function createPlanService(payload, userId) {
  return prisma.$transaction(async (tx) => {
    if (payload.loadOrder || payload.maxProductionEnd) {
      await tx.productionPeriodSetting.upsert({
        where: {
          year_week: {
            year: payload.year,
            week: payload.week,
          },
        },
        create: {
          year: payload.year,
          week: payload.week,
          reactorLoadOrder: payload.loadOrder || undefined,
          maxProductionStart: toDate(payload.maxProductionStart),
          maxProductionEnd: toDate(payload.maxProductionEnd),
        },
        update: {
          reactorLoadOrder: payload.loadOrder || undefined,
          maxProductionStart: toDate(payload.maxProductionStart),
          maxProductionEnd: toDate(payload.maxProductionEnd),
        },
      });
    }

    await tx.productionJob.createMany({
      data: payload.jobs.map((job) => ({
        year: payload.year,
        week: payload.week,
        createdById: userId || null,

        type: TYPE.PRODUCTION,
        status: STATUS.PLANNED,

        reactorId: job.reactorId,

        ...buildProductFields(job),

        plannedStart: toDate(job.plannedStart),
        plannedEnd: toDate(job.plannedEnd),
        plannedDurationMinute: job.plannedDurationMinute,
        plannedQuantity: job.plannedQuantity,
        plannedTwoEH: job.plannedTwoEH,
        plannedPTA: job.plannedPTA,

        description: job.description || null,
      })),
    });

    await assertNoReactorConflict(tx);
    await renumberProductions(tx);

    return true;
  });
}

export async function updatePlanService(id, payload, userId) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.productionJob.findFirst({
      where: { id, isDeleted: false },
    });

    if (!existing) {
      const error = new Error("Üretim kaydı bulunamadı.");
      error.statusCode = 404;
      throw error;
    }

    if (existing.status !== STATUS.PLANNED) {
      const error = new Error("Sadece planlanan batch düzenlenebilir.");
      error.statusCode = 400;
      throw error;
    }

    const updated = await tx.productionJob.update({
      where: { id },
      data: cleanUndefined({
        updatedById: userId || null,

        ...buildProductFields(payload),

        plannedStart: toDate(payload.plannedStart),
        plannedEnd: toDate(payload.plannedEnd),
        plannedDurationMinute: payload.plannedDurationMinute,
        plannedQuantity: payload.plannedQuantity,
        plannedTwoEH: payload.plannedTwoEH,
        plannedPTA: payload.plannedPTA,
        description: payload.description,
      }),
    });

    await shiftPlannedJobsAfter({
      reactorId: updated.reactorId,
      afterDate: existing.plannedStart,
      nextStart: updated.plannedEnd,
      tx,
    });

    await assertNoReactorConflict(tx);
    await renumberProductions(tx);

    return updated;
  });
}

export async function finishProductionService(id, payload, userId) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.productionJob.findFirst({
      where: { id, isDeleted: false },
    });

    if (!existing) {
      const error = new Error("Üretim kaydı bulunamadı.");
      error.statusCode = 404;
      throw error;
    }

    if (existing.status === STATUS.CANCELLED) {
      const error = new Error("İptal edilen üretim bitirilemez.");
      error.statusCode = 400;
      throw error;
    }

    await tx.productionReactionRow.deleteMany({
      where: { productionJobId: id },
    });

    await tx.productionInput.deleteMany({
      where: { productionJobId: id },
    });

    await tx.productionOutput.deleteMany({
      where: { productionJobId: id },
    });

    const updated = await tx.productionJob.update({
      where: { id },
      data: {
        updatedById: userId || null,
        status: STATUS.COMPLETED,

        formen: payload.formen,
        actualStart: toDate(payload.actualStart),
        actualEnd: toDate(payload.actualEnd),
        actualDurationMinute: payload.actualDurationMinute,
        actualQuantity: payload.actualQuantity,

        description: payload.description || null,

        rekuper: payload.rekuper,

        twoEthylAlcohol: payload.twoEthylAlcohol,
        totalTwoEthylAlcohol: payload.totalTwoEthylAlcohol,
        twoEthylAlcoholLotNo: payload.twoEthylAlcoholLotNo || null,

        pta: payload.pta,
        ptaLotNo: payload.ptaLotNo || null,

        aa: payload.aa,
        aaLotNo: payload.aaLotNo || null,

        tma: payload.tma,
        tmaLotNo: payload.tmaLotNo || null,

        catalyst: payload.catalyst,
        catalystLotNo: payload.catalystLotNo || null,

        causticSoda: payload.causticSoda,

        reactionStartTime: payload.reactionStartTime || null,
        reactionStartTemperature: payload.reactionStartTemperature,
        reactionStartCatalystAmount: payload.reactionStartCatalystAmount,

        catalyst2Time: payload.catalyst2Time || null,
        catalyst2Temperature: payload.catalyst2Temperature,
        catalyst2Amount: payload.catalyst2Amount,

        catalyst3Time: payload.catalyst3Time || null,
        catalyst3Temperature: payload.catalyst3Temperature,
        catalyst3Amount: payload.catalyst3Amount,

        washingTime: payload.washingTime || null,
        washingTemperature: payload.washingTemperature,

        strippingStartTime: payload.strippingStartTime || null,
        strippingStartTemperature: payload.strippingStartTemperature,

        flashPointTime: payload.flashPointTime || null,
        flashPointTemperature: payload.flashPointTemperature,
        flashPointValue: payload.flashPointValue,

        hasFinalWashing: Boolean(payload.hasFinalWashing),

        finalFlashPointTime: payload.finalFlashPointTime || null,
        finalFlashPointTemperature: payload.finalFlashPointTemperature,
        finalFlashPointValue: payload.finalFlashPointValue,

        dryingStartTime: payload.dryingStartTime || null,
        dryingEndTime: payload.dryingEndTime || null,

        extraAlcohol1: payload.extraAlcohol1,
        extraAlcohol2: payload.extraAlcohol2,
        extraAlcohol3: payload.extraAlcohol3,

        rekuperLitre: payload.rekuperLitre,
        dropTank: payload.dropTank ? String(payload.dropTank) : null,
        stockTank: payload.stockTank ? String(payload.stockTank) : null,

        productionBreakdownMinute: payload.productionBreakdownMinute || 0,
        productionBreakdownDescription: payload.productionBreakdownDescription || null,

        reactionRows: {
          create: (payload.reactionRows || []).map((row, index) => ({
            rowOrder: index + 1,
            time: row.time || null,
            temperature: row.temperature,
            acidIndex: row.acidIndex,
            consumption: row.consumption,
          })),
        },

        inputs: {
          create: (payload.inputs || []).map((input) => ({
            productId: input.productId || null,
            rawMaterialReceiptItemId: input.rawMaterialReceiptItemId || null,
            rawMaterialName: input.rawMaterialName || null,
            lotNo: input.lotNo || null,
            quantity: input.quantity,
            unitName: input.unitName || null,
            originId: input.originId || null,
            originName: input.originName || null,
          })),
        },

        outputs: {
          create: (payload.outputs || []).map((output) => ({
            productId: output.productId || null,
            lotNo: output.lotNo || null,
            quantity: output.quantity,
            unitName: output.unitName || null,
            tankNo: output.tankNo || null,
          })),
        },
      },
    });

    const nextStart = addMinutes(updated.actualEnd || updated.plannedEnd, updated.productionBreakdownMinute || 0);

    await shiftPlannedJobsAfter({
      reactorId: updated.reactorId,
      afterDate: existing.plannedStart,
      nextStart,
      tx,
    });

    await assertNoReactorConflict(tx);
    await renumberProductions(tx);

    return updated;
  });
}

export async function cancelProductionService(id, payload = {}, userId) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.productionJob.findFirst({
      where: { id, isDeleted: false },
    });

    if (!existing) {
      const error = new Error("Üretim kaydı bulunamadı.");
      error.statusCode = 404;
      throw error;
    }

    if (existing.status !== STATUS.PLANNED) {
      const error = new Error("Sadece planlanan üretim iptal edilebilir.");
      error.statusCode = 400;
      throw error;
    }

    const updated = await tx.productionJob.update({
      where: { id },
      data: {
        updatedById: userId || null,
        status: STATUS.CANCELLED,
        description: payload.description || existing.description,
      },
    });

    await shiftPlannedJobsAfter({
      reactorId: existing.reactorId,
      afterDate: existing.plannedStart,
      nextStart: existing.plannedStart,
      tx,
    });

    await renumberProductions(tx);

    return updated;
  });
}

export async function saveDelayService(payload, userId) {
  return prisma.$transaction(async (tx) => {
    if (payload.delayJobId) {
      const existing = await tx.productionJob.findFirst({
        where: {
          id: payload.delayJobId,
          isDeleted: false,
          type: TYPE.BREAKDOWN,
        },
      });

      if (!existing) {
        const error = new Error("Bekleme / duruş kaydı bulunamadı.");
        error.statusCode = 404;
        throw error;
      }

      const updated = await tx.productionJob.update({
        where: { id: payload.delayJobId },
        data: {
          updatedById: userId || null,
          batchNo: payload.reason,
          delayReason: delayReasonMap[payload.reason],
          description: payload.description || payload.reason,
          plannedDurationMinute: payload.durationMinute,
          plannedEnd: addMinutes(existing.plannedStart, payload.durationMinute),
        },
      });

      await shiftPlannedJobsAfter({
        reactorId: updated.reactorId,
        afterDate: existing.plannedStart,
        nextStart: updated.plannedEnd,
        tx,
      });

      await assertNoReactorConflict(tx);

      return updated;
    }

    const afterJob = await tx.productionJob.findFirst({
      where: {
        id: payload.afterJobId,
        isDeleted: false,
      },
    });

    if (!afterJob) {
      const error = new Error("Hedef batch bulunamadı.");
      error.statusCode = 404;
      throw error;
    }

    const plannedStart = afterJob.plannedEnd;
    const plannedEnd = addMinutes(plannedStart, payload.durationMinute);

    const delayJob = await tx.productionJob.create({
      data: {
        year: payload.year,
        week: payload.week,
        createdById: userId || null,

        type: TYPE.BREAKDOWN,
        status: STATUS.WAITING,

        reactorId: payload.reactorId,
        batchNo: payload.reason,
        delayReason: delayReasonMap[payload.reason],

        plannedStart,
        plannedEnd,
        plannedDurationMinute: payload.durationMinute,
        plannedQuantity: 0,
        plannedTwoEH: 0,
        plannedPTA: 0,

        description: payload.description || payload.reason,
      },
    });

    await shiftPlannedJobsAfter({
      reactorId: payload.reactorId,
      afterDate: afterJob.plannedStart,
      nextStart: delayJob.plannedEnd,
      tx,
    });

    await assertNoReactorConflict(tx);

    return delayJob;
  });
}

export async function addBatchService(payload, userId) {
  return prisma.$transaction(async (tx) => {
    const created = await tx.productionJob.create({
      data: {
        year: payload.year,
        week: payload.week,
        createdById: userId || null,

        type: TYPE.PRODUCTION,
        status: STATUS.PLANNED,

        reactorId: payload.reactorId,

        ...buildProductFields(payload),

        plannedStart: toDate(payload.plannedStart),
        plannedEnd: toDate(payload.plannedEnd),
        plannedDurationMinute: payload.plannedDurationMinute,
        plannedQuantity: payload.plannedQuantity,
        plannedTwoEH: payload.plannedTwoEH,
        plannedPTA: payload.plannedPTA,

        description: payload.description || null,
      },
    });

    await assertNoReactorConflict(tx);
    await renumberProductions(tx);

    return created;
  });
}

export async function deleteJobService(id) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.productionJob.findFirst({
      where: { id, isDeleted: false },
    });

    if (!existing) {
      const error = new Error("Üretim kaydı bulunamadı.");
      error.statusCode = 404;
      throw error;
    }

    await tx.productionJob.update({
      where: { id },
      data: { isDeleted: true },
    });

    await shiftPlannedJobsAfter({
      reactorId: existing.reactorId,
      afterDate: existing.plannedStart,
      nextStart: existing.plannedStart,
      tx,
    });

    await renumberProductions(tx);

    return {
      success: true,
      message: "Üretim kaydı silindi.",
    };
  });
}
