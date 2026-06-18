import * as service from "./rawMaterialPurchase.service.js";

export async function getDashboard(req, res, next) {
  try {
    const data = await service.getDashboardService();
    res.json(data);
  } catch (error) {
    next(error);
  }
}

export async function listRawMaterialSuppliers(req, res, next) {
  try {
    const data = await service.listRawMaterialSuppliersService();
    res.json(data);
  } catch (error) {
    next(error);
  }
}

export async function listPriceRecords(req, res, next) {
  try {
    const data = await service.listPriceRecordsService({
      year: req.query.year,
    });

    res.json(data);
  } catch (error) {
    next(error);
  }
}

export async function getLatestPriceRecords(req, res, next) {
  try {
    const data = await service.getLatestPriceRecordsService();
    res.json(data);
  } catch (error) {
    next(error);
  }
}

export async function getPriceRecordById(req, res, next) {
  try {
    const data = await service.getPriceRecordByIdService(req.params.id);
    res.json(data);
  } catch (error) {
    next(error);
  }
}

export async function createPriceRecord(req, res, next) {
  try {
    const data = await service.createPriceRecordService(req.body);
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
}

export async function updatePriceRecord(req, res, next) {
  try {
    const data = await service.updatePriceRecordService(req.params.id, req.body);
    res.json(data);
  } catch (error) {
    next(error);
  }
}

export async function deletePriceRecord(req, res, next) {
  try {
    const data = await service.deletePriceRecordService(req.params.id);
    res.json(data);
  } catch (error) {
    next(error);
  }
}

export async function createPriceRequest(req, res, next) {
  try {
    const data = await service.createPriceRequestService(req.body);
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
}

export async function listPurchaseOrders(req, res, next) {
  try {
    const data = await service.listPurchaseOrdersService();
    res.json(data);
  } catch (error) {
    next(error);
  }
}

export async function createPurchaseOrder(req, res, next) {
  try {
    const payload = {
      ...req.body,
      deliveryDay: req.body.deliveryDay ? Number(req.body.deliveryDay) : null,
      items: typeof req.body.items === "string" ? JSON.parse(req.body.items) : req.body.items,
    };

    const data = await service.createPurchaseOrderService(payload, req.files || []);

    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
}

export async function updatePurchaseOrder(req, res, next) {
  try {
    const data = await service.updatePurchaseOrderService(req.params.id, req.body);
    res.json(data);
  } catch (error) {
    next(error);
  }
}

export async function sendPurchaseOrderToImport(req, res, next) {
  try {
    const data = await service.sendPurchaseOrderToImportService(req.params.id);
    res.json(data);
  } catch (error) {
    next(error);
  }
}

export async function createReceipt(req, res, next) {
  try {
    const data = await service.createRawMaterialReceiptService(req.body);
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
}

export async function getPurchaseSettings(req, res, next) {
  try {
    const data = await service.getPurchaseSettingsService();
    res.json(data);
  } catch (error) {
    next(error);
  }
}

export async function updatePurchaseSettings(req, res, next) {
  try {
    const data = await service.updatePurchaseSettingsService(req.body);
    res.json(data);
  } catch (error) {
    next(error);
  }
}

export async function sendSupplierPriceRequestMail(req, res, next) {
  try {
    const data = await service.sendSupplierPriceRequestMailService(req.body);
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
}

export async function getPublicPriceRequest(req, res, next) {
  try {
    const data = await service.getPublicPriceRequestService(req.params.token);
    res.json(data);
  } catch (error) {
    next(error);
  }
}

export async function respondPublicPriceRequest(req, res, next) {
  try {
    const data = await service.respondPublicPriceRequestService(req.params.token, req.body);
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
}
