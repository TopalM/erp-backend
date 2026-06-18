import { prisma } from "../../../../database/prisma.client.js";

const purchaseOrderInclude = {
  supplier: true,
  purchaseRequest: true,

  currency: true,
  paymentTerm: true,

  purchaseReason: true,
  placeOfUse: true,
  purchasedType: true,
  transportType: true,
  supplierPoint: true,

  createdBy: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    },
  },

  items: {
    include: {
      rawMaterial: true,
      product: true,
      priceRecord: true,
      purchaseRequestItem: true,
      unit: true,
      currency: true,
      taxRatio: true,
      differentVatRatio: true,
    },
  },

  receipts: true,
};

function createHttpError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function toNullableNumber(value) {
  if (value === undefined || value === null || value === "") return null;

  const numberValue = Number(value);

  return Number.isNaN(numberValue) ? null : numberValue;
}

function calculateItemTotals(item) {
  const quantity = Number(item.quantity || 0);
  const unitPrice = Number(item.unitPrice || 0);
  const totalWithoutTax = quantity * unitPrice;

  return {
    totalWithoutTax: item.totalWithoutTax ?? totalWithoutTax,
    taxAmount: item.taxAmount ?? 0,
    totalWithTax: item.totalWithTax ?? totalWithoutTax,
  };
}

async function ensurePurchaseOrderExists(id) {
  const purchaseOrder = await prisma.purchaseOrder.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });

  if (!purchaseOrder) {
    throw createHttpError("Satınalma kaydı bulunamadı.", 404);
  }

  return purchaseOrder;
}

async function ensureSupplierExists(supplierId) {
  const supplier = await prisma.supplier.findFirst({
    where: {
      id: supplierId,
      deletedAt: null,
    },
  });

  if (!supplier) {
    throw createHttpError("Tedarikçi bulunamadı.", 404);
  }

  return supplier;
}

function buildPurchaseOrderItemCreateData(items = []) {
  return items.map((item) => {
    const totals = calculateItemTotals(item);

    return {
      category: item.category || "MATERIAL",

      rawMaterialId: item.rawMaterialId || null,
      productId: item.productId || null,
      priceRecordId: item.priceRecordId || null,
      purchaseRequestItemId: item.purchaseRequestItemId || null,

      serviceName: item.serviceName || null,
      materialName: item.materialName || null,
      description: item.description || null,

      quantity: Number(item.quantity),
      unitId: item.unitId || null,
      unitPrice: Number(item.unitPrice),

      currencyId: item.currencyId || null,

      taxRatioId: item.taxRatioId || null,
      differentVatRatioId: item.differentVatRatioId || null,

      totalWithoutTax: toNullableNumber(totals.totalWithoutTax),
      taxAmount: toNullableNumber(totals.taxAmount),
      totalWithTax: toNullableNumber(totals.totalWithTax),

      note: item.note || null,
    };
  });
}

function buildPurchaseOrderData(payload, userId = null) {
  return {
    supplierId: payload.supplierId,

    purchaseRequestId: payload.purchaseRequestId || null,

    orderNo: payload.orderNo,
    orderDate: payload.orderDate,
    deliveryDate: payload.deliveryDate || null,

    purchaseReasonId: payload.purchaseReasonId || null,
    placeOfUseId: payload.placeOfUseId || null,
    purchasedTypeId: payload.purchasedTypeId || null,
    transportTypeId: payload.transportTypeId || null,

    paymentTermId: payload.paymentTermId || null,
    deliveryDay: toNullableNumber(payload.deliveryDay),

    status: payload.status || "DRAFT",
    orderType: payload.orderType || "DOMESTIC",

    currencyId: payload.currencyId || null,

    totalWithoutTax: toNullableNumber(payload.totalWithoutTax),
    totalTax: toNullableNumber(payload.totalTax),
    totalWithTax: toNullableNumber(payload.totalWithTax),

    isDifferentVat: Boolean(payload.isDifferentVat),

    isStopaj: Boolean(payload.isStopaj),
    stopajRatio: toNullableNumber(payload.stopajRatio),
    totalStopaj: toNullableNumber(payload.totalStopaj),

    isTevkifat: Boolean(payload.isTevkifat),
    tevkifatRatio: toNullableNumber(payload.tevkifatRatio),
    totalTevkifat: toNullableNumber(payload.totalTevkifat),

    isInsurance: Boolean(payload.isInsurance),

    supplierPointId: payload.supplierPointId || null,

    description: payload.description || null,
    note: payload.note || null,

    ...(userId && {
      createdById: userId,
    }),
  };
}

export async function listPurchasesService(query = {}) {
  const where = {
    deletedAt: null,
  };

  if (query.status) {
    where.status = query.status;
  }

  if (query.supplierId) {
    where.supplierId = query.supplierId;
  }

  if (query.orderType) {
    where.orderType = query.orderType;
  }

  return prisma.purchaseOrder.findMany({
    where,
    include: purchaseOrderInclude,
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getPurchaseByIdService(id) {
  const purchaseOrder = await prisma.purchaseOrder.findFirst({
    where: {
      id,
      deletedAt: null,
    },
    include: purchaseOrderInclude,
  });

  if (!purchaseOrder) {
    throw createHttpError("Satınalma kaydı bulunamadı.", 404);
  }

  return purchaseOrder;
}

export async function createPurchaseService(payload, userId = null) {
  await ensureSupplierExists(payload.supplierId);

  const existingOrderNo = await prisma.purchaseOrder.findUnique({
    where: {
      orderNo: payload.orderNo,
    },
  });

  if (existingOrderNo) {
    throw createHttpError("Bu satınalma numarası zaten kullanılıyor.", 409);
  }

  return prisma.purchaseOrder.create({
    data: {
      ...buildPurchaseOrderData(payload, userId),
      items: {
        create: buildPurchaseOrderItemCreateData(payload.items),
      },
    },
    include: purchaseOrderInclude,
  });
}

export async function updatePurchaseService(id, payload) {
  await ensurePurchaseOrderExists(id);

  if (payload.supplierId) {
    await ensureSupplierExists(payload.supplierId);
  }

  if (payload.orderNo) {
    const existingOrderNo = await prisma.purchaseOrder.findFirst({
      where: {
        orderNo: payload.orderNo,
        id: {
          not: id,
        },
      },
    });

    if (existingOrderNo) {
      throw createHttpError("Bu satınalma numarası zaten kullanılıyor.", 409);
    }
  }

  return prisma.$transaction(async (tx) => {
    if (payload.items) {
      await tx.purchaseOrderItem.deleteMany({
        where: {
          purchaseOrderId: id,
        },
      });
    }

    return tx.purchaseOrder.update({
      where: {
        id,
      },
      data: {
        ...buildPurchaseOrderData(payload),

        ...(payload.items && {
          items: {
            create: buildPurchaseOrderItemCreateData(payload.items),
          },
        }),
      },
      include: purchaseOrderInclude,
    });
  });
}

export async function deletePurchaseService(id) {
  await ensurePurchaseOrderExists(id);

  return prisma.purchaseOrder.update({
    where: {
      id,
    },
    data: {
      deletedAt: new Date(),
    },
    include: purchaseOrderInclude,
  });
}
