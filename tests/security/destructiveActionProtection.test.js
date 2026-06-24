import { describe, it, expect } from "vitest";
import { api, authHeader } from "../setup/auth.js";
import { createTestUser } from "../setup/factories.js";
import { PERMISSIONS } from "../../src/constants/permissions.js";

describe("destructive action protection", () => {
  it("USER_READ cannot deactivate user", async () => {
    const actor = await createTestUser({
      permissions: [PERMISSIONS.USER_READ],
    });

    const target = await createTestUser();

    const res = await api().patch(`/api/users/${target.id}/deactivate`).set("Authorization", authHeader(actor));

    expect(res.status).toBe(403);
  });

  it("DOCUMENT_READ cannot delete document", async () => {
    const actor = await createTestUser({
      permissions: [PERMISSIONS.DOCUMENT_READ],
    });

    const res = await api().delete(`/api/documents/fake-document-id`).set("Authorization", authHeader(actor));

    expect(res.status).toBe(403);
  });

  it("AUDIT_LOG_READ cannot delete audit logs", async () => {
    const actor = await createTestUser({
      permissions: [PERMISSIONS.AUDIT_LOG_READ],
    });

    const res = await api().delete("/api/audit-logs").set("Authorization", authHeader(actor));

    expect(res.status).toBe(403);
  });
});
