import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const originalEnv = process.env;

beforeEach(() => {
  vi.resetModules();

  process.env = {
    DATABASE_URL: "postgresql://test",
    JWT_SECRET: "secret",
    MAIL_HOST: "smtp.test",
    MAIL_USER: "user",
    MAIL_PASSWORD: "pass",
    MAIL_ADDRESS: "mail@test.com",
    NODE_ENV: "test",
  };
});

afterEach(() => {
  process.env = originalEnv;
});

describe("env config coverage", () => {
  it("uses default values", async () => {
    const { env } = await import("../../src/config/env.js");

    expect(env.port).toBe(5000);
    expect(env.nodeEnv).toBe("test");
    expect(env.jwt.expiresIn).toBe("1d");
    expect(env.cors.origins).toEqual([]);
    expect(env.frontendUrl).toBe("http://localhost:5173");
    expect(env.fileStorage.provider).toBe("YANDEX");
    expect(env.fileStorage.basePath).toBe("/PlastifayERP");
    expect(env.fileStorage.localRoot).toBe("uploads/storage");
    expect(env.mail.port).toBe(587);
    expect(env.mail.secure).toBe(false);
    expect(env.mail.fromName).toBe("Plastifay ERP");
    expect(env.yandexDisk.basePath).toBe("/PlastifayERP");
  });

  it("uses provided env values", async () => {
    process.env.PORT = "7000";
    process.env.NODE_ENV = "production";
    process.env.JWT_EXPIRES_IN = "7d";
    process.env.CORS_ORIGINS = "http://a.com, http://b.com";
    process.env.FRONTEND_URL = "http://frontend.test";
    process.env.FILE_STORAGE_PROVIDER = "LOCAL";
    process.env.FILE_STORAGE_BASE_PATH = "/ERP";
    process.env.FILE_STORAGE_LOCAL_ROOT = "custom/storage";
    process.env.MAIL_PORT = "465";
    process.env.MAIL_SECURE = "true";
    process.env.MAIL_FROM_NAME = "ERP Mail";
    process.env.YANDEX_DISK_TOKEN = "OAuth token";
    process.env.YANDEX_DISK_BASE_PATH = "/YandexERP";

    const { env } = await import("../../src/config/env.js");

    expect(env.port).toBe(7000);
    expect(env.nodeEnv).toBe("production");
    expect(env.jwt.expiresIn).toBe("7d");
    expect(env.cors.origins).toEqual(["http://a.com", "http://b.com"]);
    expect(env.frontendUrl).toBe("http://frontend.test");
    expect(env.fileStorage.provider).toBe("LOCAL");
    expect(env.fileStorage.basePath).toBe("/ERP");
    expect(env.fileStorage.localRoot).toBe("custom/storage");
    expect(env.mail.port).toBe(465);
    expect(env.mail.secure).toBe(true);
    expect(env.mail.fromName).toBe("ERP Mail");
    expect(env.yandexDisk.token).toBe("OAuth token");
    expect(env.yandexDisk.basePath).toBe("/YandexERP");
  });
});
