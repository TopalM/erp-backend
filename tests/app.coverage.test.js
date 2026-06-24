import { describe, it, expect, vi } from "vitest";
import request from "supertest";

describe("app coverage", () => {
  it("returns health response", async () => {
    const { default: app } = await import("../src/app.js");

    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.service).toBe("Plastifay ERP API");
  });

  it("serves uploads route with cross origin resource policy header", async () => {
    const { default: app } = await import("../src/app.js");

    const res = await request(app).get("/uploads/not-existing-file.txt");

    expect(res.headers["cross-origin-resource-policy"]).toBe("cross-origin");
  });

  it("covers development morgan branch", async () => {
    vi.resetModules();

    vi.doMock("../src/config/env.js", () => ({
      env: {
        nodeEnv: "development",
        cors: {
          origins: [],
        },
      },
    }));

    vi.doMock("../src/routes/index.js", () => ({
      default: (req, res) => res.status(200).json({ ok: true }),
    }));

    const { default: app } = await import("../src/app.js");

    const res = await request(app).get("/health");

    expect(res.status).toBe(200);

    vi.resetModules();
    vi.doUnmock("../src/config/env.js");
    vi.doUnmock("../src/routes/index.js");
  });
});
