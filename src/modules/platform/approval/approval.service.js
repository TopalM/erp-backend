import { prisma } from "../../../database/prisma.client.js";

function notFound(message = "Onay kaydı bulunamadı.") {
  const error = new Error(message);
  error.statusCode = 404;
  throw error;
}

export async function listApprovalsService(query = {}) {
  const where = {};

  if (query.module) where.module = query.module;
  if (query.entityType) where.entityType = query.entityType;
  if (query.entityId) where.entityId = query.entityId;
  if (query.status) where.status = query.status;
  if (query.approverId) where.approverId = query.approverId;
  if (query.requestedById) where.requestedById = query.requestedById;

  return prisma.approval.findMany({
    where,
    include: {
      requestedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
      approver: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
    orderBy: { requestedAt: "desc" },
  });
}

export async function submitApprovalService(payload, userId) {
  return prisma.approval.upsert({
    where: {
      module_entityType_entityId: {
        module: payload.module,
        entityType: payload.entityType,
        entityId: payload.entityId,
      },
    },
    update: {
      status: "PENDING",
      requestedById: userId || null,
      approverId: payload.approverId || null,
      requestedAt: new Date(),
      decidedAt: null,
      decisionNote: payload.decisionNote || null,
      rejectReason: null,
    },
    create: {
      module: payload.module,
      entityType: payload.entityType,
      entityId: payload.entityId,
      status: "PENDING",
      requestedById: userId || null,
      approverId: payload.approverId || null,
      decisionNote: payload.decisionNote || null,
    },
  });
}

export async function approveApprovalService(id, payload = {}, userId = null) {
  const existing = await prisma.approval.findUnique({ where: { id } });
  if (!existing) notFound();

  return prisma.approval.update({
    where: { id },
    data: {
      status: "APPROVED",
      approverId: existing.approverId || userId || null,
      decidedAt: new Date(),
      decisionNote: payload.decisionNote || null,
      rejectReason: null,
    },
  });
}

export async function rejectApprovalService(id, payload = {}, userId = null) {
  const existing = await prisma.approval.findUnique({ where: { id } });
  if (!existing) notFound();

  return prisma.approval.update({
    where: { id },
    data: {
      status: "REJECTED",
      approverId: existing.approverId || userId || null,
      decidedAt: new Date(),
      decisionNote: payload.decisionNote || null,
      rejectReason: payload.rejectReason || "Reddedildi.",
    },
  });
}

export async function cancelApprovalService(id) {
  const existing = await prisma.approval.findUnique({ where: { id } });
  if (!existing) notFound();

  return prisma.approval.update({
    where: { id },
    data: {
      status: "CANCELLED",
      decidedAt: new Date(),
    },
  });
}
