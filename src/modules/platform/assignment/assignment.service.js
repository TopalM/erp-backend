import { prisma } from "../../../database/prisma.client.js";

function notFound(message = "Atama kaydı bulunamadı.") {
  const error = new Error(message);
  error.statusCode = 404;
  throw error;
}

export async function listAssignmentsService(query = {}) {
  const where = {};

  if (query.module) where.module = query.module;
  if (query.entityType) where.entityType = query.entityType;
  if (query.entityId) where.entityId = query.entityId;
  if (query.userId) where.userId = query.userId;
  if (query.role) where.role = query.role;

  return prisma.assignment.findMany({
    where,
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true } },
      createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createAssignmentService(payload, createdById = null) {
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
      createdById,
    },
    create: {
      module: payload.module,
      entityType: payload.entityType,
      entityId: payload.entityId,
      userId: payload.userId,
      role: payload.role || "RESPONSIBLE",
      note: payload.note || null,
      createdById,
    },
  });
}

export async function updateAssignmentService(id, payload) {
  const existing = await prisma.assignment.findUnique({ where: { id } });
  if (!existing) notFound();

  return prisma.assignment.update({
    where: { id },
    data: {
      ...(payload.role !== undefined && { role: payload.role }),
      ...(payload.note !== undefined && { note: payload.note || null }),
    },
  });
}

export async function deleteAssignmentService(id) {
  const existing = await prisma.assignment.findUnique({ where: { id } });
  if (!existing) notFound();

  await prisma.assignment.delete({ where: { id } });
  return null;
}
