import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mocks = {
  listAssignmentsService: vi.fn(),
  createAssignmentService: vi.fn(),
  updateAssignmentService: vi.fn(),
  deleteAssignmentService: vi.fn(),
};

let controller;

const createRes = () => {
  const res = {};
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  return res;
};

beforeEach(async () => {
  vi.resetModules();
  vi.clearAllMocks();

  mocks.listAssignmentsService.mockReset();
  mocks.createAssignmentService.mockReset();
  mocks.updateAssignmentService.mockReset();
  mocks.deleteAssignmentService.mockReset();

  vi.doMock("../../src/modules/platform/assignment/assignment.service.js", () => mocks);

  controller = await import("../../src/modules/platform/assignment/assignment.controller.js");
});

afterEach(() => {
  vi.doUnmock("../../src/modules/platform/assignment/assignment.service.js");
  vi.resetModules();
  vi.clearAllMocks();
});

describe("assignment.controller", () => {
  it("lists assignments", async () => {
    const res = createRes();
    const next = vi.fn();

    mocks.listAssignmentsService.mockResolvedValue([{ id: "as1" }]);

    await controller.listAssignments({ query: { module: "SYSTEM" } }, res, next);

    expect(mocks.listAssignmentsService).toHaveBeenCalledWith({ module: "SYSTEM" });
    expect(res.json).toHaveBeenCalledWith({ success: true, data: [{ id: "as1" }] });
  });

  it("creates assignment", async () => {
    const res = createRes();
    const next = vi.fn();

    mocks.createAssignmentService.mockResolvedValue({ id: "as1" });

    await controller.createAssignment({ body: { userId: "user1" }, user: { id: "creator1" } }, res, next);

    expect(mocks.createAssignmentService).toHaveBeenCalledWith({ userId: "user1" }, "creator1");
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Atama oluşturuldu.",
      data: { id: "as1" },
    });
  });

  it("updates assignment", async () => {
    const res = createRes();
    const next = vi.fn();

    mocks.updateAssignmentService.mockResolvedValue({ id: "as1" });

    await controller.updateAssignment({ params: { id: "as1" }, body: { role: "RESPONSIBLE" } }, res, next);

    expect(mocks.updateAssignmentService).toHaveBeenCalledWith("as1", { role: "RESPONSIBLE" });
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Atama güncellendi.",
      data: { id: "as1" },
    });
  });

  it("deletes assignment", async () => {
    const res = createRes();
    const next = vi.fn();

    mocks.deleteAssignmentService.mockResolvedValue(null);

    await controller.deleteAssignment({ params: { id: "as1" } }, res, next);

    expect(mocks.deleteAssignmentService).toHaveBeenCalledWith("as1");
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Atama silindi.",
      data: null,
    });
  });

  it("passes errors to next", async () => {
    const res = createRes();
    const next = vi.fn();
    const error = new Error("assignment failed");

    mocks.listAssignmentsService.mockRejectedValue(error);

    await controller.listAssignments({ query: {} }, res, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(res.json).not.toHaveBeenCalled();
  });
});
