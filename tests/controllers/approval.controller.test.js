import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mocks = {
  listApprovalsService: vi.fn(),
  submitApprovalService: vi.fn(),
  approveApprovalService: vi.fn(),
  rejectApprovalService: vi.fn(),
  cancelApprovalService: vi.fn(),
};

let controller;

const createRes = () => {
  const res = {};
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  return res;
};

const testUser = {
  id: "user1",
};

beforeEach(async () => {
  vi.resetModules();
  vi.clearAllMocks();

  vi.doMock("../../src/modules/platform/approval/approval.service.js", () => mocks);

  controller = await import("../../src/modules/platform/approval/approval.controller.js");
});

afterEach(() => {
  vi.doUnmock("../../src/modules/platform/approval/approval.service.js");
  vi.resetModules();
  vi.clearAllMocks();
});

describe("approval.controller", () => {
  it("lists approvals", async () => {
    const res = createRes();
    const next = vi.fn();

    mocks.listApprovalsService.mockResolvedValue([{ id: "a1" }]);

    await controller.listApprovals({ query: { status: "PENDING" } }, res, next);

    expect(mocks.listApprovalsService).toHaveBeenCalledWith({ status: "PENDING" }, undefined);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: [{ id: "a1" }],
    });
  });

  it("submits approval", async () => {
    const res = createRes();
    const next = vi.fn();

    mocks.submitApprovalService.mockResolvedValue({ id: "a1", status: "PENDING" });

    await controller.submitApproval(
      {
        body: { module: "SYSTEM" },
        user: testUser,
      },
      res,
      next,
    );

    expect(mocks.submitApprovalService).toHaveBeenCalledWith({ module: "SYSTEM" }, "user1");
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Onaya gönderildi.",
      data: { id: "a1", status: "PENDING" },
    });
  });

  it("approves approval", async () => {
    const res = createRes();
    const next = vi.fn();

    mocks.approveApprovalService.mockResolvedValue({ id: "a1", status: "APPROVED" });

    await controller.approveApproval(
      {
        params: { id: "a1" },
        body: { decisionNote: "ok" },
        user: testUser,
      },
      res,
      next,
    );

    expect(mocks.approveApprovalService).toHaveBeenCalledWith("a1", { decisionNote: "ok" }, testUser);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Kayıt onaylandı.",
      data: { id: "a1", status: "APPROVED" },
    });
  });

  it("rejects approval", async () => {
    const res = createRes();
    const next = vi.fn();

    mocks.rejectApprovalService.mockResolvedValue({ id: "a1", status: "REJECTED" });

    await controller.rejectApproval(
      {
        params: { id: "a1" },
        body: { rejectReason: "bad" },
        user: testUser,
      },
      res,
      next,
    );

    expect(mocks.rejectApprovalService).toHaveBeenCalledWith("a1", { rejectReason: "bad" }, testUser);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Kayıt reddedildi.",
      data: { id: "a1", status: "REJECTED" },
    });
  });

  it("cancels approval", async () => {
    const res = createRes();
    const next = vi.fn();

    mocks.cancelApprovalService.mockResolvedValue({ id: "a1", status: "CANCELLED" });

    await controller.cancelApproval(
      {
        params: { id: "a1" },
        user: testUser,
      },
      res,
      next,
    );

    expect(mocks.cancelApprovalService).toHaveBeenCalledWith("a1", testUser);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Onay süreci iptal edildi.",
      data: { id: "a1", status: "CANCELLED" },
    });
  });

  it("passes errors to next", async () => {
    const res = createRes();
    const next = vi.fn();
    const error = new Error("approval failed");

    mocks.listApprovalsService.mockRejectedValue(error);

    await controller.listApprovals({ query: {} }, res, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(res.json).not.toHaveBeenCalled();
  });
  it("passes submit errors to next", async () => {
    const res = createRes();
    const next = vi.fn();
    const error = new Error("submit failed");

    mocks.submitApprovalService.mockRejectedValue(error);

    await controller.submitApproval({ body: {}, user: testUser }, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it("passes approve errors to next", async () => {
    const res = createRes();
    const next = vi.fn();
    const error = new Error("approve failed");

    mocks.approveApprovalService.mockRejectedValue(error);

    await controller.approveApproval({ params: { id: "a1" }, body: {}, user: testUser }, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it("passes reject errors to next", async () => {
    const res = createRes();
    const next = vi.fn();
    const error = new Error("reject failed");

    mocks.rejectApprovalService.mockRejectedValue(error);

    await controller.rejectApproval({ params: { id: "a1" }, body: {}, user: testUser }, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it("passes cancel errors to next", async () => {
    const res = createRes();
    const next = vi.fn();
    const error = new Error("cancel failed");

    mocks.cancelApprovalService.mockRejectedValue(error);

    await controller.cancelApproval({ params: { id: "a1" }, user: testUser }, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
