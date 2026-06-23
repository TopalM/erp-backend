import { describe, it, expect } from "vitest";
import { authorizePermissions } from "../../src/middlewares/authorizePermissions.js";

const runMiddleware = (middleware, req) =>
  new Promise((resolve) => {
    middleware(req, {}, (error) => resolve(error || null));
  });

describe("authorizePermissions", () => {
  it("allows SUPER_ADMIN without explicit permission", async () => {
    const error = await runMiddleware(authorizePermissions("finance.read"), {
      user: {
        role: { name: "SUPER_ADMIN" },
        userPermissions: [],
      },
    });

    expect(error).toBeNull();
  });

  it("does not allow ADMIN without explicit permission", async () => {
    const error = await runMiddleware(authorizePermissions("finance.read"), {
      user: {
        role: { name: "ADMIN" },
        userPermissions: [],
      },
    });

    expect(error.statusCode).toBe(403);
  });

  it("allows user with ALLOW permission", async () => {
    const error = await runMiddleware(authorizePermissions("finance.read"), {
      user: {
        role: { name: "VIEWER" },
        userPermissions: [
          {
            effect: "ALLOW",
            permission: { code: "finance.read" },
          },
        ],
      },
    });

    expect(error).toBeNull();
  });

  it("blocks user with DENY permission even if ALLOW exists", async () => {
    const error = await runMiddleware(authorizePermissions("finance.read"), {
      user: {
        role: { name: "VIEWER" },
        userPermissions: [
          {
            effect: "ALLOW",
            permission: { code: "finance.read" },
          },
          {
            effect: "DENY",
            permission: { code: "finance.read" },
          },
        ],
      },
    });

    expect(error.statusCode).toBe(403);
  });
});
