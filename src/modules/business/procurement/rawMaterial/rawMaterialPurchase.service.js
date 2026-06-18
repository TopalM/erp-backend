import crypto from "crypto";

import { env } from "../../../../config/env.js";
import { prisma } from "../../../../database/prisma.client.js";
import { sendMail } from "../../../platform/notification/mail/mail.service.js";
import { priceRequestTemplate } from "../../../platform/notification/mail/templates/priceRequest.template.js";

const generateOrderNo = () => `HM-${new Date().getFullYear()}-${Date.now()}`;
const generateReceiptNo = () => `RMR-${new Date().getFullYear()}-${Date.now()}`;

function parseDateOnly(dateString) {
  if (!dateString) return null;

  const [year, month, day] = String(dateString).split("-").map(Number);
  if (!year || !month || !day) return null;

  return new Date(Date.UTC(year, month - 1, day));
}

function getTodayDateOnlyForTurkey() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  return parseDateOnly(parts);
}

const getActivePriceRecordWhere = () => ({
  OR: [{ validUntil: null }, { validUntil: { gte: getTodayDateOnlyForTurkey() } }],
});

function getYearDateRange(year) {
  if (!year) return {};

  const numericYear = Number(year);
  if (!numericYear || Number.isNaN(numericYear)) return {};

  return {
    priceDate: {
      gte: new Date(Date.UTC(numericYear, 0, 1)),
      lt: new Date(Date.UTC(numericYear + 1, 0, 1)),
    },
  };
}

function getSupplierDisplayName(supplier) {
  return supplier?.companyName || supplier?.name || "-";
}

function normalizeSupplier(supplier) {
  if (!supplier) return supplier;

  const contacts = [];

  if (supplier.contactEmail) {
    contacts.push({
      id: `${supplier.id}-mail`,
      name: supplier.contactName || getSupplierDisplayName(supplier),
      type: "MAIL",
      contactType: "MAIL",
      email: supplier.contactEmail,
      phone: null,
      whatsapp: null,
      isDefault: true,
      isActive: true,
    });
  }

  if (supplier.contactPhone) {
    contacts.push({
      id: `${supplier.id}-whatsapp`,
      name: supplier.contactName || getSupplierDisplayName(supplier),
      type: "WHATSAPP",
      contactType: "WHATSAPP",
      email: null,
      phone: supplier.contactPhone,
      whatsapp: supplier.contactPhone,
      isDefault: !contacts.length,
      isActive: true,
    });
  }

  return {
    ...supplier,
    companyName: supplier.companyName || supplier.name,
    supplierResponsiblePerson: supplier.supplierResponsiblePerson || supplier.contactName,
    mobilePhoneNumber: supplier.mobilePhoneNumber || supplier.contactPhone,
    phoneNumber: supplier.phoneNumber || supplier.phone,
    contacts,
  };
}

function normalizePriceRecord(record) {
  if (!record) return record;

  return {
    ...record,
    supplier: normalizeSupplier(record.supplier),
  };
}

function normalizePurchaseOrder(order) {
  if (!order) return order;

  return {
    ...order,
    supplier: normalizeSupplier(order.supplier),
  };
}

function generatePublicOfferToken() {
  return crypto.randomBytes(32).toString("hex");
}

function getOfferTokenExpiryDate() {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  return expiresAt;
}

export async function getDashboardService() {
  const suppliers = await prisma.supplier.findMany({
    where: {
      deletedAt: null,
      categories: { some: { type: "RAW_MATERIAL" } },
    },
    include: {
      rawMaterials: true,
    },
    orderBy: { name: "asc" },
  });

  const priceRecords = await prisma.rawMaterialPriceRecord.findMany({
    where: getActivePriceRecordWhere(),
    include: {
      supplier: {
        include: {
          rawMaterials: true,
        },
      },
      product: true,
    },
    orderBy: [{ priceDate: "desc" }, { createdAt: "desc" }],
  });

  const latestMap = new Map();

  priceRecords.forEach((record) => {
    const key = `${record.supplierId}-${record.rawMaterialName}`;

    if (!latestMap.has(key)) {
      latestMap.set(key, normalizePriceRecord(record));
    }
  });

  return {
    suppliers: suppliers.map(normalizeSupplier),
    latestPrices: Array.from(latestMap.values()),
  };
}

