import * as service from "./document.service.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { successResponse } from "../../../utils/apiResponse.js";

export const uploadDocument = asyncHandler(async (req, res) => {
  const data = await service.uploadDocumentService({
    payload: req.body,
    file: req.file,
    userId: req.user?.id,
  });

  return successResponse(res, data, "Doküman yüklendi.", 201);
});

export const listDocuments = asyncHandler(async (req, res) => {
  const data = await service.listDocumentsService(req.query);

  return successResponse(res, data, "Dokümanlar getirildi.");
});

export const getDocumentById = asyncHandler(async (req, res) => {
  const data = await service.getDocumentByIdService(req.params.id);

  return successResponse(res, data, "Doküman getirildi.");
});

export const getDocumentDownloadUrl = asyncHandler(async (req, res) => {
  const data = await service.getDocumentDownloadUrlService(req.params.id);

  return successResponse(res, data, "Doküman indirme bağlantısı getirildi.");
});

export const deleteDocument = asyncHandler(async (req, res) => {
  const data = await service.deactivateDocumentService(req.params.id);

  return successResponse(res, data, "Doküman pasife alındı.");
});
