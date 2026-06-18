import * as employeeService from "./employee.service.js";

import { successResponse } from "../../../utils/apiResponse.js";

// Çalışan listesini getirir.
// Arama, durum, tip ve departman filtrelerini destekler.
export const getEmployees = async (req, res, next) => {
  try {
    const employees = await employeeService.listEmployeesService({
      search: req.query.search,
      status: req.query.status,
      type: req.query.type,
      departmentId: req.query.departmentId,
    });

    return successResponse(res, employees, "Çalışanlar başarıyla getirildi.");
  } catch (error) {
    next(error);
  }
};

// Tek çalışan detayını getirir.
export const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await employeeService.getEmployeeByIdService(req.params.id);

    return successResponse(res, employee, "Çalışan detayı başarıyla getirildi.");
  } catch (error) {
    next(error);
  }
};

// Yeni çalışan oluşturur.
export const createEmployee = async (req, res, next) => {
  try {
    const employee = await employeeService.createEmployeeService(req.body);

    return successResponse(res, employee, "Çalışan başarıyla oluşturuldu.", 201);
  } catch (error) {
    next(error);
  }
};

// Çalışan bilgilerini günceller.
export const updateEmployee = async (req, res, next) => {
  try {
    const employee = await employeeService.updateEmployeeService(req.params.id, req.body);

    return successResponse(res, employee, "Çalışan başarıyla güncellendi.");
  } catch (error) {
    next(error);
  }
};

// Çalışan durumunu günceller.
// ACTIVE, PASSIVE, RESIGNED veya TERMINATED olabilir.
export const updateEmployeeStatus = async (req, res, next) => {
  try {
    const employee = await employeeService.updateEmployeeStatusService(req.params.id, req.body);

    return successResponse(res, employee, "Çalışan durumu başarıyla güncellendi.");
  } catch (error) {
    next(error);
  }
};

// Çalışanı bir kullanıcı hesabına bağlar.
// Bağlandığında çalışan tipi WHITE_COLLAR olarak güncellenir.
export const linkEmployeeUser = async (req, res, next) => {
  try {
    const employee = await employeeService.linkEmployeeUserService(req.params.id, req.body.userId);

    return successResponse(res, employee, "Çalışan kullanıcı hesabına başarıyla bağlandı.");
  } catch (error) {
    next(error);
  }
};

// Çalışan ile kullanıcı hesabı arasındaki bağlantıyı kaldırır.
export const unlinkEmployeeUser = async (req, res, next) => {
  try {
    const employee = await employeeService.unlinkEmployeeUserService(req.params.id);

    return successResponse(res, employee, "Çalışan kullanıcı bağlantısı kaldırıldı.");
  } catch (error) {
    next(error);
  }
};

// Çalışanı siler.
// İleride istersek bunu soft delete veya status değişimine çevirebiliriz.
export const deleteEmployee = async (req, res, next) => {
  try {
    const employee = await employeeService.deleteEmployeeService(req.params.id);

    return successResponse(res, employee, "Çalışan başarıyla silindi.");
  } catch (error) {
    next(error);
  }
};
