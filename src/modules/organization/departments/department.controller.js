import * as departmentService from "./department.service.js";

import { asyncHandler } from "../../../utils/asyncHandler.js";
import { successResponse } from "../../../utils/apiResponse.js";

// Tüm departmanları listeler.
export const listDepartments = asyncHandler(async (req, res) => {
  const departments = await departmentService.listDepartmentsService();

  return successResponse(res, departments, "Departmanlar getirildi.");
});

// Tek bir departman detayını getirir.
export const getDepartmentById = asyncHandler(async (req, res) => {
  const department = await departmentService.getDepartmentByIdService(req.params.id);

  return successResponse(res, department, "Departman getirildi.");
});

// Yeni departman oluşturur.
export const createDepartment = asyncHandler(async (req, res) => {
  const department = await departmentService.createDepartmentService(req.body);

  return successResponse(res, department, "Departman oluşturuldu.", 201);
});

// Departmanı günceller.
export const updateDepartment = asyncHandler(async (req, res) => {
  const department = await departmentService.updateDepartmentService(req.params.id, req.body);

  return successResponse(res, department, "Departman güncellendi.");
});

// Departmanı siler.
export const deleteDepartment = asyncHandler(async (req, res) => {
  const department = await departmentService.deleteDepartmentService(req.params.id);

  return successResponse(res, department, "Departman silindi.");
});
