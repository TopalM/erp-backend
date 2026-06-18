import { z } from "zod";

// Kullanıcı rolü güncelleme validasyonu.
export const updateUserRoleSchema = z.object({
  roleId: z.string().trim().min(1, "Rol zorunludur."),
});

// Kullanıcı departmanı güncelleme validasyonu.
export const updateUserDepartmentSchema = z.object({
  departmentId: z.string().trim().min(1, "Departman zorunludur."),
});

// Kullanıcının kendi profilini güncelleme validasyonu.
export const updateProfileSchema = z.object({
  firstName: z.string().trim().min(1, "Ad zorunludur."),
  lastName: z.string().trim().min(1, "Soyad zorunludur."),
  phone: z.string().trim().optional().nullable(),
  preferredTheme: z.enum(["light", "dark"]).optional(),
});
