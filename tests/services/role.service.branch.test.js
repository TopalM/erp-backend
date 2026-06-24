import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const prismaMock = vi.hoisted(() => ({
  role: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

let service;

beforeEach(async () => {
  vi.resetModules();
  vi.clearAllMocks();

  vi.doMock("../../src/database/prisma.client.js", () => ({
    prisma: prismaMock,
  }));

  service = await import("../../src/modules/auth/roles/role.service.js");

  prismaMock.role.findMany.mockResolvedValue([]);
  prismaMock.role.findUnique.mockResolvedValue(null);

  prismaMock.role.create.mockImplementation(async ({ data }) => ({
    id: "role1",
    ...data,
  }));

  prismaMock.role.update.mockImplementation(async ({ where, data }) => ({
    id: where.id,
    ...data,
  }));

  prismaMock.role.delete.mockResolvedValue({
    id: "role1",
    name: "CUSTOM_ROLE",
  });
});

afterEach(() => {
  vi.doUnmock("../../src/database/prisma.client.js");
  vi.resetModules();
  vi.clearAllMocks();
});

describe("role.service branch coverage", () => {
  it("lists roles ordered by name", async () => {
    await service.listRolesService();

    expect(prismaMock.role.findMany).toHaveBeenCalledWith({
      orderBy: {
        name: "asc",
      },
    });
  });

  it("throws when role is not found by id", async () => {
    prismaMock.role.findUnique.mockResolvedValueOnce(null);

    await expect(service.getRoleByIdService("missing")).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("creates role with normalized name", async () => {
    prismaMock.role.findUnique.mockResolvedValueOnce(null);

    const result = await service.createRoleService({
      name: " purchasing manager ",
    });

    expect(prismaMock.role.create).toHaveBeenCalledWith({
      data: {
        name: "PURCHASING_MANAGER",
      },
    });

    expect(result.name).toBe("PURCHASING_MANAGER");
  });

  it("prevents duplicate role create", async () => {
    prismaMock.role.findUnique.mockResolvedValueOnce({
      id: "existing-role",
      name: "ADMIN_ASSISTANT",
    });

    await expect(
      service.createRoleService({
        name: "admin assistant",
      }),
    ).rejects.toMatchObject({
      statusCode: 409,
    });
  });

  it("prevents protected role update", async () => {
    prismaMock.role.findUnique.mockResolvedValueOnce({
      id: "role1",
      name: "ADMIN",
    });

    await expect(
      service.updateRoleService("role1", {
        name: "NEW_ADMIN",
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("prevents duplicate role update", async () => {
    prismaMock.role.findUnique
      .mockResolvedValueOnce({
        id: "role1",
        name: "CUSTOM_ROLE",
      })
      .mockResolvedValueOnce({
        id: "role2",
        name: "NEW_ROLE",
      });

    await expect(
      service.updateRoleService("role1", {
        name: "new role",
      }),
    ).rejects.toMatchObject({
      statusCode: 409,
    });
  });

  it("updates role name", async () => {
    prismaMock.role.findUnique
      .mockResolvedValueOnce({
        id: "role1",
        name: "CUSTOM_ROLE",
      })
      .mockResolvedValueOnce(null);

    const result = await service.updateRoleService("role1", {
      name: "new role",
    });

    expect(prismaMock.role.update).toHaveBeenCalledWith({
      where: {
        id: "role1",
      },
      data: {
        name: "NEW_ROLE",
      },
    });

    expect(result.name).toBe("NEW_ROLE");
  });

  it("prevents protected role delete", async () => {
    prismaMock.role.findUnique.mockResolvedValueOnce({
      id: "role1",
      name: "VIEWER",
    });

    await expect(service.deleteRoleService("role1")).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("deletes non-protected role", async () => {
    prismaMock.role.findUnique.mockResolvedValueOnce({
      id: "role1",
      name: "CUSTOM_ROLE",
    });

    await service.deleteRoleService("role1");

    expect(prismaMock.role.delete).toHaveBeenCalledWith({
      where: {
        id: "role1",
      },
    });
  });
});
