import { createEndexService, deleteEndexService, listEndexService, updateEndexService } from "./endex.service.js";

export async function listEndexController(req, res, next) {
  try {
    const data = await listEndexService();

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function createEndexController(req, res, next) {
  try {
    const data = await createEndexService(req.body);

    res.json({
      success: true,
      message: "Endeks kaydı oluşturuldu.",
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateEndexController(req, res, next) {
  try {
    const data = await updateEndexService(req.params.id || req.body.id, req.body);

    res.json({
      success: true,
      message: "Endeks kaydı güncellendi.",
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteEndexController(req, res, next) {
  try {
    const data = await deleteEndexService(req.params.id || req.body.id);

    res.json({
      success: true,
      message: "Endeks kaydı silindi.",
      data,
    });
  } catch (error) {
    next(error);
  }
}
