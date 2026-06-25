import { describe, it, expect, vi } from "vitest";

const setupService = async () => {
  vi.resetModules();

  const createMock = vi.fn();
  const updateMock = vi.fn();
  const deleteMock = vi.fn();
  const findUniqueMock = vi.fn();
  const findFirstMock = vi.fn();

  vi.doMock("../../src/database/prisma.client.js", () => ({
    prisma: {
      bloodType: {
        findFirst: findFirstMock,
        findUnique: findUniqueMock,
        create: createMock,
        update: updateMock,
        delete: deleteMock,
      },
    },
  }));

  const service = await import("../../src/modules/lookups/lookup.service.js");

  return {
    ...service,
    createMock,
    updateMock,
    deleteMock,
    findUniqueMock,
    findFirstMock,
  };
};

describe("lookup prisma error mapping", () => {
  it("maps P2002 duplicate error on create to 409", async () => {
    const { createLookupGroupItemService, createMock, findFirstMock } = await setupService();

    findFirstMock.mockResolvedValueOnce({ id: 1 });
    createMock.mockRejectedValueOnce({
      code: "P2002",
    });

    await expect(
      createLookupGroupItemService("bloodTypes", {
        value: "A+",
      }),
    ).rejects.toMatchObject({
      statusCode: 409,
      message: "Lookup kaydı zaten mevcut.",
    });
  });

  it("maps P2003 relation error on create to 400", async () => {
    const { createLookupGroupItemService, createMock, findFirstMock } = await setupService();

    findFirstMock.mockResolvedValueOnce({ id: 1 });
    createMock.mockRejectedValueOnce({
      code: "P2003",
    });

    await expect(
      createLookupGroupItemService("bloodTypes", {
        value: "A+",
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: "İlişkili kayıt bulunamadı.",
    });
  });

  it("maps P2002 duplicate error on update to 409", async () => {
    const { updateLookupGroupItemService, updateMock, findUniqueMock } = await setupService();

    findUniqueMock.mockResolvedValueOnce({ id: 1 });
    updateMock.mockRejectedValueOnce({
      code: "P2002",
    });

    await expect(
      updateLookupGroupItemService("bloodTypes", 1, {
        value: "A+",
      }),
    ).rejects.toMatchObject({
      statusCode: 409,
      message: "Lookup kaydı zaten mevcut.",
    });
  });

  it("maps P2003 relation error on delete to 400", async () => {
    const { deleteLookupGroupItemService, updateMock, findUniqueMock } = await setupService();

    findUniqueMock.mockResolvedValueOnce({ id: 1 });
    updateMock.mockRejectedValueOnce({
      code: "P2003",
    });

    await expect(deleteLookupGroupItemService("bloodTypes", 1)).rejects.toMatchObject({
      statusCode: 400,
      message: "İlişkili kayıt bulunamadı.",
    });
  });
});
