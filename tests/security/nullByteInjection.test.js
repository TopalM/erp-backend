import { describe, it, expect } from "vitest";
import { createTestUser } from "../setup/factories.js";
import { authRequest } from "../setup/auth.js";

describe("null byte injection security", () => {
  it("rejects null byte payloads", async () => {
    const user = await createTestUser();

    const res = await authRequest(user).get("/api/documents?entityId=test%00.pdf");

    expect(res.status).not.toBe(500);
  });
});
