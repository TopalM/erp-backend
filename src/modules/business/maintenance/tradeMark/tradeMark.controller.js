import { createTradeMarkService, deleteTradeMarkService, listTradeMarksService, updateTradeMarkService } from "./tradeMark.service.js";

export async function listTradeMarksController(req, res, next) {
  try {
    const data = await listTradeMarksService();

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function createTradeMarkController(req, res, next) {
  try {
    const data = await createTradeMarkService(req.body);

    res.status(201).json({
      success: true,
      message: "Marka kaydı oluşturuldu.",
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateTradeMarkController(req, res, next) {
  try {
    const data = await updateTradeMarkService(req.body.id, req.body);

    res.json({
      success: true,
      message: "Marka kaydı güncellendi.",
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteTradeMarkController(req, res, next) {
  try {
    const result = await deleteTradeMarkService(req.params.id || req.body.id);

    res.json(result);
  } catch (error) {
    next(error);
  }
}
