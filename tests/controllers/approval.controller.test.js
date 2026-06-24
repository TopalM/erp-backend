import { describe, it, expect, vi, beforeEach } from "vitest";

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

beforeEach(async () => {
  vi.resetModules();
  vi.clearAllMocks();

  vi.doMock("../../src/modules/platform/approval/approval.service.js", () => mocks);

  controller = await import("../../src/modules/platform/approval/approval.controller.js");
});

describe("approval.controller", () => {
  it("lists approvals", async () => {
    const res = createRes();
    const next = vi.fn();

    mocks.listApprovalsService.mockResolvedValue([{ id: "a1" }]);

    await controller.listApprovals({ query: { status: "PENDING" } }, res, next);

    expect(mocks.listApprovalsService).toHaveBeenCalledWith({ status: "PENDING" });
    expect(res.json).toHaveBeenCalledWith({ success: true, data: [{ id: "a1" }] });
  });

  it("submits approval", async () => {
    const res = createRes();
    const next = vi.fn();

    mocks.submitApprovalService.mockResolvedValue({ id: "a1" });

    await controller.submitApproval({ body: { module: "SYSTEM" }, user: { id: "user1" } }, res, next);

    expect(mocks.submitApprovalService).toHaveBeenCalledWith({ module: "SYSTEM" }, "user1");
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("approves approval", async () => {
    const res = createRes();
    const next = vi.fn();

    mocks.approveApprovalService.mockResolvedValue({ id: "a1" });

    await controller.approveApproval({ params: { id: "a1" }, body: { decisionNote: "ok" }, user: { id: "user1" } }, res, next);

    expect(mocks.approveApprovalService).toHaveBeenCalledWith("a1", { decisionNote: "ok" }, "user1");
  });

  it("rejects approval", async () => {
    const res = createRes();
    const next = vi.fn();

    mocks.rejectApprovalService.mockResolvedValue({ id: "a1" });

    await controller.rejectApproval({ params: { id: "a1" }, body: { rejectReason: "bad" }, user: { id: "user1" } }, res, next);

    expect(mocks.rejectApprovalService).toHaveBeenCalledWith("a1", { rejectReason: "bad" }, "user1");
  });

  it("cancels approval", async () => {
    const res = createRes();
    const next = vi.fn();

    mocks.cancelApprovalService.mockResolvedValue({ id: "a1" });

    await controller.cancelApproval({ params: { id: "a1" } }, res, next);

    expect(mocks.cancelApprovalService).toHaveBeenCalledWith("a1");
  });

  it("passes errors to next", async () => {
    const res = createRes();
    const next = vi.fn();
    const error = new Error("approval failed");

    mocks.listApprovalsService.mockRejectedValue(error);

    await controller.listApprovals({ query: {} }, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
