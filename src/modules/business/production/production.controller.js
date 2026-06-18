import * as productionService from "./production.service.js";

function getUserId(req) {
  return req.user?.id || null;
}

export async function listWeek(req, res, next) {
  try {
    const result = await productionService.listWeekService({
      year: Number(req.query.year),
      week: Number(req.query.week),
    });

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function createRawMaterialOrigin(req, res, next) {
  try {
    const result = await productionService.createRawMaterialOriginService(req.body);

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function createPlan(req, res, next) {
  try {
    await productionService.createPlanService(req.body, getUserId(req));

    res.status(201).json({
      success: true,
      message: "Üretim planı oluşturuldu.",
    });
  } catch (error) {
    next(error);
  }
}

export async function updatePlan(req, res, next) {
  try {
    const result = await productionService.updatePlanService(req.params.id, req.body, getUserId(req));

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function finishProduction(req, res, next) {
  try {
    const result = await productionService.finishProductionService(req.params.id, req.body, getUserId(req));

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function cancelProduction(req, res, next) {
  try {
    const result = await productionService.cancelProductionService(req.params.id, req.body, getUserId(req));

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function saveDelay(req, res, next) {
  try {
    const result = await productionService.saveDelayService(req.body, getUserId(req));

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function addBatch(req, res, next) {
  try {
    const result = await productionService.addBatchService(req.body, getUserId(req));

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteJob(req, res, next) {
  try {
    const result = await productionService.deleteJobService(req.params.id);

    res.json(result);
  } catch (error) {
    next(error);
  }
}
