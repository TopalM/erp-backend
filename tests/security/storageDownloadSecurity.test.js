import { describe, it, expect } from "vitest";

import { createTestUser } from "../setup/factories.js";
import { authRequest } from "../setup/auth.js";

describe("storage download security", () => {
  it("cannot access non existing document download", async () => {
    const user = await createTestUser();

    const res = await authRequest(user).get("/api/documents/fake-id/download-url");

    expect([401, 403, 404]).toContain(res.status);
  });
});
