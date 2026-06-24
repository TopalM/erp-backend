import bcrypt from "bcryptjs";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { prisma } from "../../src/database/prisma.client.js";

const mailMocks = vi.hoisted(() => ({
  sendMail: vi.fn(),
}));

vi.mock("../../src/modules/platform/notification/mail/mail.service.js", () => ({
  sendMail: mailMocks.sendMail,
}));

let authService;

beforeEach(async () => {
  vi.resetModules();
  vi.clearAllMocks();

  mailMocks.sendMail.mockResolvedValue({ messageId: "test-message-id" });

  await prisma.authEventLog.deleteMany({
    where: {
      email: {
        contains: "auth-coverage-",
      },
    },
  });

  await prisma.user.deleteMany({
    where: {
      email: {
        contains: "auth-coverage-",
      },
    },
  });

  authService = await import("../../src/modules/auth/auth/auth.service.js");
});

const uniqueEmail = () => `auth-coverage-${Date.now()}-${Math.random()}@plastifay.com.tr`;

const getViewerRole = async () => {
  const role = await prisma.role.findUnique({
    where: { name: "VIEWER" },
  });

  if (!role) {
    throw new Error("VIEWER role seed edilmemiş.");
  }

  return role;
};

const pick = (obj, key, fallback) => (Object.hasOwn(obj, key) ? obj[key] : fallback);

const createUser = async (overrides = {}) => {
  const role = await getViewerRole();

  const passwordHash = await bcrypt.hash(overrides.password || "OldPass123*", 10);

  return prisma.user.create({
    data: {
      firstName: overrides.firstName || "Test",
      lastName: overrides.lastName || "USER",
      email: overrides.email || uniqueEmail(),
      passwordHash,
      isActive: pick(overrides, "isActive", true),
      emailVerifiedAt: pick(overrides, "emailVerifiedAt", new Date()),
      roleId: overrides.roleId || role.id,
      failedLoginAttempts: pick(overrides, "failedLoginAttempts", 0),
      lockedUntil: pick(overrides, "lockedUntil", null),
      emailVerificationToken: pick(overrides, "emailVerificationToken", undefined),
      emailVerificationExpires: pick(overrides, "emailVerificationExpires", undefined),
      passwordResetToken: pick(overrides, "passwordResetToken", undefined),
      passwordResetExpires: pick(overrides, "passwordResetExpires", undefined),
    },
    include: {
      role: true,
      department: true,
    },
  });
};

beforeEach(async () => {
  vi.clearAllMocks();
  mailMocks.sendMail.mockResolvedValue({ messageId: "test-message-id" });

  await prisma.authEventLog.deleteMany({
    where: {
      email: {
        contains: "auth-coverage-",
      },
    },
  });

  await prisma.user.deleteMany({
    where: {
      email: {
        contains: "auth-coverage-",
      },
    },
  });
});