export async function getLatestPriceRecordsService() {
  const records = await prisma.rawMaterialPriceRecord.findMany({
    where: getActivePriceRecordWhere(),
    include: {
      supplier: {
        include: {
          rawMaterials: true,
        },
      },
      product: true,
    },
    orderBy: [{ priceDate: "desc" }, { createdAt: "desc" }],
  });

  const latestMap = new Map();

  records.forEach((record) => {
    const key = `${record.supplierId}-${record.rawMaterialName}`;

    if (!latestMap.has(key)) {
      latestMap.set(key, normalizePriceRecord(record));
    }
  });

  return Array.from(latestMap.values());
}

export async function listPriceRecordsService(filters = {}) {
  const records = await prisma.rawMaterialPriceRecord.findMany({
    where: {
      ...getYearDateRange(filters.year),
    },
    include: {
      supplier: {
        include: {
          rawMaterials: true,
        },
      },
      product: true,
    },
    orderBy: [{ priceDate: "desc" }, { createdAt: "desc" }],
  });

  return records.map(normalizePriceRecord);
}

export async function getPriceRecordByIdService(id) {
  const record = await prisma.rawMaterialPriceRecord.findUnique({
    where: { id },
    include: {
      supplier: {
        include: {
          rawMaterials: true,
        },
      },
      product: true,
    },
  });

  if (!record) {
    const error = new Error("Fiyat kaydı bulunamadı.");
    error.statusCode = 404;
    throw error;
  }

  return normalizePriceRecord(record);
}

export async function createPriceRecordService(payload) {
  const previous = await prisma.rawMaterialPriceRecord.findFirst({
    where: {
      supplierId: payload.supplierId,
      rawMaterialName: payload.rawMaterialName,
    },
    orderBy: [{ priceDate: "desc" }, { createdAt: "desc" }],
  });

  const record = await prisma.rawMaterialPriceRecord.create({
    data: {
      supplierId: payload.supplierId,
      productId: payload.productId || null,
      rawMaterialName: payload.rawMaterialName,
      price: payload.price,
      previousPrice: previous?.price || null,
      currency: payload.currency || "USD",
      unit: payload.unit || "ton",
      priceDate: parseDateOnly(payload.priceDate),
      validUntil: payload.validUntil ? parseDateOnly(payload.validUntil) : null,
      paymentTerm: payload.paymentTerm || null,
      deliveryDay: payload.deliveryDay ?? null,
      source: payload.source || "MANUAL",
      note: payload.note || null,
    },
    include: {
      supplier: {
        include: {
          rawMaterials: true,
        },
      },
      product: true,
    },
  });

  return normalizePriceRecord(record);
}

