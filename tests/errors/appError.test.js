import { describe, it, expect } from "vitest";

import { AppError } from "../../src/utils/appError.js";

describe("AppError", () => {
  it("creates operational error", () => {
    const error = new AppError("Test error", 400, [{ field: "name" }]);

    expect(error.message).toBe("Test error");
    expect(error.statusCode).toBe(400);
    expect(error.errors).toEqual([{ field: "name" }]);
    expect(error.isOperational).toBe(true);
  });

  it("defaults statusCode to 500", () => {
    const error = new AppError("Server error");

    expect(error.statusCode).toBe(500);
  });
});
