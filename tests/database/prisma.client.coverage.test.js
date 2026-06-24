import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

const originalEnv = { ...process.env };

beforeEach(() => {
  vi.resetModules();
  vi.unmock("@prisma/client");
  vi.unmock("@prisma/adapter-pg");
  process.env = { ...originalEnv };
});

afterEach(() => {
  vi.resetModules();
  vi.doUnmock("@prisma/client");
  vi.doUnmock("@prisma/adapter-pg");
  vi.restoreAllMocks();
  vi.clearAllMocks();
  process.env = { ...originalEnv };
});

describe("prisma.client coverage", () => {
  it("creates prisma client with development logs", async () => {
    process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/testdb";
    process.env.NODE_ENV = "development";

    const prismaClientMock = vi.fn(function PrismaClientMock(options) {
      this.options = options;
    });

    const prismaPgMock = vi.fn(function PrismaPgMock(options) {
      this.options = options;
    });

    vi.doMock("@prisma/client", () => ({
      PrismaClient: prismaClientMock,
    }));

    vi.doMock("@prisma/adapter-pg", () => ({
      PrismaPg: prismaPgMock,
    }));

    await import("../../src/database/prisma.client.js");

    expect(prismaPgMock).toHaveBeenCalledWith({
      connectionString: "postgresql://test:test@localhost:5432/testdb",
    });

    expect(prismaClientMock).toHaveBeenCalledWith(
      expect.objectContaining({
        log: ["warn", "error"],
      }),
    );
  });

  it("creates prisma client with production logs", async () => {
    process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/testdb";
    process.env.NODE_ENV = "production";

    const prismaClientMock = vi.fn(function PrismaClientMock(options) {
      this.options = options;
    });

    const prismaPgMock = vi.fn(function PrismaPgMock(options) {
      this.options = options;
    });

    vi.doMock("@prisma/client", () => ({
      PrismaClient: prismaClientMock,
    }));

    vi.doMock("@prisma/adapter-pg", () => ({
      PrismaPg: prismaPgMock,
    }));

    await import("../../src/database/prisma.client.js");

    expect(prismaClientMock).toHaveBeenCalledWith(
      expect.objectContaining({
        log: ["error"],
      }),
    );
  });

  it("throws when DATABASE_URL is missing", async () => {
    delete process.env.DATABASE_URL;

    await expect(import("../../src/database/prisma.client.js")).rejects.toThrow("DATABASE_URL environment variable is required.");
  });
});
