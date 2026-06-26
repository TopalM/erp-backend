import { prisma } from "../../../database/prisma.client.js";

function notFound(message = "Onay kaydı bulunamadı.") {
  const error = new Error(message);
  error.statusCode = 404;
  throw error;
}

function forbidden(message = "Bu işlem için yetkiniz yok.") {
  const error = new Error(message);
  error.statusCode = 403;
  throw error;
}

function conflict(message = "Onay kaydı bu işlem için uygun durumda değil.") {
  const error = new Error(message);
  error.statusCode = 409;
  throw error;
}

function isAdminLike(user) {
  return user?.role?.name === "SUPER_ADMIN" || user?.role?.name === "ADMIN";
}

function assertPendingApproval(approval) {
  if (approval.status !== "PENDING") {
    conflict("Sadece bekleyen onay kayıtları üzerinde işlem yapılabilir.");
  }
}

function assertCanDecideApproval(approval, user) {
  if (isAdminLike(user)) return;

  if (!user?.id) {
    forbidden("Onay kararı için kullanıcı bilgisi zorunludur.");
  }

  if (approval.requestedById && approval.requestedById === user.id) {
    forbidden("Kendi oluşturduğunuz onayı karara bağlayamazsınız.");
  }

  if (approval.approverId && approval.approverId !== user.id) {
    forbidden("Bu onay kaydı size atanmadı.");
  }
}

function assertCanCancelApproval(approval, user) {
  if (isAdminLike(user)) return;

  if (!user?.id) {
    forbidden("Onay iptali için kullanıcı bilgisi zorunludur.");
  }

  if (approval.requestedById !== user.id) {
    forbidden("Sadece kendi oluşturduğunuz onay sürecini iptal edebilirsiniz.");
  }
}

function buildApprovalScopeWhere(user) {
  if (isAdminLike(user)) return {};

  if (!user?.id) {
    return { id: "__NO_APPROVAL_ACCESS__" };
  }

  return {
    OR: [{ requestedById: user.id }, { approverId: user.id }],
  };
}

export async function listApprovalsService(query = {}, user = null) {
  const where = {
    ...buildApprovalScopeWhere(user),
  };

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

export async function approveApprovalService(id, payload = {}, user = null) {
  const existing = await prisma.approval.findUnique({ where: { id } });
  if (!existing) notFound();

  assertPendingApproval(existing);
  assertCanDecideApproval(existing, user);

  return prisma.approval.update({
    where: { id },
    data: {
      status: "APPROVED",
      approverId: existing.approverId || user?.id || null,
      decidedAt: new Date(),
      decisionNote: payload.decisionNote || null,
      rejectReason: null,
    },
  });
}

export async function rejectApprovalService(id, payload = {}, user = null) {
  const existing = await prisma.approval.findUnique({ where: { id } });
  if (!existing) notFound();

  assertPendingApproval(existing);
  assertCanDecideApproval(existing, user);

  return prisma.approval.update({
    where: { id },
    data: {
      status: "REJECTED",
      approverId: existing.approverId || user?.id || null,
      decidedAt: new Date(),
      decisionNote: payload.decisionNote || null,
      rejectReason: payload.rejectReason || "Reddedildi.",
    },
  });
}

export async function cancelApprovalService(id, user = null) {
  const existing = await prisma.approval.findUnique({ where: { id } });
  if (!existing) notFound();

  assertPendingApproval(existing);
  assertCanCancelApproval(existing, user);

  return prisma.approval.update({
    where: { id },
    data: {
      status: "CANCELLED",
      decidedAt: new Date(),
    },
  });
}
