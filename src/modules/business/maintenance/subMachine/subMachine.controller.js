import { createSubMachineService, listSubMachinesService, updateSubMachineService } from "./subMachine.service.js";

export async function listSubMachinesController(req, res, next) {
  try {
    const data = await listSubMachinesService();

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function createSubMachineController(req, res, next) {
  try {
    const data = await createSubMachineService(req.body);

    res.status(201).json({
      success: true,
      message: "Alt makina kaydı oluşturuldu.",
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateSubMachineController(req, res, next) {
  try {
    const data = await updateSubMachineService(req.body.id, req.body);

    res.json({
      success: true,
      message: "Alt makina kaydı güncellendi.",
      data,
    });
  } catch (error) {
    next(error);
  }
}
