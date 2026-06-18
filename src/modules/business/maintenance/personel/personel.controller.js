import { createPersonelService, listPersonelsService, updatePersonelService } from "./personel.service.js";

export async function listPersonelsController(req, res, next) {
  try {
    const data = await listPersonelsService();

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function createPersonelController(req, res, next) {
  try {
    const data = await createPersonelService(req.body);

    res.json({
      success: true,
      message: "Personel kaydı oluşturuldu.",
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function updatePersonelController(req, res, next) {
  try {
    const data = await updatePersonelService(req.params.id || req.body.id, req.body);

    res.json({
      success: true,
      message: "Personel kaydı güncellendi.",
      data,
    });
  } catch (error) {
    next(error);
  }
}
