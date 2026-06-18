import { createMainMachineService, listMainMachinesService, updateMainMachineService } from "./mainMachine.service.js";

export async function listMainMachinesController(req, res, next) {
  try {
    const data = await listMainMachinesService();

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function createMainMachineController(req, res, next) {
  try {
    const data = await createMainMachineService(req.body);

    res.status(201).json({
      success: true,
      message: "Ana makina kaydı oluşturuldu.",
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateMainMachineController(req, res, next) {
  try {
    const data = await updateMainMachineService(req.body.id, req.body);

    res.json({
      success: true,
      message: "Ana makina kaydı güncellendi.",
      data,
    });
  } catch (error) {
    next(error);
  }
}
