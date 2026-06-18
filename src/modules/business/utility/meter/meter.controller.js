import * as service from "./meter.service.js";

export async function listMeters(req, res, next) {
  try {
    const data = await service.listMetersService();

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function getMeterById(req, res, next) {
  try {
    const data = await service.getMeterByIdService(req.params.id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Sayaç bulunamadı.",
      });
    }

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}
