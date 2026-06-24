import { describe, it, expect, vi } from "vitest";

import { authorizeRoles } from "../../src/middlewares/role.middleware.js";
import { ROLES } from "../../src/constants/roles.js";

const runMiddleware = (user, allowedRoles = []) => {
  const req = { user };
  const res = {};
  const next = vi.fn();

  authorizeRoles(...allowedRoles)(req, res, next);

  return next;
};

describe("role.middleware", () => {
  it("rejects when user missing", () => {
    const next = runMiddleware(null, [ROLES.ADMIN]);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0]).toMatchObject({ statusCode: 401 });
  });

  it("rejects when role missing", () => {
    const next = runMiddleware({}, [ROLES.ADMIN]);

    expect(next.mock.calls[0][0]).toMatchObject({ statusCode: 401 });
  });

  it("allows SUPER_ADMIN regardless of allowed roles", () => {
    const next = runMiddleware({ role: { name: ROLES.SUPER_ADMIN } }, [ROLES.VIEWER]);

    expect(next).toHaveBeenCalledWith();
  });

  it("allows role object when included", () => {
    const next = runMiddleware({ role: { name: ROLES.ADMIN } }, [ROLES.ADMIN]);

    expect(next).toHaveBeenCalledWith();
  });

  it("allows role string when included", () => {
    const next = runMiddleware({ role: ROLES.ADMIN }, [ROLES.ADMIN]);

    expect(next).toHaveBeenCalledWith();
  });

  it("rejects role when not included", () => {
    const next = runMiddleware({ role: { name: ROLES.VIEWER } }, [ROLES.ADMIN]);

    expect(next.mock.calls[0][0]).toMatchObject({ statusCode: 403 });
  });
});
