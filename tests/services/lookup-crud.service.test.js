import { describe, it, expect, afterEach } from "vitest";
import { prisma } from "../../src/database/prisma.client.js";

import {
  getLookupGroupsService,
  getLookupGroupItemsService,
  createLookupGroupItemService,
  updateLookupGroupItemService,
  deleteLookupGroupItemService,
} from "../../src/modules/lookups/lookup.service.js";

const uniqueName = () => `TEST_LOOKUP_CRUD_${Date.now()}_${Math.round(Math.random() * 1e9)}`;

afterEach(async () => {
  await prisma.bloodType.deleteMany({
    where: {
      name: {
        startsWith: "TEST_LOOKUP_CRUD_",
      },
    },
  });
});

describe("lookup CRUD service", () => {
  it("lists lookup groups", async () => {
    const groups = await getLookupGroupsService();

    expect(Array.isArray(groups)).toBe(true);
    expect(groups.some((group) => group.key === "bloodTypes")).toBe(true);
  });

  it("creates lookup item", async () => {
    const value = uniqueName();

    const item = await createLookupGroupItemService("bloodTypes", {
      value,
      isActive: true,
    });

    expect(item.id).toBeTruthy();
    expect(item.value).toBe(value);
    expect(item.label).toBe(value);
    expect(item.isActive).toBe(true);
  });

  it("updates lookup item", async () => {
    const created = await createLookupGroupItemService("bloodTypes", {
      value: uniqueName(),
      isActive: true,
    });

    const updatedValue = uniqueName();

    const updated = await updateLookupGroupItemService("bloodTypes", created.id, {
      value: updatedValue,
      isActive: false,
    });

    expect(updated.value).toBe(updatedValue);
    expect(updated.isActive).toBe(false);
  });

  it("soft deletes active lookup item", async () => {
    const created = await createLookupGroupItemService("bloodTypes", {
      value: uniqueName(),
      isActive: true,
    });

    await deleteLookupGroupItemService("bloodTypes", created.id);

    const deleted = await prisma.bloodType.findUnique({
      where: {
        id: created.id,
      },
    });

    expect(deleted).toBeTruthy();
    expect(deleted.id).toBe(created.id);
    expect(deleted.isActive).toBe(false);
  });

  it("throws for invalid lookup group", async () => {
    await expect(getLookupGroupItemsService("invalidGroup")).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("rejects invalid lookup group on create", async () => {
    await expect(
      createLookupGroupItemService("invalidGroup", {
        value: uniqueName(),
      }),
    ).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});