export async function updatePriceRecordService(id, payload) {
  const existing = await prisma.rawMaterialPriceRecord.findUnique({
    where: { id },
  });

  if (!existing) {
    const error = new Error("Fiyat kaydı bulunamadı.");
    error.statusCode = 404;
    throw error;
  }

  const supplierId = payload.supplierId ?? existing.supplierId;
  const rawMaterialName = payload.rawMaterialName ?? existing.rawMaterialName;

  const previous = await prisma.rawMaterialPriceRecord.findFirst({
    where: {
      id: { not: id },
      supplierId,
      rawMaterialName,
    },
    orderBy: [{ priceDate: "desc" }, { createdAt: "desc" }],
  });

  const updateData = {
    supplierId: payload.supplierId,
    productId: payload.productId === "" ? null : payload.productId,
    rawMaterialName: payload.rawMaterialName,
    price: payload.price,
    previousPrice: previous?.price ?? null,
    currency: payload.currency,
    unit: payload.unit,
    priceDate: payload.priceDate ? parseDateOnly(payload.priceDate) : undefined,
    validUntil: payload.validUntil ? parseDateOnly(payload.validUntil) : payload.validUntil === null ? null : undefined,
    paymentTerm: payload.paymentTerm,
    deliveryDay: payload.deliveryDay,
    source: payload.source,
    note: payload.note,
  };

  Object.keys(updateData).forEach((key) => {
    if (updateData[key] === undefined) delete updateData[key];
  });

  const record = await prisma.rawMaterialPriceRecord.update({
    where: { id },
    data: updateData,
    include: {
      supplier: {
        include: {
          rawMaterials: true,
        },
      },
      product: true,
    },
  });

  return normalizePriceRecord(record);
}

export async function deletePriceRecordService(id) {
  const linkedOrderItemCount = await prisma.purchaseOrderItem.count({
    where: { priceRecordId: id },
  });

  if (linkedOrderItemCount > 0) {
    return {
      success: false,
      code: "PRICE_RECORD_IN_USE",
      message: "Bu fiyat kaydı satınalma siparişlerinde kullanıldığı için silinemez.",
    };
  }

  await prisma.rawMaterialPriceRecord.delete({
    where: { id },
  });

  return {
    success: true,
    message: "Fiyat kaydı silindi.",
  };
}

export async function createPriceRequestService(payload) {
  return prisma.rawMaterialPriceRequest.create({
    data: {
      draftId: payload.draftId || null,
      rawMaterialName: payload.rawMaterialName || null,
      productId: payload.productId || null,
      channel: payload.channel,
      subject: payload.subject || null,
      message: payload.message,
      suppliers: {
        create: payload.supplierIds.map((supplierId) => ({
          supplierId,
          channel: payload.channel,
          status: "READY",
        })),
      },
    },
    include: {
      suppliers: {
        include: {
          supplier: true,
        },
      },
    },
  });
}

export async function listPurchaseOrdersService() {
  const orders = await prisma.purchaseOrder.findMany({
    where: { deletedAt: null },
    include: {
      supplier: true,
      items: {
        include: {
          product: true,
          priceRecord: true,
        },
      },
      receipts: true,
      attachments: true,
    },
    orderBy: { orderDate: "desc" },
  });

  return orders.map(normalizePurchaseOrder);
}

export async function createPurchaseOrderService(payload, files = []) {
  const order = await prisma.purchaseOrder.create({
    data: {
      supplierId: payload.supplierId,
      orderNo: generateOrderNo(),
      orderDate: getTodayDateOnlyForTurkey(),
      deliveryDate: payload.deliveryDate ? parseDateOnly(payload.deliveryDate) : null,
      paymentTerm: payload.paymentTerm || null,
      deliveryDay: payload.deliveryDay ?? null,
      orderType: payload.orderType || "DOMESTIC",
      status: "ORDERED",
      currency: payload.currency || "USD",
      note: payload.note || null,

      items: {
        create: payload.items.map((item) => ({
          productId: item.productId || null,
          priceRecordId: item.priceRecordId || null,
          rawMaterialName: item.rawMaterialName,
          quantity: item.quantity,
          unit: item.unit || "ton",
          unitPrice: item.unitPrice,
          currency: item.currency || payload.currency || "USD",
          note: item.note || null,
        })),
      },

      attachments: {
        create: files.map((file) => ({
          originalName: file.originalname,
          fileName: file.filename,
          mimeType: file.mimetype,
          size: file.size,
          path: file.path,
        })),
      },
    },
    include: {
      supplier: true,
      items: true,
      attachments: true,
    },
  });

  return normalizePurchaseOrder(order);
}

