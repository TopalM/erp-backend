import * as service from "./document.service.js";

export async function uploadDocument(req, res, next) {
  try {
    const data = await service.uploadDocumentService({
      payload: req.body,
      file: req.file,
      userId: req.user?.id,
    });

    res.status(201).json({
      success: true,
      message: "Doküman yüklendi.",
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function listDocuments(req, res, next) {
  try {
    const data = await service.listDocumentsService(req.query);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function getDocumentById(req, res, next) {
  try {
    const data = await service.getDocumentByIdService(req.params.id);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function getDocumentDownloadUrl(req, res, next) {
  try {
    const data = await service.getDocumentDownloadUrlService(req.params.id);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteDocument(req, res, next) {
  try {
    const data = await service.deactivateDocumentService(req.params.id);

    res.json({
      success: true,
      message: "Doküman pasife alındı.",
      data,
    });
  } catch (error) {
    next(error);
  }
}
