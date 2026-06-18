import { Prisma } from "@prisma/client";

import { prisma } from "../../../database/prisma.client.js";
import { AppError } from "../../../utils/appError.js";

// Çalışan detaylarında birlikte dönecek ilişkiler.
// Liste, detay, oluşturma ve güncelleme cevaplarında ortak kullanılır.
const employeeInclude = {
  department: true,
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      isActive: true,
      role: true,
      department: true,
    },
  },
  bloodType: true,
  location: true,
  city: true,
  district: true,
};

// Ad bilgisini Türkçe karakter kurallarına uygun biçimde formatlar.
// Örn: "mustafa   ali" => "Mustafa Ali"
const formatName = (value) => {
  return value
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (char) => char.toLocaleUpperCase("tr-TR"));
};

// Soyad bilgisini Türkçe karakter kurallarına uygun büyük harfe çevirir.
// Örn: "topal" => "TOPAL"
const formatSurname = (value) => {
  return value.trim().toLocaleUpperCase("tr-TR");
};

// Boş string değerleri null'a çevirir.
// undefined ise hiç dokunmaz; böylece update işleminde alan korunur.
const emptyToNull = (value) => {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;

  return value;
};

// Tarih alanlarını Date tipine çevirir.
// Boş gönderilirse null olur.
// undefined ise update sırasında mevcut değer korunur.
const toDateOrNull = (value) => {
  if (value === undefined) return undefined;
  if (!value) return null;

  return new Date(value);
};

// Maaş alanını Prisma Decimal tipine çevirir.
// Boş gönderilirse null olur.
// undefined ise update sırasında mevcut değer korunur.
const toDecimalOrNull = (value) => {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;

  return new Prisma.Decimal(value);
};

// Request body'den gelen veriyi Prisma create/update datasına dönüştürür.
// Bu fonksiyon hem create hem update için ortak kullanılır.
const buildEmployeeData = (payload) => {
  const data = {};

  if (payload.employeeCode !== undefined) data.employeeCode = payload.employeeCode.trim();
  if (payload.firstName !== undefined) data.firstName = formatName(payload.firstName);
  if (payload.lastName !== undefined) data.lastName = formatSurname(payload.lastName);

  if (payload.type !== undefined) data.type = payload.type;
  if (payload.status !== undefined) data.status = payload.status;

  if (payload.phone !== undefined) data.phone = emptyToNull(payload.phone?.trim());
  if (payload.email !== undefined) data.email = emptyToNull(payload.email?.trim().toLowerCase());
  if (payload.identityNumber !== undefined) data.identityNumber = emptyToNull(payload.identityNumber?.trim());

  if (payload.birthDate !== undefined) data.birthDate = toDateOrNull(payload.birthDate);
  if (payload.hireDate !== undefined) data.hireDate = toDateOrNull(payload.hireDate);
  if (payload.leaveDate !== undefined) data.leaveDate = toDateOrNull(payload.leaveDate);

  if (payload.title !== undefined) data.title = emptyToNull(payload.title?.trim());

  if (payload.departmentId !== undefined) data.departmentId = emptyToNull(payload.departmentId);
  if (payload.userId !== undefined) data.userId = emptyToNull(payload.userId);

  if (payload.bloodTypeId !== undefined) data.bloodTypeId = emptyToNull(payload.bloodTypeId);
  if (payload.locationId !== undefined) data.locationId = emptyToNull(payload.locationId);

  if (payload.cityId !== undefined) data.cityId = payload.cityId || null;
  if (payload.districtId !== undefined) data.districtId = payload.districtId || null;

  if (payload.address !== undefined) data.address = emptyToNull(payload.address?.trim());

  if (payload.monthlySalary !== undefined) data.monthlySalary = toDecimalOrNull(payload.monthlySalary);

  if (payload.salaryCurrency !== undefined) {
    data.salaryCurrency = emptyToNull(payload.salaryCurrency?.trim().toUpperCase()) || "TRY";
  }

  if (payload.note !== undefined) data.note = emptyToNull(payload.note?.trim());

  return data;
};

// Verilen id'ye sahip çalışan var mı kontrol eder.
// Yoksa 404 hata fırlatır.
const ensureEmployeeExists = async (id) => {
  const employee = await prisma.employee.findUnique({
    where: {
      id,
    },
  });

  if (!employee) {
    throw new AppError("Çalışan bulunamadı.", 404);
  }

  return employee;
};

