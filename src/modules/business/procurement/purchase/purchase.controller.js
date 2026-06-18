import * as purchaseService from "./purchase.service.js";

import { asyncHandler } from "../../../../utils/asyncHandler.js";
import { successResponse } from "../../../../utils/apiResponse.js";

export const listPurchases = asyncHandler(async (req, res) => {
  const purchases = await purchaseService.listPurchasesService(req.query);

  return successResponse(res, purchases, "Satınalma kayıtları getirildi.");
});

export const getPurchaseById = asyncHandler(async (req, res) => {
  const purchase = await purchaseService.getPurchaseByIdService(req.params.id);

  return successResponse(res, purchase, "Satınalma kaydı getirildi.");
});

export const createPurchase = asyncHandler(async (req, res) => {
  const purchase = await purchaseService.createPurchaseService(req.body, req.user?.id);

  return successResponse(res, purchase, "Satınalma kaydı oluşturuldu.", 201);
});

export const updatePurchase = asyncHandler(async (req, res) => {
  const purchase = await purchaseService.updatePurchaseService(req.params.id, req.body);

  return successResponse(res, purchase, "Satınalma kaydı güncellendi.");
});

export const deletePurchase = asyncHandler(async (req, res) => {
  const purchase = await purchaseService.deletePurchaseService(req.params.id);

  return successResponse(res, purchase, "Satınalma kaydı silindi.");
});
