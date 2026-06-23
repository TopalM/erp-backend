import { describe, it, expect } from "vitest";

import { authRequest } from "../setup/auth.js";
import { createTestUser } from "../setup/factories.js";
import { PERMISSIONS } from "../../src/constants/permissions.js";

const matrix = [
  {
    method: "get",
    path: "/api/system/health",
    permission: PERMISSIONS.SYSTEM_HEALTH_READ,
  },
  {
    method: "get",
    path: "/api/documents",
    permission: PERMISSIONS.DOCUMENT_READ,
  },
  {
    method: "get",
    path: "/api/approvals",
    permission: PERMISSIONS.APPROVAL_READ,
  },
  {
    method: "get",
    path: "/api/assignments",
    permission: PERMISSIONS.ASSIGNMENT_READ,
  },
  {
    method: "get",
    path: "/api/users",
    permission: PERMISSIONS.USER_READ,
  },
  {
    method: "get",
    path: "/api/roles",
    permission: PERMISSIONS.USER_ROLE_MANAGE,
  },
  {
    method: "get",
    path: "/api/permissions",
    permission: PERMISSIONS.USER_PERMISSION_MANAGE,
  },
  {
    method: "get",
    path: "/api/audit-logs",
    permission: PERMISSIONS.AUDIT_LOG_READ,
  },
  {
    method: "get",
    path: "/api/auth-event-logs",
    permission: PERMISSIONS.SYSTEM_LOG_READ,
  },
];

describe("permission matrix security", () => {
  it.each(matrix)("rejects $path without required permission", async ({ method, path }) => {
    const user = await createTestUser();

    const res = await authRequest(user)[method](path);

    expect(res.status).toBe(403);
  });

  it.each(matrix)("allows $path with required permission", async ({ method, path, permission }) => {
    const user = await createTestUser({
      permissions: [permission],
    });

    const res = await authRequest(user)[method](path);

    expect(res.status).toBe(200);
  });
});
