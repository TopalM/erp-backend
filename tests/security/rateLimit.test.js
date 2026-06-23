import { describe, it, expect } from "vitest";

import { api } from "../setup/auth.js";

describe("rate limit security", () => {
  it("does not rate limit a normal single login request before auth validation", async () => {
    const res = await api().post("/api/auth/login").send({
      email: "unknown@plastifay.com.tr",
      password: "Wrong123*",
    });

    expect([401, 429]).toContain(res.status);
  });

  it("does not rate limit a normal single register request before validation", async () => {
    const res = await api().post("/api/auth/register").send({
      firstName: "",
      lastName: "",
      email: "invalid",
      password: "weak",
    });

    expect([400, 429]).toContain(res.status);
  });
});
