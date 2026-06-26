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

const testUser = {
  id: "creator1",
};

beforeEach(async () => {
  vi.resetModules();
  vi.clearAllMocks();

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

    await controller.listAssignments({ query: { module: "SYSTEM" }, user: testUser }, res, next);

    expect(mocks.listAssignmentsService).toHaveBeenCalledWith({ module: "SYSTEM" }, testUser);
    expect(res.json).toHaveBeenCalledWith({ success: true, data: [{ id: "as1" }] });
  });

  it("creates assignment", async () => {
    const res = createRes();
    const next = vi.fn();

    mocks.createAssignmentService.mockResolvedValue({ id: "as1" });

    await controller.createAssignment({ body: { userId: "user1" }, user: testUser }, res, next);

    expect(mocks.createAssignmentService).toHaveBeenCalledWith({ userId: "user1" }, testUser);
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

    await controller.updateAssignment({ params: { id: "as1" }, body: { role: "RESPONSIBLE" }, user: testUser }, res, next);

    expect(mocks.updateAssignmentService).toHaveBeenCalledWith("as1", { role: "RESPONSIBLE" }, testUser);
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

    await controller.deleteAssignment({ params: { id: "as1" }, user: testUser }, res, next);

    expect(mocks.deleteAssignmentService).toHaveBeenCalledWith("as1", testUser);
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
  it("passes create errors to next", async () => {
    const res = createRes();
    const next = vi.fn();
    const error = new Error("create failed");

    mocks.createAssignmentService.mockRejectedValue(error);

    await controller.createAssignment({ body: {}, user: testUser }, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it("passes update errors to next", async () => {
    const res = createRes();
    const next = vi.fn();
    const error = new Error("update failed");

    mocks.updateAssignmentService.mockRejectedValue(error);

    await controller.updateAssignment({ params: { id: "as1" }, body: {}, user: testUser }, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it("passes delete errors to next", async () => {
    const res = createRes();
    const next = vi.fn();
    const error = new Error("delete failed");

    mocks.deleteAssignmentService.mockRejectedValue(error);

    await controller.deleteAssignment({ params: { id: "as1" }, user: testUser }, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
