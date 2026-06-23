import { describe, it, expect } from "vitest";
import { api, authHeader } from "../setup/auth.js";
import { createTestUser } from "../setup/factories.js";
import { PERMISSIONS } from "../../src/constants/permissions.js";
import { prisma } from "../../src/database/prisma.client.js";

describe("input sanitization security", () => {
  it("normalizes profile names and does not store raw spacing/case", async () => {
    const user = await createTestUser();

    const res = await api().patch("/api/users/profile").set("Authorization", authHeader(user)).send({
      firstName: "  muSTafa   ali  ",
      lastName: "  topal  ",
      phone: " 555 ",
      preferredTheme: "dark",
    });

    expect(res.status).toBe(200);
    expect(res.body.data.firstName).toBe("Mustafa Ali");
    expect(res.body.data.lastName).toBe("TOPAL");
  });

  it("trims and normalizes permission code on create", async () => {
    const user = await createTestUser({
      permissions: [PERMISSIONS.USER_PERMISSION_MANAGE],
    });

    const code = ` Security.Test.${Date.now()} `;

    const res = await api().post("/api/permissions").set("Authorization", authHeader(user)).send({
      code,
      name: "Security Test",
    });

    expect(res.status).toBe(201);
    expect(res.body.data.code).toBe(code.trim().toLowerCase());

    const permission = await prisma.permission.findUnique({
      where: {
        code: code.trim().toLowerCase(),
      },
    });

    expect(permission).toBeTruthy();
  });

  it("rejects invalid enum values instead of passing raw input", async () => {
    const user = await createTestUser({
      permissions: [PERMISSIONS.DOCUMENT_CREATE],
    });

    const res = await api()
      .post("/api/documents")
      .set("Authorization", authHeader(user))
      .field("module", "SYSTEM<script>")
      .field("entityType", "OTHER")
      .field("entityId", "x")
      .field("documentType", "OTHER");

    expect(res.status).toBe(400);
  });
});
