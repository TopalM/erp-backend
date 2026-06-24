import bcrypt from "bcryptjs";
import { describe, it, expect, beforeEach } from "vitest";

import * as service from "../../src/modules/auth/users/user.service.js";
import { prisma } from "../../src/database/prisma.client.js";

const uniqueEmail = () => `user-coverage-${Date.now()}-${Math.random()}@plastifay.com.tr`;

const getViewerRole = async () => {
  const role = await prisma.role.findUnique({ where: { name: "VIEWER" } });
  if (!role) throw new Error("VIEWER role seed edilmemiş.");
  return role;
};

const getAdminRole = async () => {
  const role = await prisma.role.findUnique({ where: { name: "ADMIN" } });
  if (!role) throw new Error("ADMIN role seed edilmemiş.");
  return role;
};

const getOrCreateDepartment = async () => {
  const existing = await prisma.department.findFirst();
  if (existing) return existing;

  return prisma.department.create({
    data: {
      code: `TEST_DEP_${Date.now()}`,
      name: "Test Department",
      isActive: true,
    },
  });
};

const createUser = async (overrides = {}) => {
  const role = overrides.role || (await getViewerRole());

  return prisma.user.create({
    data: {
      firstName: overrides.firstName || "Test",
      lastName: overrides.lastName || "USER",
      email: overrides.email || uniqueEmail(),
      passwordHash: await bcrypt.hash("Test123*", 10),
      isActive: overrides.isActive ?? true,
      emailVerifiedAt: overrides.emailVerifiedAt ?? new Date(),
      roleId: role.id,
      departmentId: overrides.departmentId ?? null,
      tokenVersion: overrides.tokenVersion ?? 0,
    },
    include: {
      role: true,
      department: true,
      employee: true,
      userPermissions: {
        include: {
          permission: true,
        },
      },
    },
  });
};

beforeEach(async () => {
  await prisma.auditLog.deleteMany({
    where: {
      OR: [{ actorEmail: { contains: "user-coverage-" } }, { entityId: { contains: "user-coverage-" } }],
    },
  });

  await prisma.user.deleteMany({
    where: {
      email: {
        contains: "user-coverage-",
      },
    },
  });
});

describe("user.service coverage", () => {
  it("lists users and sanitizes password hash", async () => {
    const user = await createUser();

    const result = await service.getUsers();

    const found = result.find((item) => item.id === user.id);

    expect(found).toBeTruthy();
    expect(found.passwordHash).toBeUndefined();
  });

  it("lists pending users", async () => {
    const user = await createUser({
      isActive: false,
    });

    const result = await service.getPendingUsers();

    expect(result.some((item) => item.id === user.id)).toBe(true);
  });

  it("activates user and increments token version", async () => {
    const user = await createUser({
      isActive: false,
      tokenVersion: 0,
    });

    const result = await service.activateUser(user.id, { id: user.id, email: user.email }, {});

    expect(result.isActive).toBe(true);
    const freshUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    expect(freshUser.tokenVersion).toBe(user.tokenVersion + 1);
    expect(result.passwordHash).toBeUndefined();
  });

  it("throws when activating missing user", async () => {
    await expect(service.activateUser("missing-user-id", null, {})).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("deactivates user and writes audit log", async () => {
    const actor = await createUser();
    const user = await createUser({
      isActive: true,
      tokenVersion: 0,
    });

    const result = await service.deactivateUser(user.id, actor, {});

    expect(result.isActive).toBe(false);
    const freshUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    expect(freshUser.tokenVersion).toBe(user.tokenVersion + 1);

    const log = await prisma.auditLog.findFirst({
      where: {
        entityId: user.id,
      },
    });

    expect(log).toBeTruthy();
  });

  it("updates user role and increments token version", async () => {
    const actor = await createUser();
    const user = await createUser({
      tokenVersion: 0,
    });
    const adminRole = await getAdminRole();

    const result = await service.updateUserRole(user.id, adminRole.id, actor, {});

    expect(result.roleId).toBe(adminRole.id);
    const freshUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    expect(freshUser.tokenVersion).toBe(user.tokenVersion + 1);
  });

  it("throws when role does not exist", async () => {
    const user = await createUser();

    await expect(service.updateUserRole(user.id, "missing-role-id", null, {})).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("updates user department", async () => {
    const actor = await createUser();
    const user = await createUser({
      tokenVersion: 0,
    });
    const department = await getOrCreateDepartment();

    const result = await service.updateUserDepartment(user.id, department.id, actor, {});

    expect(result.departmentId).toBe(department.id);
    const freshUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    expect(freshUser.tokenVersion).toBe(user.tokenVersion + 1);
  });

  it("allows clearing user department", async () => {
    const department = await getOrCreateDepartment();
    const user = await createUser({
      departmentId: department.id,
    });

    const result = await service.updateUserDepartment(user.id, null, user, {});

    expect(result.departmentId).toBeNull();
  });

  it("throws when department does not exist", async () => {
    const user = await createUser();

    await expect(service.updateUserDepartment(user.id, "missing-department-id", null, {})).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("force logs out user by incrementing token version", async () => {
    const actor = await createUser();
    const user = await createUser({
      tokenVersion: 0,
    });

    const result = await service.forceLogoutUser(user.id, actor, {});

    const freshUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    expect(freshUser.tokenVersion).toBe(user.tokenVersion + 1);
  });

  it("updates profile with formatted names", async () => {
    const user = await createUser();

    const result = await service.updateProfile(user.id, {
      firstName: " mustafa ali ",
      lastName: " topal ",
      phone: "555",
      preferredTheme: "dark",
    });

    expect(result.id).toBe(user.id);
    expect(result.firstName).toBe("Mustafa Ali");
    expect(result.lastName).toBe("TOPAL");
    expect(result.phone).toBe("555");
    expect(result.preferredTheme).toBe("dark");
    expect(result.passwordHash).toBeUndefined();
  });

  it("throws when updating missing profile", async () => {
    await expect(
      service.updateProfile("missing-user-id", {
        firstName: "Test",
        lastName: "User",
      }),
    ).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});
