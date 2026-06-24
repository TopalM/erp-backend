import { describe, it, expect, vi } from "vitest";

import { api } from "../setup/auth.js";
import { createTestUser } from "../setup/factories.js";

vi.mock("../../src/modules/platform/notification/mail/mail.service.js", () => ({
  sendMail: vi.fn().mockResolvedValue({
    messageId: "test-message-id",
    accepted: [],
    rejected: [],
  }),
  verifyMailConnection: vi.fn().mockResolvedValue(true),
}));

const randomIp = (subnet = 10) => {
  return `10.20.${subnet}.${Math.floor(Math.random() * 200) + 1}`;
};

describe("auth enumeration security", () => {
  it("forgot password returns same status for existing and unknown email", async () => {
    const user = await createTestUser();

    const existingRes = await api().post("/api/auth/forgot-password").set("X-Forwarded-For", randomIp(30)).send({
      email: user.email,
    });

    const unknownRes = await api()
      .post("/api/auth/forgot-password")
      .set("X-Forwarded-For", randomIp(31))
      .send({
        email: `unknown-${Date.now()}@plastifay.com.tr`,
      });

    expect(existingRes.status).toBe(200);
    expect(unknownRes.status).toBe(200);
    expect(existingRes.body.message).toBe(unknownRes.body.message);
  });

  it("login uses generic message for wrong password and unknown user", async () => {
    const user = await createTestUser({
      password: "Correct123*",
    });

    const wrongPasswordRes = await api().post("/api/auth/login").set("X-Forwarded-For", randomIp(40)).send({
      email: user.email,
      password: "Wrong123*",
    });

    const unknownUserRes = await api()
      .post("/api/auth/login")
      .set("X-Forwarded-For", randomIp(41))
      .send({
        email: `unknown-${Date.now()}@plastifay.com.tr`,
        password: "Wrong123*",
      });

    expect(wrongPasswordRes.status).toBe(401);
    expect(unknownUserRes.status).toBe(401);
    expect(wrongPasswordRes.body.message).toBe(unknownUserRes.body.message);
  });
});
