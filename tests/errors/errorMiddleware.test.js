import { describe, it, expect, vi } from "vitest";

import { notFoundHandler, globalErrorHandler } from "../../src/middlewares/error.middleware.js";
import { AppError } from "../../src/utils/appError.js";

const createRes = () => {
  const res = {};
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  return res;
};

describe("error middleware", () => {
  it("returns 404 for not found", () => {
    const res = createRes();

    notFoundHandler({}, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "İstenen endpoint bulunamadı.",
      errors: null,
    });
  });

  it("handles AppError", async () => {
    const res = createRes();

    await globalErrorHandler(
      new AppError("Validation failed", 400, [{ field: "email" }]),
      {
        originalUrl: "/test",
        method: "GET",
        headers: {},
      },
      res,
      vi.fn(),
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Validation failed",
      errors: [{ field: "email" }],
    });
  });
});
