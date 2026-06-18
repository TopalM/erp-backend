import * as service from "./supplier.service.js";

// Tedarikçi listesini getirir.
// Kategori filtresi query üzerinden alınır.
// Örnek:
// /api/suppliers?categoryTypes=MATERIAL,SERVICE
export async function listSuppliers(req, res, next) {
  try {
    const data = await service.listSuppliersService(req.query);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

// Yeni tedarikçi oluşturur.
// categoryType payload içinde gelebilir.
// Purchasing için genelde MATERIAL veya SERVICE gelir.
export async function createSupplier(req, res, next) {
  try {
    const data = await service.createSupplierService(req.body, req.user.id);

    res.status(201).json({
      success: true,
      message: "Tedarikçi kaydı oluşturuldu.",
      data,
    });
  } catch (error) {
    next(error);
  }
}

// Mevcut tedarikçiyi günceller.
// Partial update desteklenir.
// Yalnızca gönderilen alanlar güncellenir.
export async function updateSupplier(req, res, next) {
  try {
    const data = await service.updateSupplierService(req.params.id, req.body, req.user.id);

    res.json({
      success: true,
      message: "Tedarikçi kaydı güncellendi.",
      data,
    });
  } catch (error) {
    next(error);
  }
}

// Tedarikçiyi soft delete ile siler.
export async function deleteSupplier(req, res, next) {
  try {
    const data = await service.deleteSupplierService(req.params.id, req.user.id);

    res.json({
      success: true,
      message: "Tedarikçi kaydı silindi.",
      data,
    });
  } catch (error) {
    next(error);
  }
}
