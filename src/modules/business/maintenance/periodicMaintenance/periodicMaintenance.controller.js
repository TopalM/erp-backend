import {
  addPeriodicMaintenanceStatus,
  createPeriodicMaintenance,
  deletePeriodicMaintenance,
  getAllPeriodicMaintenances,
  getAllPeriodicMaintenancesForFault,
  updatePeriodicMaintenance,
} from "./periodicMaintenance.service.js";

import {
  createPeriodicMaintenanceSchema,
  deletePeriodicMaintenanceSchema,
  statusPeriodicMaintenanceSchema,
  updatePeriodicMaintenanceSchema,
} from "./periodicMaintenance.validation.js";

const parseBody = (req) => {
  if (req.body?.periodicMaintenanceData) {
    return JSON.parse(req.body.periodicMaintenanceData);
  }

  return req.body;
};

const sendError = (res, error) => {
  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Sunucu hatası.",
  });
};

export const getAllPeriodicMaintenancesController = async (req, res) => {
  try {
    const data = await getAllPeriodicMaintenances();

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

export const getAllPeriodicMaintenancesForFaultController = async (req, res) => {
  try {
    const data = await getAllPeriodicMaintenancesForFault();

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

export const createPeriodicMaintenanceController = async (req, res) => {
  try {
    const payload = createPeriodicMaintenanceSchema.parse(parseBody(req));
    const data = await createPeriodicMaintenance(payload, req.file);

    return res.status(201).json({
      success: true,
      message: "Periodik bakım kaydı oluşturuldu.",
      data,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

export const updatePeriodicMaintenanceController = async (req, res) => {
  try {
    const payload = updatePeriodicMaintenanceSchema.parse(parseBody(req));
    const data = await updatePeriodicMaintenance(payload, req.file);

    return res.json({
      success: true,
      message: "Periodik bakım kaydı güncellendi.",
      data,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

export const deletePeriodicMaintenanceController = async (req, res) => {
  try {
    const payload = deletePeriodicMaintenanceSchema.parse(req.body?.id ? req.body : req.params);

    const data = await deletePeriodicMaintenance(payload);

    return res.json({
      success: true,
      message: "Periodik bakım kaydı silindi.",
      data,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

export const updatePeriodicMaintenanceStatusController = async (req, res) => {
  try {
    const payload = statusPeriodicMaintenanceSchema.parse(req.body);
    const data = await addPeriodicMaintenanceStatus(payload);

    return res.json({
      success: true,
      message: "Periodik bakım durumu güncellendi.",
      data,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

export const getPeriodicMaintenanceDownloadController = async (req, res) => {
  try {
    const { filePath } = req.query;

    if (!filePath) {
      return res.status(400).json({
        success: false,
        message: "Dosya yolu zorunludur.",
      });
    }

    return res.json({
      success: true,
      url: filePath,
    });
  } catch (error) {
    return sendError(res, error);
  }
};
