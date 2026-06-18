import * as userService from "./user.service.js";

import { asyncHandler } from "../../../utils/asyncHandler.js";
import { successResponse } from "../../../utils/apiResponse.js";

// Tüm kullanıcıları listeler.
export const getUsers = asyncHandler(async (req, res) => {
  const users = await userService.getUsers();

  return successResponse(res, users, "Kullanıcılar getirildi.");
});

// Onay bekleyen / pasif kullanıcıları listeler.
export const getPendingUsers = asyncHandler(async (req, res) => {
  const users = await userService.getPendingUsers();

  return successResponse(res, users, "Onay bekleyen kullanıcılar getirildi.");
});

// Kullanıcıyı aktif hale getirir.
export const activateUser = asyncHandler(async (req, res) => {
  const user = await userService.activateUser(req.params.id, req.user, req);

  return successResponse(res, user, "Kullanıcı aktif edildi.");
});

// Kullanıcının rolünü günceller.
export const updateUserRole = asyncHandler(async (req, res) => {
  const user = await userService.updateUserRole(req.params.id, req.body.roleId, req.user, req);

  return successResponse(res, user, "Kullanıcı rolü güncellendi.");
});

// Kullanıcının departmanını günceller.
export const updateUserDepartment = asyncHandler(async (req, res) => {
  const user = await userService.updateUserDepartment(req.params.id, req.body.departmentId, req.user, req);

  return successResponse(res, user, "Kullanıcı departmanı güncellendi.");
});

// Kullanıcıyı pasif hale getirir.
export const deactivateUser = asyncHandler(async (req, res) => {
  const user = await userService.deactivateUser(req.params.id, req.user, req);

  return successResponse(res, user, "Kullanıcı pasif edildi.");
});

// Kullanıcının mevcut oturumlarını geçersiz kılar.
export const forceLogoutUser = asyncHandler(async (req, res) => {
  const user = await userService.forceLogoutUser(req.params.id, req.user, req);

  return successResponse(res, user, "Kullanıcı oturumu sonlandırıldı.");
});

// Kullanıcı kendi profil bilgisini günceller.
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(req.user.id, req.body);

  return successResponse(res, user, "Profil güncellendi.");
});

// Kullanıcı profil fotoğrafı yükler.
export const uploadProfilePhoto = asyncHandler(async (req, res) => {
  const user = await userService.uploadProfilePhoto(req.user.id, req.file);

  return successResponse(res, user, "Profil fotoğrafı yüklendi.");
});

// Kullanıcı profil fotoğrafını kaldırır.
export const removeProfilePhoto = asyncHandler(async (req, res) => {
  const user = await userService.removeProfilePhoto(req.user.id);

  return successResponse(res, user, "Profil fotoğrafı kaldırıldı.");
});
