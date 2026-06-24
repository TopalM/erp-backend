import { describe, it, expect } from "vitest";
import { api } from "../setup/auth.js";

describe("json body limit security", () => {
  it("rejects oversized payload", async () => {
    const huge = "A".repeat(2 * 1024 * 1024);

    const res = await api().post("/api/auth/register").send({
      firstName: huge,
      lastName: huge,
      email: "test@plastifay.com.tr",
      password: "Test123*",
    });

    expect([400, 413]).toContain(res.status);
  });
});
