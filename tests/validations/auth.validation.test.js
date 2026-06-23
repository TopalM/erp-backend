import { describe, it, expect } from "vitest";

import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  forgetPasswordSchema,
  newPasswordSchema,
  resendVerificationEmailSchema,
} from "../../src/modules/auth/auth/auth.validation.js";

describe("auth validation schemas", () => {
  it("accepts valid register payload", () => {
    const result = registerSchema.safeParse({
      firstName: "Mustafa",
      lastName: "Topal",
      email: "mustafa.test@plastifay.com.tr",
      password: "Test123*",
    });

    expect(result.success).toBe(true);
  });

  it("rejects non-Plastifay register email", () => {
    const result = registerSchema.safeParse({
      firstName: "Mustafa",
      lastName: "Topal",
      email: "mustafa@example.com",
      password: "Test123*",
    });

    expect(result.success).toBe(false);
  });

  it("rejects weak password", () => {
    const result = registerSchema.safeParse({
      firstName: "Mustafa",
      lastName: "Topal",
      email: "mustafa.test@plastifay.com.tr",
      password: "12345678",
    });

    expect(result.success).toBe(false);
  });

  it("normalizes login email", () => {
    const result = loginSchema.safeParse({
      email: "  MUSTAFA.TEST@PLASTIFAY.COM.TR ",
      password: "Test123*",
    });

    expect(result.success).toBe(true);
    expect(result.data.email).toBe("mustafa.test@plastifay.com.tr");
  });

  it("accepts password flow schemas", () => {
    expect(
      changePasswordSchema.safeParse({
        currentPassword: "OldTest123*",
        newPassword: "NewTest123*",
      }).success,
    ).toBe(true);

    expect(
      forgetPasswordSchema.safeParse({
        email: "mustafa.test@plastifay.com.tr",
      }).success,
    ).toBe(true);

    expect(
      newPasswordSchema.safeParse({
        token: "token",
        password: "NewTest123*",
      }).success,
    ).toBe(true);

    expect(
      resendVerificationEmailSchema.safeParse({
        email: "mustafa.test@plastifay.com.tr",
      }).success,
    ).toBe(true);
  });
});
