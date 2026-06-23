import bcrypt from "bcryptjs";
import { prisma } from "../../src/database/prisma.client.js";
import { ROLES } from "../../src/constants/roles.js";
import { PERMISSIONS } from "../../src/constants/permissions.js";

export const uniqueId = () => `${Date.now()}-${Math.round(Math.random() * 1e9)}`;

export const ensureRole = async (name = ROLES.VIEWER) => {
  return prisma.role.upsert({
    where: { name },
    update: {},
    create: {
      name,
      description: `${name} role`,
    },
  });
};

export const ensurePermission = async (code, name = code) => {
  return prisma.permission.upsert({
    where: { code },
    update: { name },
    create: {
      code,
      name,
      description: null,
    },
  });
};

export const createTestUser = async ({
  roleName = ROLES.VIEWER,
  email,
  password = "Test123*",
  isActive = true,
  emailVerified = true,
  permissions = [],
} = {}) => {
  const id = uniqueId();
  const role = await ensureRole(roleName);

  const user = await prisma.user.create({
    data: {
      firstName: "Test",
      lastName: "USER",
      email: email || `user+test-${id}@plastifay.com.tr`,
      passwordHash: await bcrypt.hash(password, 10),
      isActive,
      emailVerifiedAt: emailVerified ? new Date() : null,
      roleId: role.id,
      tokenVersion: 0,
    },
    include: {
      role: true,
      department: true,
      userPermissions: {
        include: {
          permission: true,
        },
      },
    },
  });

  for (const permission of permissions) {
    await grantPermission(user.id, permission);
  }

  return prisma.user.findUnique({
    where: { id: user.id },
    include: {
      role: true,
      department: true,
      userPermissions: {
        include: {
          permission: true,
        },
      },
    },
  });
};

export const createSuperAdmin = async (options = {}) => {
  return createTestUser({
    ...options,
    roleName: ROLES.SUPER_ADMIN,
  });
};

export const createAdmin = async (options = {}) => {
  return createTestUser({
    ...options,
    roleName: ROLES.ADMIN,
  });
};

export const grantPermission = async (userId, code, effect = "ALLOW") => {
  const permission = await ensurePermission(code);

  return prisma.userPermission.upsert({
    where: {
      userId_permissionId: {
        userId,
        permissionId: permission.id,
      },
    },
    update: {
      effect,
    },
    create: {
      userId,
      permissionId: permission.id,
      effect,
    },
    include: {
      permission: true,
    },
  });
};

export const grantPermissions = async (userId, codes) => {
  for (const code of codes) {
    await grantPermission(userId, code);
  }
};

export const commonUserManagementPermissions = [
  PERMISSIONS.USER_READ,
  PERMISSIONS.USER_UPDATE,
  PERMISSIONS.USER_ROLE_MANAGE,
  PERMISSIONS.USER_PERMISSION_MANAGE,
];
