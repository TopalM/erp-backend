import { describe, it, expect } from "vitest";

import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  forgetPasswordSchema,
  newPasswordSchema,
  resendVerificationEmailSchema,
} from "../../src/modules/auth/auth/auth.validation.js";

const strongPassword = "Mustafa123*";

describe("auth.validation coverage", () => {
  it("normalizes email by trimming and lowercasing", () => {
    const result = loginSchema.parse({
      email: "  MUSTAFA.TOPAL@PLASTIFAY.COM.TR  ",
      password: "x",
    });

    expect(result.email).toBe("mustafa.topal@plastifay.com.tr");
  });

  it("rejects non-string email input", () => {
    const result = loginSchema.safeParse({
      email: 123,
      password: "x",
    });

    expect(result.success).toBe(false);
  });

  it("rejects missing email", () => {
    const result = forgetPasswordSchema.safeParse({});

    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toBe("E-posta adresi zorunludur.");
  });

  it("rejects invalid email format", () => {
    const result = forgetPasswordSchema.safeParse({
      email: "not-an-email",
    });

    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toBe("Geçerli bir e-posta adresi giriniz.");
  });

  it("rejects non-plastifay email on register", () => {
    const result = registerSchema.safeParse({
      firstName: "Mustafa",
      lastName: "Topal",
      email: "mustafa@example.com",
      password: strongPassword,
    });

    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toBe("Sadece @plastifay.com.tr uzantılı e-posta adresleri kullanılabilir.");
  });

  it("accepts valid register payload", () => {
    const result = registerSchema.parse({
      firstName: " Mustafa ",
      lastName: " Topal ",
      email: " MUSTAFA.TOPAL@PLASTIFAY.COM.TR ",
      password: strongPassword,
    });

    expect(result).toEqual({
      firstName: "Mustafa",
      lastName: "Topal",
      email: "mustafa.topal@plastifay.com.tr",
      password: strongPassword,
    });
  });

  it("rejects weak register password", () => {
    const result = registerSchema.safeParse({
      firstName: "Mustafa",
      lastName: "Topal",
      email: "mustafa.topal@plastifay.com.tr",
      password: "weakpass",
    });

    expect(result.success).toBe(false);
    expect(result.error.issues.some((issue) => issue.message.includes("özel karakter"))).toBe(true);
  });

  it("rejects short firstName and lastName", () => {
    const result = registerSchema.safeParse({
      firstName: "M",
      lastName: "T",
      email: "mustafa.topal@plastifay.com.tr",
      password: strongPassword,
    });

    expect(result.success).toBe(false);
    expect(result.error.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ message: "Ad en az 2 karakter olmalıdır." }),
        expect.objectContaining({ message: "Soyad en az 2 karakter olmalıdır." }),
      ]),
    );
  });

  it("validates change password strong new password", () => {
    const result = changePasswordSchema.parse({
      currentPassword: "old-password",
      newPassword: strongPassword,
    });

    expect(result.newPassword).toBe(strongPassword);
  });

  it("rejects empty current password", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "",
      newPassword: strongPassword,
    });

    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toBe("Mevcut şifre zorunludur.");
  });

  it("rejects reset password without token", () => {
    const result = newPasswordSchema.safeParse({
      token: "",
      password: strongPassword,
    });

    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toBe("Token zorunludur.");
  });

  it("accepts resend verification email payload", () => {
    const result = resendVerificationEmailSchema.parse({
      email: " MUSTAFA.TOPAL@PLASTIFAY.COM.TR ",
    });

    expect(result.email).toBe("mustafa.topal@plastifay.com.tr");
  });
});
