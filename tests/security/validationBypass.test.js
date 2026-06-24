import { describe, it, expect } from "vitest";
import { api, authHeader } from "../setup/auth.js";
import { createTestUser } from "../setup/factories.js";
import { PERMISSIONS } from "../../src/constants/permissions.js";

describe("validation bypass security", () => {
  it("rejects invalid approval status payload shape", async () => {
    const user = await createTestUser({
      permissions: [PERMISSIONS.APPROVAL_CREATE],
    });

    const res = await api()
      .post("/api/approvals/submit")
      .set("Authorization", authHeader(user))
      .send({
        module: "",
        entityType: "",
        entityId: "",
        unexpected: {
          $ne: null,
        },
      });

    expect(res.status).toBe(400);
  });

  it("rejects invalid assignment payload shape", async () => {
    const user = await createTestUser({
      permissions: [PERMISSIONS.ASSIGNMENT_CREATE],
    });

    const res = await api()
      .post("/api/assignments")
      .set("Authorization", authHeader(user))
      .send({
        module: { $ne: null },
        entityType: "OTHER",
        entityId: "test",
        userId: "not-valid",
      });

    expect(res.status).toBe(400);
  });
});
