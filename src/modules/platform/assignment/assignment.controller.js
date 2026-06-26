import * as service from "./assignment.service.js";

export async function listAssignments(req, res, next) {
  try {
    const data = await service.listAssignmentsService(req.query, req.user);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function createAssignment(req, res, next) {
  try {
    const data = await service.createAssignmentService(req.body, req.user);
    res.status(201).json({ success: true, message: "Atama oluşturuldu.", data });
  } catch (error) {
    next(error);
  }
}

export async function updateAssignment(req, res, next) {
  try {
    const data = await service.updateAssignmentService(req.params.id, req.body, req.user);
    res.json({ success: true, message: "Atama güncellendi.", data });
  } catch (error) {
    next(error);
  }
}

export async function deleteAssignment(req, res, next) {
  try {
    await service.deleteAssignmentService(req.params.id, req.user);
    res.json({ success: true, message: "Atama silindi.", data: null });
  } catch (error) {
    next(error);
  }
}