// Çalışan kaydı oluşturma/güncelleme sırasında gönderilen ilişkisel id'leri kontrol eder.
// Departman, kullanıcı, kan grubu, lokasyon, şehir ve ilçe gerçekten var mı diye doğrular.
const ensureRelationsExist = async (data) => {
  if (data.departmentId) {
    const department = await prisma.department.findUnique({
      where: {
        id: data.departmentId,
      },
    });

    if (!department) {
      throw new AppError("Departman bulunamadı.", 404);
    }
  }

  if (data.userId) {
    const user = await prisma.user.findUnique({
      where: {
        id: data.userId,
      },
    });

    if (!user) {
      throw new AppError("Kullanıcı bulunamadı.", 404);
    }
  }

  if (data.bloodTypeId) {
    const bloodType = await prisma.bloodType.findUnique({
      where: {
        id: data.bloodTypeId,
      },
    });

    if (!bloodType) {
      throw new AppError("Kan grubu bulunamadı.", 404);
    }
  }

  if (data.locationId) {
    const location = await prisma.location.findUnique({
      where: {
        id: data.locationId,
      },
    });

    if (!location) {
      throw new AppError("Lokasyon bulunamadı.", 404);
    }
  }

  if (data.cityId) {
    const city = await prisma.city.findUnique({
      where: {
        id: data.cityId,
      },
    });

    if (!city) {
      throw new AppError("Şehir bulunamadı.", 404);
    }
  }

  if (data.districtId) {
    const district = await prisma.district.findUnique({
      where: {
        id: data.districtId,
      },
    });

    if (!district) {
      throw new AppError("İlçe bulunamadı.", 404);
    }

    // Şehir ve ilçe birlikte gönderildiyse, ilçe gerçekten o şehre bağlı mı kontrol edilir.
    if (data.cityId && district.cityId !== data.cityId) {
      throw new AppError("İlçe seçilen şehre bağlı değildir.", 400);
    }
  }
};

// Çalışan listesini getirir.
// search, status, type ve departmentId filtrelerini destekler.
export const listEmployeesService = async ({ search, status, type, departmentId } = {}) => {
  return prisma.employee.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(type ? { type } : {}),
      ...(departmentId ? { departmentId } : {}),
      ...(search
        ? {
            OR: [
              {
                employeeCode: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                firstName: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                lastName: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                identityNumber: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),
    },
    include: employeeInclude,
    orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
  });
};

// Tek çalışan detayını getirir.
export const getEmployeeByIdService = async (id) => {
  const employee = await prisma.employee.findUnique({
    where: {
      id,
    },
    include: employeeInclude,
  });

  if (!employee) {
    throw new AppError("Çalışan bulunamadı.", 404);
  }

  return employee;
};

// Yeni çalışan oluşturur.
export const createEmployeeService = async (payload) => {
  const data = buildEmployeeData(payload);

  await ensureRelationsExist(data);

  try {
    return await prisma.employee.create({
      data,
      include: employeeInclude,
    });
  } catch (error) {
    // employeeCode, identityNumber veya userId unique alanlarında çakışma olursa yakalanır.
    if (error.code === "P2002") {
      throw new AppError("Sicil kodu, TC kimlik no veya kullanıcı bağlantısı zaten kullanılıyor.", 409);
    }

    throw error;
  }
};

// Çalışan bilgisini günceller.
export const updateEmployeeService = async (id, payload) => {
  await ensureEmployeeExists(id);

  const data = buildEmployeeData(payload);

  await ensureRelationsExist(data);

  try {
    return await prisma.employee.update({
      where: {
        id,
      },
      data,
      include: employeeInclude,
    });
  } catch (error) {
    // employeeCode, identityNumber veya userId unique alanlarında çakışma olursa yakalanır.
    if (error.code === "P2002") {
      throw new AppError("Sicil kodu, TC kimlik no veya kullanıcı bağlantısı zaten kullanılıyor.", 409);
    }

    throw error;
  }
};

// Çalışanın durumunu günceller.
// Örn: ACTIVE, PASSIVE, RESIGNED, TERMINATED
export const updateEmployeeStatusService = async (id, payload) => {
  await ensureEmployeeExists(id);

  return prisma.employee.update({
    where: {
      id,
    },
    data: {
      status: payload.status,
      ...(payload.leaveDate !== undefined
        ? {
            leaveDate: toDateOrNull(payload.leaveDate),
          }
        : {}),
    },
    include: employeeInclude,
  });
};

// Çalışanı bir User hesabına bağlar.
// Kullanıcı bağlandığında çalışan tipi WHITE_COLLAR yapılır.
export const linkEmployeeUserService = async (id, userId) => {
  await ensureEmployeeExists(id);

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new AppError("Kullanıcı bulunamadı.", 404);
  }

  try {
    return await prisma.employee.update({
      where: {
        id,
      },
      data: {
        userId,
        type: "WHITE_COLLAR",
      },
      include: employeeInclude,
    });
  } catch (error) {
    // userId unique olduğu için aynı kullanıcı başka çalışana bağlıysa çakışır.
    if (error.code === "P2002") {
      throw new AppError("Bu kullanıcı başka bir çalışan kaydına bağlı.", 409);
    }

    throw error;
  }
};

// Çalışanın User hesabı bağlantısını kaldırır.
export const unlinkEmployeeUserService = async (id) => {
  await ensureEmployeeExists(id);

  return prisma.employee.update({
    where: {
      id,
    },
    data: {
      userId: null,
    },
    include: employeeInclude,
  });
};

// Çalışan kaydını siler.
// Şimdilik hard delete kullanıyoruz.
// İstersen sonra bunu status = PASSIVE mantığına çevirebiliriz.
export const deleteEmployeeService = async (id) => {
  await ensureEmployeeExists(id);

  return prisma.employee.delete({
    where: {
      id,
    },
    include: employeeInclude,
  });
};