export async function updatePurchaseOrderService(id, payload) {
  const updateData = {
    supplierId: payload.supplierId,
    deliveryDate: payload.deliveryDate ? parseDateOnly(payload.deliveryDate) : payload.deliveryDate === null ? null : undefined,
    paymentTerm: payload.paymentTerm,
    deliveryDay: payload.deliveryDay,
    orderType: payload.orderType,
    currency: payload.currency,
    note: payload.note,
  };

  Object.keys(updateData).forEach((key) => {
    if (updateData[key] === undefined) delete updateData[key];
  });

  const order = await prisma.$transaction(async (tx) => {
    if (payload.items) {
      await tx.purchaseOrderItem.deleteMany({
        where: { purchaseOrderId: id },
      });

      updateData.items = {
        create: payload.items.map((item) => ({
          productId: item.productId || null,
          priceRecordId: item.priceRecordId || null,
          rawMaterialName: item.rawMaterialName,
          quantity: item.quantity,
          unit: item.unit || "ton",
          unitPrice: item.unitPrice,
          currency: item.currency || payload.currency || "USD",
          note: item.note || null,
        })),
      };
    }

    return tx.purchaseOrder.update({
      where: { id },
      data: updateData,
      include: {
        supplier: true,
        items: true,
        receipts: true,
      },
    });
  });

  return normalizePurchaseOrder(order);
}

export async function sendPurchaseOrderToImportService(id) {
  const order = await prisma.purchaseOrder.update({
    where: { id },
    data: { status: "SENT_TO_IMPORT" },
    include: {
      supplier: true,
      items: true,
    },
  });

  return normalizePurchaseOrder(order);
}

export async function createRawMaterialReceiptService(payload) {
  return prisma.rawMaterialReceipt.create({
    data: {
      supplierId: payload.supplierId,
      purchaseOrderId: payload.purchaseOrderId || null,
      receiptNo: generateReceiptNo(),
      receiptDate: parseDateOnly(payload.receiptDate),
      supplierBatchNo: payload.supplierBatchNo || null,
      documentNo: payload.documentNo || null,
      status: "RECEIVED",
      note: payload.note || null,
      items: {
        create: payload.items.map((item) => ({
          productId: item.productId || null,
          rawMaterialName: item.rawMaterialName,
          quantity: item.quantity,
          unit: item.unit || "ton",
          lotNo: item.lotNo || null,
        })),
      },
    },
    include: {
      supplier: true,
      purchaseOrder: true,
      items: true,
    },
  });
}

const defaultPurchaseSettings = {
  enabled: true,
  messageLanguage: "EN",
  sendMode: "manual",
  defaultCountryCode: "90",

  mailSubjectTr: "Teklif Talebi",
  mailSubjectEn: "Quotation Request",

  messageTr:
    "Merhaba,\n\nİlgili ürün(ler) için güncel teklifinizi paylaşabilir misiniz?\n\nBirim fiyat, para birimi, termin ve ödeme vadesi bilgisini iletmenizi rica ederiz.\n\nTeşekkür ederiz.\n\nİyi çalışmalar,",

  messageEn:
    "Hello,\n\nCould you please share your current quotation for the related product(s)?\n\nWe would appreciate it if you could provide the unit price, currency, delivery lead time, and payment terms.\n\nThank you in advance.\n\nBest regards,",

  addProductName: true,
  addPaymentTerm: true,
  addDeliveryTerm: true,
};

export async function getPurchaseSettingsService() {
  let settings = await prisma.rawMaterialPurchaseSettings.findFirst({
    orderBy: { createdAt: "asc" },
  });

  if (!settings) {
    settings = await prisma.rawMaterialPurchaseSettings.create({
      data: defaultPurchaseSettings,
    });
  }

  return settings;
}

