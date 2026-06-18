import * as roleService from "./role.service.js";

import { asyncHandler } from "../../../utils/asyncHandler.js";
import { successResponse } from "../../../utils/apiResponse.js";

// Tüm rolleri listeler.
export const listRoles = asyncHandler(async (req, res) => {
  const roles = await roleService.listRolesService();

  return successResponse(res, roles, "Roller getirildi.");
});

// Tek bir rol detayını getirir.
export const getRoleById = asyncHandler(async (req, res) => {
  const role = await roleService.getRoleByIdService(req.params.id);

  return successResponse(res, role, "Rol getirildi.");
});

// Yeni rol oluşturur.
export const createRole = asyncHandler(async (req, res) => {
  const role = await roleService.createRoleService(req.body);

  return successResponse(res, role, "Rol oluşturuldu.", 201);
});

// Rol bilgisini günceller.
export const updateRole = asyncHandler(async (req, res) => {
  const role = await roleService.updateRoleService(req.params.id, req.body);

  return successResponse(res, role, "Rol güncellendi.");
});

// Rol kaydını siler.
export const deleteRole = asyncHandler(async (req, res) => {
  const role = await roleService.deleteRoleService(req.params.id);

  return successResponse(res, role, "Rol silindi.");
});
