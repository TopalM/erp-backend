import * as service from "./assignment.service.js";

export async function listAssignments(req, res, next) {
  try {
    const data = await service.listAssignmentsService(req.query);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function createAssignment(req, res, next) {
  try {
    const data = await service.createAssignmentService(req.body, req.user?.id);
    res.status(201).json({ success: true, message: "Atama oluşturuldu.", data });
  } catch (error) {
    next(error);
  }
}

export async function updateAssignment(req, res, next) {
  try {
    const data = await service.updateAssignmentService(req.params.id, req.body);
    res.json({ success: true, message: "Atama güncellendi.", data });
  } catch (error) {
    next(error);
  }
}

export async function deleteAssignment(req, res, next) {
  try {
    await service.deleteAssignmentService(req.params.id);
    res.json({ success: true, message: "Atama silindi.", data: null });
  } catch (error) {
    next(error);
  }
}
