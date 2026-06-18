import * as permissionService from "./permission.service.js";

import { asyncHandler } from "../../../utils/asyncHandler.js";
import { successResponse } from "../../../utils/apiResponse.js";

// Tüm yetkileri listeler.
export const getPermissions = asyncHandler(async (req, res) => {
  const permissions = await permissionService.getPermissions();

  return successResponse(res, permissions, "Yetkiler getirildi.");
});

// Tek bir yetki detayını getirir.
export const getPermissionById = asyncHandler(async (req, res) => {
  const permission = await permissionService.getPermissionById(req.params.id);

  return successResponse(res, permission, "Yetki getirildi.");
});

// Yeni yetki oluşturur.
export const createPermission = asyncHandler(async (req, res) => {
  const permission = await permissionService.createPermission(req.body);

  return successResponse(res, permission, "Yetki oluşturuldu.", 201);
});

// Yetki bilgisini günceller.
export const updatePermission = asyncHandler(async (req, res) => {
  const permission = await permissionService.updatePermission(req.params.id, req.body);

  return successResponse(res, permission, "Yetki güncellendi.");
});

// Yetkiyi siler.
export const deletePermission = asyncHandler(async (req, res) => {
  const permission = await permissionService.deletePermission(req.params.id);

  return successResponse(res, permission, "Yetki silindi.");
});

// Kullanıcının özel yetkilerini getirir.
export const getUserPermissions = asyncHandler(async (req, res) => {
  const permissions = await permissionService.getUserPermissions(req.params.userId);

  return successResponse(res, permissions, "Kullanıcı yetkileri getirildi.");
});

// Kullanıcının özel yetkilerini günceller.
export const updateUserPermissions = asyncHandler(async (req, res) => {
  const permissions = await permissionService.updateUserPermissions(req.params.userId, req.body.permissions);

  return successResponse(res, permissions, "Kullanıcı yetkileri güncellendi.");
});
