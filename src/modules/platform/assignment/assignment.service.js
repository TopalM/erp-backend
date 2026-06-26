import { prisma } from "../../../database/prisma.client.js";

function notFound(message = "Atama kaydı bulunamadı.") {
  const error = new Error(message);
  error.statusCode = 404;
  throw error;
}

function forbidden(message = "Bu işlem için yetkiniz yok.") {
  const error = new Error(message);
  error.statusCode = 403;
  throw error;
}

function isAdminLike(user) {
  return user?.role?.name === "SUPER_ADMIN" || user?.role?.name === "ADMIN";
}

function assertCanModifyAssignment(assignment, user) {
  if (isAdminLike(user)) return;

  if (!user?.id) {
    forbidden("Atama işlemi için kullanıcı bilgisi zorunludur.");
  }

  if (assignment.createdById !== user.id) {
    forbidden("Sadece kendi oluşturduğunuz atamayı değiştirebilirsiniz.");
  }
}

export async function listAssignmentsService(query = {}, user = null) {
  const where = {};

  if (query.module) where.module = query.module;
  if (query.entityType) where.entityType = query.entityType;
  if (query.entityId) where.entityId = query.entityId;
  if (query.userId) where.userId = query.userId;
  if (query.role) where.role = query.role;

  if (!isAdminLike(user)) {
    if (!user?.id) {
      where.id = "__NO_ASSIGNMENT_ACCESS__";
    } else {
      where.OR = [{ userId: user.id }, { createdById: user.id }];
    }
  }

  return prisma.assignment.findMany({
    where,
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true } },
      createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createAssignmentService(payload, user = null) {
  return prisma.assignment.upsert({
    where: {
      module_entityType_entityId_userId_role: {
        module: payload.module,
        entityType: payload.entityType,
        entityId: payload.entityId,
        userId: payload.userId,
        role: payload.role || "RESPONSIBLE",
      },
    },
    update: {
      note: payload.note || null,
      createdById: user?.id || null,
    },
    create: {
      module: payload.module,
      entityType: payload.entityType,
      entityId: payload.entityId,
      userId: payload.userId,
      role: payload.role || "RESPONSIBLE",
      note: payload.note || null,
      createdById: user?.id || null,
    },
  });
}

export async function updateAssignmentService(id, payload, user = null) {
  const existing = await prisma.assignment.findUnique({ where: { id } });
  if (!existing) notFound();

  assertCanModifyAssignment(existing, user);

  return prisma.assignment.update({
    where: { id },
    data: {
      ...(payload.role !== undefined && { role: payload.role }),
      ...(payload.note !== undefined && { note: payload.note || null }),
    },
  });
}

export async function deleteAssignmentService(id, user = null) {
  const existing = await prisma.assignment.findUnique({ where: { id } });
  if (!existing) notFound();

  assertCanModifyAssignment(existing, user);

  await prisma.assignment.delete({ where: { id } });
  return null;
}