export async function updatePurchaseSettingsService(payload) {
  const existing = await prisma.rawMaterialPurchaseSettings.findFirst({
    orderBy: { createdAt: "asc" },
  });

  const data = {
    enabled: payload.enabled,
    messageLanguage: payload.messageLanguage,
    sendMode: payload.sendMode,
    defaultCountryCode: payload.defaultCountryCode,
    mailSubjectTr: payload.mailSubjectTr,
    mailSubjectEn: payload.mailSubjectEn,
    messageTr: payload.messageTr,
    messageEn: payload.messageEn,
    addProductName: payload.addProductName,
    addPaymentTerm: payload.addPaymentTerm,
    addDeliveryTerm: payload.addDeliveryTerm,
  };

  if (!existing) {
    return prisma.rawMaterialPurchaseSettings.create({ data });
  }

  return prisma.rawMaterialPurchaseSettings.update({
    where: { id: existing.id },
    data,
  });
}

export async function sendSupplierPriceRequestMailService(payload) {
  if (!payload.rawMaterialName) {
    const error = new Error("Mail gönderimi için hammadde bilgisi zorunludur.");
    error.statusCode = 400;
    throw error;
  }

  const supplier = await prisma.supplier.findFirst({
    where: {
      id: payload.supplierId,
      deletedAt: null,
    },
    include: {
      rawMaterials: true,
    },
  });

  if (!supplier) {
    const error = new Error("Tedarikçi bulunamadı.");
    error.statusCode = 404;
    throw error;
  }

  if (!supplier.contactEmail) {
    const error = new Error("Tedarikçinin kayıtlı mail adresi bulunamadı.");
    error.statusCode = 400;
    throw error;
  }

  const token = generatePublicOfferToken();
  const tokenExpiresAt = getOfferTokenExpiryDate();
  const offerUrl = `${env.frontendUrl}/supplier-price-offer/${token}`;

  const priceRequest = await prisma.rawMaterialPriceRequest.create({
    data: {
      rawMaterialName: payload.rawMaterialName,
      productId: payload.productId || null,
      channel: "MAIL",
      subject: payload.subject,
      message: payload.message,
      suppliers: {
        create: [
          {
            supplierId: supplier.id,
            channel: "MAIL",
            status: "READY",
            token,
            tokenExpiresAt,
          },
        ],
      },
    },
    include: {
      suppliers: {
        include: {
          supplier: true,
        },
      },
    },
  });

  const html = priceRequestTemplate({
    supplierName: getSupplierDisplayName(supplier),
    subject: payload.subject,
    message: payload.message,
    offerUrl,
  });

  try {
    const mailResult = await sendMail({
      to: supplier.contactEmail,
      subject: payload.subject,
      text: payload.message,
      html,
    });

    const requestSupplierId = priceRequest.suppliers[0]?.id;

    if (requestSupplierId) {
      await prisma.rawMaterialPriceRequestSupplier.update({
        where: { id: requestSupplierId },
        data: {
          status: "SENT",
          sentAt: new Date(),
          error: null,
        },
      });
    }

    return {
      success: true,
      mail: mailResult,
      priceRequest,
      offerUrl,
    };
  } catch (error) {
    const requestSupplierId = priceRequest.suppliers[0]?.id;

    if (requestSupplierId) {
      await prisma.rawMaterialPriceRequestSupplier.update({
        where: { id: requestSupplierId },
        data: {
          status: "FAILED",
          error: error.message || "Mail gönderilemedi.",
        },
      });
    }

    throw error;
  }
}

