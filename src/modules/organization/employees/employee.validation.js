import { z } from "zod";

// Boş bırakılabilen string alanlar için ortak şema.
// undefined: Alan hiç gönderilmemiş, update sırasında mevcut değer korunur.
// null veya boş string: Alan bilerek boşaltılmak istenmiş olabilir.
const optionalString = z.string().trim().optional().nullable();

// Tarih alanları için ortak şema.
// Tarih alanları string olarak gelir, geçerli tarih formatı kontrol edilir.
const optionalDate = z
  .string()
  .trim()
  .optional()
  .nullable()
  .refine((value) => !value || !Number.isNaN(Date.parse(value)), {
    message: "Geçerli tarih gönderilmelidir.",
  });

// Maaş alanı için ortak şema.
// Frontend bazen number, bazen string gönderebilir.
// Negatif maaş kabul edilmez.
const optionalDecimal = z
  .union([z.string(), z.number()])
  .optional()
  .nullable()
  .refine((value) => value === undefined || value === null || value === "" || Number(value) >= 0, {
    message: "Maaş negatif olamaz.",
  });

// Yeni çalışan oluşturma validasyonu.
// Zorunlu alanlar: employeeCode, firstName, lastName.
// Diğer alanlar opsiyoneldir.
export const createEmployeeSchema = z.object({
  employeeCode: z.string().trim().min(1, "Sicil kodu zorunludur."), // Sicil / çalışan kodu
  firstName: z.string().trim().min(1, "Ad zorunludur."), // Çalışanın adı
  lastName: z.string().trim().min(1, "Soyad zorunludur."), // Çalışanın soyadı

  type: z.enum(["BLUE_COLLAR", "WHITE_COLLAR"]).optional(), // Çalışan tipi
  status: z.enum(["ACTIVE", "PASSIVE", "RESIGNED", "TERMINATED"]).optional(), // Çalışan durumu

  phone: optionalString, // Telefon numarası
  email: optionalString, // E-posta adresi
  identityNumber: optionalString, // TC kimlik numarası

  birthDate: optionalDate, // Doğum tarihi
  hireDate: optionalDate, // İşe giriş tarihi
  leaveDate: optionalDate, // İşten çıkış tarihi

  title: optionalString, // Ünvan / görev

  departmentId: optionalString, // Departman id'si
  userId: optionalString, // Bağlı kullanıcı hesabı id'si

  bloodTypeId: optionalString, // Kan grubu id'si
  locationId: optionalString, // Lokasyon id'si

  cityId: z.coerce.number().int().positive().optional().nullable(), // Şehir id'si
  districtId: z.coerce.number().int().positive().optional().nullable(), // İlçe id'si

  address: optionalString, // Açık adres

  monthlySalary: optionalDecimal, // Aylık maaş
  salaryCurrency: optionalString, // Maaş para birimi

  note: optionalString, // Açıklama / not
});

// Çalışan güncelleme validasyonu.
// createEmployeeSchema'nın tüm alanlarını opsiyonel yapar.
// Ancak tamamen boş body gönderilmesini engeller.
export const updateEmployeeSchema = createEmployeeSchema.partial().refine((data) => Object.keys(data).length > 0, {
  message: "Güncellenecek en az bir alan gönderilmelidir.",
});

// Çalışan durum güncelleme validasyonu.
// Sadece status ve opsiyonel leaveDate güncellenir.
export const updateEmployeeStatusSchema = z.object({
  status: z.enum(["ACTIVE", "PASSIVE", "RESIGNED", "TERMINATED"], {
    error: "Geçerli çalışan durumu gönderilmelidir.",
  }),
  leaveDate: optionalDate, // İşten çıkış tarihi
});

// Çalışanı User hesabına bağlama validasyonu.
export const linkEmployeeUserSchema = z.object({
  userId: z.string().trim().min(1, "Kullanıcı id zorunludur."),
});
