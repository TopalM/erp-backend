import * as service from "./approval.service.js";

export async function listApprovals(req, res, next) {
  try {
    const data = await service.listApprovalsService(req.query, req.user);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function submitApproval(req, res, next) {
  try {
    const data = await service.submitApprovalService(req.body, req.user?.id);
    res.status(201).json({ success: true, message: "Onaya gönderildi.", data });
  } catch (error) {
    next(error);
  }
}

export async function approveApproval(req, res, next) {
  try {
    const data = await service.approveApprovalService(req.params.id, req.body, req.user);
    res.json({ success: true, message: "Kayıt onaylandı.", data });
  } catch (error) {
    next(error);
  }
}

export async function rejectApproval(req, res, next) {
  try {
    const data = await service.rejectApprovalService(req.params.id, req.body, req.user);
    res.json({ success: true, message: "Kayıt reddedildi.", data });
  } catch (error) {
    next(error);
  }
}

export async function cancelApproval(req, res, next) {
  try {
    const data = await service.cancelApprovalService(req.params.id, req.user);
    res.json({ success: true, message: "Onay süreci iptal edildi.", data });
  } catch (error) {
    next(error);
  }
}
