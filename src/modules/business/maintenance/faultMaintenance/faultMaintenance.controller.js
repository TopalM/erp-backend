import {
  createFaultMaintenance,
  deleteFaultMaintenance,
  getAllFaultMaintenances,
  requestFaultMaintenance,
  updateFaultMaintenance,
  updateFaultMaintenanceStatus,
} from "./faultMaintenance.service.js";

import {
  createFaultMaintenanceSchema,
  deleteFaultMaintenanceSchema,
  requestFaultMaintenanceSchema,
  statusFaultMaintenanceSchema,
  updateFaultMaintenanceSchema,
} from "./faultMaintenance.validation.js";

const sendError = (res, error) => {
  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Sunucu hatası.",
  });
};

export const getAllFaultMaintenancesController = async (req, res) => {
  try {
    const data = await getAllFaultMaintenances();

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

export const createFaultMaintenanceController = async (req, res) => {
  try {
    const payload = createFaultMaintenanceSchema.parse(req.body);
    const data = await createFaultMaintenance(payload, req.user);

    return res.status(201).json({
      success: true,
      message: "Arıza bakım kaydı oluşturuldu.",
      data,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

export const updateFaultMaintenanceController = async (req, res) => {
  try {
    const payload = updateFaultMaintenanceSchema.parse(req.body);
    const data = await updateFaultMaintenance(payload, req.user);

    return res.json({
      success: true,
      message: "Arıza bakım kaydı güncellendi.",
      data,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

export const deleteFaultMaintenanceController = async (req, res) => {
  try {
    const payload = deleteFaultMaintenanceSchema.parse(req.body?.id ? req.body : req.params);

    const data = await deleteFaultMaintenance(payload);

    return res.json({
      success: true,
      message: "Arıza bakım kaydı silindi.",
      data,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

export const requestFaultMaintenanceController = async (req, res) => {
  try {
    const payload = requestFaultMaintenanceSchema.parse(req.body?.id ? req.body : req.params);

    const data = await requestFaultMaintenance(payload, req.user);

    return res.json({
      success: true,
      message: "Arıza bakım talebi gönderildi.",
      data,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

export const updateFaultMaintenanceStatusController = async (req, res) => {
  try {
    const payload = statusFaultMaintenanceSchema.parse(req.body);
    const data = await updateFaultMaintenanceStatus(payload, req.user);

    return res.json({
      success: true,
      message: "Arıza bakım durumu güncellendi.",
      data,
    });
  } catch (error) {
    return sendError(res, error);
  }
};
