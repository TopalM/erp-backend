import { describe, it, expect, vi, beforeEach } from "vitest";

const prismaMock = {
  userPermission: {
    findMany: vi.fn(),
  },
};

let authorizePermissions;
let authorizeSuperAdmin;

const makeReq = (user) => ({ user });
const makeRes = () => ({});
const makeNext = () => vi.fn();

beforeEach(async () => {
  vi.resetModules();
  vi.clearAllMocks();

  prismaMock.userPermission.findMany.mockResolvedValue([]);

  vi.doMock("../../src/database/prisma.client.js", () => ({
    prisma: prismaMock,
  }));

  const module = await import("../../src/middlewares/authorizePermissions.js");
  authorizePermissions = module.authorizePermissions;
  authorizeSuperAdmin = module.authorizeSuperAdmin;
});

describe("authorizePermissions coverage", () => {
  it("loads permissions from database when not present on req.user", async () => {
    prismaMock.userPermission.findMany.mockResolvedValueOnce([
      {
        effect: "ALLOW",
        permission: {
          code: "system.health.read",
        },
      },
    ]);

    const next = makeNext();

    await authorizePermissions("system.health.read")(
      makeReq({
        id: "user1",
        role: { name: "VIEWER" },
      }),
      makeRes(),
      next,
    );

    expect(prismaMock.userPermission.findMany).toHaveBeenCalledWith({
      where: { userId: "user1" },
      include: { permission: true },
    });

    expect(next).toHaveBeenCalledWith();
  });

  it("allows SUPER_ADMIN without loading permissions", async () => {
    const next = makeNext();

    await authorizePermissions("system.health.read")(
      makeReq({
        id: "admin1",
        role: { name: "SUPER_ADMIN" },
      }),
      makeRes(),
      next,
    );

    expect(prismaMock.userPermission.findMany).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith();
  });

  it("rejects missing user", async () => {
    const next = makeNext();

    await authorizePermissions("system.health.read")(makeReq(null), makeRes(), next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 401,
      }),
    );
  });

  it("DENY overrides ALLOW", async () => {
    const next = makeNext();

    await authorizePermissions("system.health.read")(
      makeReq({
        id: "user1",
        role: { name: "VIEWER" },
        userPermissions: [
          {
            effect: "ALLOW",
            permission: { code: "system.health.read" },
          },
          {
            effect: "DENY",
            permission: { code: "system.health.read" },
          },
        ],
      }),
      makeRes(),
      next,
    );

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 403,
      }),
    );
  });

  it("rejects missing required permission", async () => {
    const next = makeNext();

    await authorizePermissions("system.health.read")(
      makeReq({
        id: "user1",
        role: { name: "VIEWER" },
        userPermissions: [
          {
            effect: "ALLOW",
            permission: { code: "user.read" },
          },
        ],
      }),
      makeRes(),
      next,
    );

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 403,
      }),
    );
  });

  it("authorizeSuperAdmin allows SUPER_ADMIN", () => {
    const next = makeNext();

    authorizeSuperAdmin(
      makeReq({
        role: { name: "SUPER_ADMIN" },
      }),
      makeRes(),
      next,
    );

    expect(next).toHaveBeenCalledWith();
  });

  it("authorizeSuperAdmin rejects non SUPER_ADMIN", () => {
    const next = makeNext();

    authorizeSuperAdmin(
      makeReq({
        role: { name: "ADMIN" },
      }),
      makeRes(),
      next,
    );

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 403,
      }),
    );
  });

  it("authorizeSuperAdmin rejects missing user", () => {
    const next = makeNext();

    authorizeSuperAdmin(makeReq(null), makeRes(), next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 401,
      }),
    );
  });
});
