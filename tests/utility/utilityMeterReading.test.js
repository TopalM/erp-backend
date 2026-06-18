import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import app from "../../src/app.js";
import { env } from "../../src/config/env.js";
import { prisma } from "../../src/database/prisma.client.js";
import { ROLES } from "../../src/constants/roles.js";

const adminEmail = "utility-reading-admin-test@plastifay.com.tr";
const password = "Test12345";
const meterCode = "UTILITY_TEST_WATER_METER";
const meterTypeCode = "UTILITY_TEST_WATER";

const createUser = async ({ email, roleName = ROLES.ADMIN }) => {
  const role = await prisma.role.findUnique({ where: { name: roleName } });
  expect(role).toBeTruthy();

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      firstName: "Utility",
      lastName: "Test",
      email,
      passwordHash,
      isActive: true,
      emailVerifiedAt: new Date(),
      tokenVersion: 0,
      roleId: role.id,
    },
    include: { role: true },
  });

  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role.name,
      departmentId: user.departmentId,
      tokenVersion: user.tokenVersion,
    },
    env.jwt.secret,
    { expiresIn: env.jwt.expiresIn },
  );

  return { user, token };
};

const createTestMeter = async () => {
  const meterType = await prisma.utilityMeterType.upsert({
    where: { code: meterTypeCode },
    update: {
      name: "Test Su",
      defaultUnit: "m3",
      isActive: true,
    },
    create: {
      code: meterTypeCode,
      name: "Test Su",
      defaultUnit: "m3",
      isActive: true,
    },
  });

  return prisma.utilityMeter.upsert({
    where: { code: meterCode },
    update: {
      name: "Utility Test Su Sayacı",
      meterTypeId: meterType.id,
      unit: "m3",
      isActive: true,
      deletedAt: null,
    },
    create: {
      code: meterCode,
      name: "Utility Test Su Sayacı",
      meterTypeId: meterType.id,
      unit: "m3",
      isActive: true,
    },
  });
};

describe("Utility Meter Reading Tests", () => {
  beforeEach(async () => {
    await prisma.utilityMeterReading.deleteMany({
      where: {
        meter: {
          code: meterCode,
        },
      },
    });

    await prisma.utilityMeter.deleteMany({ where: { code: meterCode } });
    await prisma.utilityMeterType.deleteMany({ where: { code: meterTypeCode } });

    await prisma.authEventLog.deleteMany({ where: { email: adminEmail } });
    await prisma.user.deleteMany({ where: { email: adminEmail } });
  });

  it("should list utility meters", async () => {
    const { token } = await createUser({ email: adminEmail });
    await createTestMeter();

    const response = await request(app).get("/api/utility/meters").set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.some((item) => item.code === meterCode)).toBe(true);
  });

  it("should create meter reading", async () => {
    const { token } = await createUser({ email: adminEmail });
    const meter = await createTestMeter();

    const response = await request(app)
      .post("/api/utility/readings")
      .set("Authorization", `Bearer ${token}`)
      .send({
        meterId: meter.id,
        readingDate: "2026-06-18",
        value: 12345.67,
        note: "Test okuması",
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.meterId).toBe(meter.id);
    expect(Number(response.body.data.value)).toBe(12345.67);
  });

  it("should upsert same date reading", async () => {
    const { token } = await createUser({ email: adminEmail });
    const meter = await createTestMeter();

    const payload = {
      meterId: meter.id,
      readingDate: "2026-06-18",
      value: 100,
      note: "İlk değer",
    };

    const firstResponse = await request(app).post("/api/utility/readings").set("Authorization", `Bearer ${token}`).send(payload);
    const secondResponse = await request(app)
      .post("/api/utility/readings")
      .set("Authorization", `Bearer ${token}`)
      .send({ ...payload, value: 150, note: "Güncel değer" });

    expect(firstResponse.statusCode).toBe(201);
    expect(secondResponse.statusCode).toBe(201);
    expect(secondResponse.body.data.id).toBe(firstResponse.body.data.id);
    expect(Number(secondResponse.body.data.value)).toBe(150);

    const count = await prisma.utilityMeterReading.count({ where: { meterId: meter.id } });
    expect(count).toBe(1);
  });

  it("should list readings by meter", async () => {
    const { token } = await createUser({ email: adminEmail });
    const meter = await createTestMeter();

    await prisma.utilityMeterReading.create({
      data: {
        meterId: meter.id,
        readingDate: new Date("2026-06-18"),
        value: 100,
      },
    });

    const response = await request(app)
      .get("/api/utility/readings")
      .query({ meterId: meter.id })
      .set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.length).toBeGreaterThanOrEqual(1);
    expect(response.body.data[0].meter.code).toBe(meterCode);
  });

  it("should update reading", async () => {
    const { token } = await createUser({ email: adminEmail });
    const meter = await createTestMeter();

    const reading = await prisma.utilityMeterReading.create({
      data: {
        meterId: meter.id,
        readingDate: new Date("2026-06-18"),
        value: 100,
      },
    });

    const response = await request(app)
      .patch(`/api/utility/readings/${reading.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ value: 200, note: "Güncellendi" });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Number(response.body.data.value)).toBe(200);
    expect(response.body.data.note).toBe("Güncellendi");
  });

  it("should delete reading", async () => {
    const { token } = await createUser({ email: adminEmail });
    const meter = await createTestMeter();

    const reading = await prisma.utilityMeterReading.create({
      data: {
        meterId: meter.id,
        readingDate: new Date("2026-06-18"),
        value: 100,
      },
    });

    const response = await request(app).delete(`/api/utility/readings/${reading.id}`).set("Authorization", `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);

    const deleted = await prisma.utilityMeterReading.findUnique({ where: { id: reading.id } });
    expect(deleted).toBeNull();
  });

  it("should reject readings without token", async () => {
    const response = await request(app).get("/api/utility/readings");

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
  });
});