describe("auth.service coverage", () => {
  it("rejects invalid register email domain", async () => {
    await expect(
      authService.register({
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        password: "Test123*",
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("rejects weak register password", async () => {
    await expect(
      authService.register({
        firstName: "Test",
        lastName: "User",
        email: uniqueEmail(),
        password: "weak",
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("rolls back created user when verification mail fails", async () => {
    const email = uniqueEmail();

    mailMocks.sendMail.mockRejectedValueOnce(new Error("smtp failed"));

    await expect(
      authService.register({
        firstName: "  mustafa ali ",
        lastName: " topal ",
        email,
        password: "Test123*",
      }),
    ).rejects.toThrow("smtp failed");

    const user = await prisma.user.findUnique({
      where: { email },
    });

    expect(user).toBeNull();
  });

  it("registers user with normalized names and email", async () => {
    const email = uniqueEmail().toUpperCase();

    const user = await authService.register({
      firstName: "  mustafa ali ",
      lastName: " topal ",
      email,
      password: "Test123*",
    });

    expect(user.email).toBe(email.toLowerCase());
    expect(user.firstName).toBe("Mustafa Ali");
    expect(user.lastName).toBe("TOPAL");
    expect(user.passwordHash).toBeUndefined();
    expect(mailMocks.sendMail).toHaveBeenCalled();
  });

  it("rejects login when email or password missing", async () => {
    await expect(authService.login("", "Test123*")).rejects.toMatchObject({
      statusCode: 400,
    });

    await expect(authService.login("test@plastifay.com.tr", "")).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("rejects login for locked user", async () => {
    const user = await createUser({
      lockedUntil: new Date(Date.now() + 60_000),
    });

    await expect(authService.login(user.email, "OldPass123*")).rejects.toMatchObject({
      statusCode: 423,
    });
  });

  it("rejects inactive user login", async () => {
    const user = await createUser({
      isActive: false,
    });

    await expect(authService.login(user.email, "OldPass123*")).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it("rejects login when email is not verified", async () => {
    const user = await createUser({
      emailVerifiedAt: null,
    });

    await expect(authService.login(user.email, "OldPass123*")).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it("returns already verified user without updating token again", async () => {
    const user = await createUser({
      emailVerificationToken: "already-verified-token",
      emailVerificationExpires: new Date(Date.now() + 60_000),
      emailVerifiedAt: new Date(),
    });

    const result = await authService.verifyEmail("already-verified-token");

    expect(result.id).toBe(user.id);
    expect(result.passwordHash).toBeUndefined();
  });

  it("rejects missing verify email token", async () => {
    await expect(authService.verifyEmail()).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("rejects invalid verify email token", async () => {
    await expect(authService.verifyEmail("invalid-token")).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("rejects expired verify email token", async () => {
    await createUser({
      emailVerifiedAt: null,
      emailVerificationToken: "expired-verification-token",
      emailVerificationExpires: new Date(Date.now() - 60_000),
    });

    await expect(authService.verifyEmail("expired-verification-token")).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("verifies valid email token", async () => {
    const user = await createUser({
      emailVerifiedAt: null,
      emailVerificationToken: "valid-verification-token",
      emailVerificationExpires: new Date(Date.now() + 60_000),
    });

    const result = await authService.verifyEmail("valid-verification-token");

    expect(result.id).toBe(user.id);

    const updated = await prisma.user.findUnique({
      where: { id: user.id },
    });

    expect(updated.emailVerifiedAt).toBeTruthy();
    expect(updated.emailVerificationToken).toBeNull();
  });

  it("rejects change password with missing values", async () => {
    await expect(authService.changePassword("u1", "", "NewPass123*")).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("rejects change password when new password equals current password", async () => {
    const user = await createUser();

    await expect(authService.changePassword(user.id, "OldPass123*", "OldPass123*")).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("rejects change password for missing user", async () => {
    await expect(authService.changePassword("missing-user", "OldPass123*", "NewPass123*")).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("changes password and increments token version", async () => {
    const user = await createUser();

    await authService.changePassword(user.id, "OldPass123*", "NewPass123*");

    const updated = await prisma.user.findUnique({
      where: { id: user.id },
    });

    expect(updated.tokenVersion).toBe(user.tokenVersion + 1);
    expect(await bcrypt.compare("NewPass123*", updated.passwordHash)).toBe(true);
  });

  it("logs out and increments token version", async () => {
    const user = await createUser();

    await authService.logout(user.id);

    const updated = await prisma.user.findUnique({
      where: { id: user.id },
    });

    expect(updated.tokenVersion).toBe(user.tokenVersion + 1);
  });

  it("forget password returns null for unknown email", async () => {
    await expect(authService.forgetPassword(uniqueEmail())).resolves.toBeNull();
  });

  it("forget password catches mail error and still succeeds", async () => {
    const user = await createUser();

    mailMocks.sendMail.mockRejectedValueOnce(new Error("smtp failed"));

    await expect(authService.forgetPassword(user.email)).resolves.toBeNull();

    const updated = await prisma.user.findUnique({
      where: { id: user.id },
    });

    expect(updated.passwordResetToken).toBeTruthy();
  });

  it("rejects new password with missing token or password", async () => {
    await expect(authService.newPassword("", "NewPass123*")).rejects.toMatchObject({
      statusCode: 400,
    });

    await expect(authService.newPassword("token", "")).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("rejects invalid reset token", async () => {
    await expect(authService.newPassword("invalid-reset-token", "NewPass123*")).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("rejects expired reset token", async () => {
    await createUser({
      passwordResetToken: "expired-reset-token",
      passwordResetExpires: new Date(Date.now() - 60_000),
    });

    await expect(authService.newPassword("expired-reset-token", "NewPass123*")).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("resets password with valid token", async () => {
    const user = await createUser({
      emailVerifiedAt: null,
      passwordResetToken: "valid-reset-token",
      passwordResetExpires: new Date(Date.now() + 60_000),
    });

    await authService.newPassword("valid-reset-token", "NewPass123*");

    const updated = await prisma.user.findUnique({
      where: { id: user.id },
    });

    expect(updated.passwordResetToken).toBeNull();
    expect(updated.emailVerifiedAt).toBeTruthy();
    expect(await bcrypt.compare("NewPass123*", updated.passwordHash)).toBe(true);
  });

  it("resend verification returns null for unknown or verified user", async () => {
    await expect(authService.resendVerificationEmail(uniqueEmail())).resolves.toBeNull();

    const verifiedUser = await createUser({
      emailVerifiedAt: new Date(),
    });

    await expect(authService.resendVerificationEmail(verifiedUser.email)).resolves.toBeNull();
  });

  it("resends verification email for unverified user", async () => {
    const user = await createUser({
      emailVerifiedAt: null,
    });

    await expect(authService.resendVerificationEmail(user.email)).resolves.toBeNull();

    const updated = await prisma.user.findUnique({
      where: { id: user.id },
    });

    expect(updated.emailVerificationToken).toBeTruthy();
    expect(mailMocks.sendMail).toHaveBeenCalled();
  });
});
