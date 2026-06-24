import { describe, it, expect } from "vitest";

import { api, authHeader } from "../setup/auth.js";
import { createTestUser } from "../setup/factories.js";
import { PERMISSIONS } from "../../src/constants/permissions.js";

const uniqueCode = () => `ROUTE_DEPT_${Date.now()}_${Math.round(Math.random() * 1e9)}`;

describe("Department routes", () => {
  it("lists departments with DEPARTMENT_READ permission", async () => {
    const user = await createTestUser({
      permissions: [PERMISSIONS.DEPARTMENT_READ],
    });

    const res = await api().get("/api/departments").set("Authorization", authHeader(user));

    expect(res.status).toBe(200);
  });

  it("rejects list without DEPARTMENT_READ permission", async () => {
    const user = await createTestUser();

    const res = await api().get("/api/departments").set("Authorization", authHeader(user));

    expect(res.status).toBe(403);
  });

  it("creates department with DEPARTMENT_CREATE permission", async () => {
    const user = await createTestUser({
      permissions: [PERMISSIONS.DEPARTMENT_CREATE],
    });

    const code = uniqueCode();

    const res = await api().post("/api/departments").set("Authorization", authHeader(user)).send({
      code,
      name: "Route Department",
      description: "Route test",
      isActive: true,
    });

    expect(res.status).toBe(201);
    expect(res.body.data.code).toBe(code);
  });

  it("updates department with DEPARTMENT_UPDATE permission", async () => {
    const creator = await createTestUser({
      permissions: [PERMISSIONS.DEPARTMENT_CREATE],
    });

    const updater = await createTestUser({
      permissions: [PERMISSIONS.DEPARTMENT_UPDATE],
    });

    const createRes = await api().post("/api/departments").set("Authorization", authHeader(creator)).send({
      code: uniqueCode(),
      name: "Before Update",
    });

    const res = await api().patch(`/api/departments/${createRes.body.data.id}`).set("Authorization", authHeader(updater)).send({
      name: "After Update",
    });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe("After Update");
  });

  it("deletes department with DEPARTMENT_DELETE permission", async () => {
    const creator = await createTestUser({
      permissions: [PERMISSIONS.DEPARTMENT_CREATE],
    });

    const deleter = await createTestUser({
      permissions: [PERMISSIONS.DEPARTMENT_DELETE],
    });

    const createRes = await api().post("/api/departments").set("Authorization", authHeader(creator)).send({
      code: uniqueCode(),
      name: "Delete Route Department",
    });

    const res = await api().delete(`/api/departments/${createRes.body.data.id}`).set("Authorization", authHeader(deleter));

    expect(res.status).toBe(200);
  });
});