export async function getPublicPriceRequestService(token) {
  const requestSupplier = await prisma.rawMaterialPriceRequestSupplier.findUnique({
    where: { token },
    include: {
      supplier: {
        include: {
          rawMaterials: true,
        },
      },
      request: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!requestSupplier) {
    const error = new Error("Teklif talebi bulunamadı.");
    error.statusCode = 404;
    throw error;
  }

  if (requestSupplier.tokenExpiresAt && requestSupplier.tokenExpiresAt < new Date()) {
    await prisma.rawMaterialPriceRequestSupplier.update({
      where: { id: requestSupplier.id },
      data: { status: "EXPIRED" },
    });

    const error = new Error("Teklif bağlantısının süresi dolmuş.");
    error.statusCode = 410;
    throw error;
  }

  return {
    id: requestSupplier.id,
    status: requestSupplier.status,
    respondedAt: requestSupplier.respondedAt,
    supplier: {
      name: getSupplierDisplayName(requestSupplier.supplier),
      country: requestSupplier.supplier.country,
      city: requestSupplier.supplier.city,
    },
    request: {
      rawMaterialName: requestSupplier.request.rawMaterialName,
      productId: requestSupplier.request.productId,
      subject: requestSupplier.request.subject,
      message: requestSupplier.request.message,
      requestedAt: requestSupplier.request.requestedAt,
    },
  };
}

export async function respondPublicPriceRequestService(token, payload) {
  const requestSupplier = await prisma.rawMaterialPriceRequestSupplier.findUnique({
    where: { token },
    include: {
      request: true,
      supplier: true,
    },
  });

  if (!requestSupplier) {
    const error = new Error("Teklif talebi bulunamadı.");
    error.statusCode = 404;
    throw error;
  }

  if (requestSupplier.tokenExpiresAt && requestSupplier.tokenExpiresAt < new Date()) {
    await prisma.rawMaterialPriceRequestSupplier.update({
      where: { id: requestSupplier.id },
      data: { status: "EXPIRED" },
    });

    const error = new Error("Teklif bağlantısının süresi dolmuş.");
    error.statusCode = 410;
    throw error;
  }

  if (requestSupplier.respondedAt) {
    const error = new Error("Bu teklif talebi daha önce cevaplanmış.");
    error.statusCode = 409;
    throw error;
  }

  const rawMaterialName = requestSupplier.request.rawMaterialName;

  if (!rawMaterialName) {
    const error = new Error("Teklif talebinde hammadde bilgisi bulunamadı.");
    error.statusCode = 400;
    throw error;
  }

  return prisma.$transaction(async (tx) => {
    const previous = await tx.rawMaterialPriceRecord.findFirst({
      where: {
        supplierId: requestSupplier.supplierId,
        rawMaterialName,
      },
      orderBy: [{ priceDate: "desc" }, { createdAt: "desc" }],
    });

    const priceRecord = await tx.rawMaterialPriceRecord.create({
      data: {
        supplierId: requestSupplier.supplierId,
        productId: requestSupplier.request.productId || null,
        priceRequestSupplierId: requestSupplier.id,
        rawMaterialName,
        price: payload.price,
        previousPrice: previous?.price || null,
        currency: payload.currency || "USD",
        unit: payload.unit || "ton",
        priceDate: getTodayDateOnlyForTurkey(),
        validUntil: payload.validUntil ? parseDateOnly(payload.validUntil) : null,
        paymentTerm: payload.paymentTerm || null,
        deliveryDay: payload.deliveryDay ?? null,
        source: "MAIL",
        note: payload.note || null,
      },
      include: {
        supplier: true,
        product: true,
      },
    });

    await tx.rawMaterialPriceRequestSupplier.update({
      where: { id: requestSupplier.id },
      data: {
        status: "RESPONDED",
        respondedAt: new Date(),
        error: null,
      },
    });

    return {
      success: true,
      message: "Teklifiniz Plastifay sistemine başarıyla iletildi.",
      priceRecord: normalizePriceRecord(priceRecord),
    };
  });
}

export async function listRawMaterialSuppliersService() {
  const suppliers = await prisma.supplier.findMany({
    where: {
      deletedAt: null,
      categories: { some: { type: "RAW_MATERIAL" } },
    },
    include: {
      rawMaterials: true,
    },
    orderBy: { name: "asc" },
  });

  return suppliers.map(normalizeSupplier);
}
