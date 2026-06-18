import * as service from "./reading.service.js";

export async function listReadings(req, res, next) {
  try {
    const data = await service.listReadingsService(req.query);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function createReading(req, res, next) {
  try {
    const data = await service.createReadingService(req.body);

    res.status(201).json({
      success: true,
      message: "Sayaç okuması kaydedildi.",
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateReading(req, res, next) {
  try {
    const data = await service.updateReadingService(req.params.id, req.body);

    res.json({
      success: true,
      message: "Sayaç okuması güncellendi.",
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteReading(req, res, next) {
  try {
    await service.deleteReadingService(req.params.id);

    res.json({
      success: true,
      message: "Sayaç okuması silindi.",
      data: null,
    });
  } catch (error) {
    next(error);
  }
}
