import { z } from "zod";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;

const passwordMessage = "Şifre en az bir büyük harf, bir küçük harf, bir rakam ve bir özel karakter içermelidir.";

const emailRequiredMessage = "E-posta adresi zorunludur.";
const invalidEmailMessage = "Geçerli bir e-posta adresi giriniz.";
const plastifayEmailMessage = "Sadece @plastifay.com.tr uzantılı e-posta adresleri kullanılabilir.";

// Email alanını önce trim + lowercase yapar, sonra geçerli email formatını kontrol eder.
const emailSchema = z.preprocess(
  (value) => {
    if (typeof value !== "string") return value;

    return value.trim().toLowerCase();
  },
  z.email({
    error: (issue) => {
      if (issue.input === undefined || issue.input === null || issue.input === "") {
        return emailRequiredMessage;
      }

      return invalidEmailMessage;
    },
  }),
);

// Sadece @plastifay.com.tr uzantılı email adreslerine izin verir.
// Register sırasında kullanılır.
const plastifayEmailSchema = emailSchema.refine((email) => email.endsWith("@plastifay.com.tr"), {
  message: plastifayEmailMessage,
});

// Yeni kullanıcı kayıt bilgilerini doğrular.
export const registerSchema = z.object({
  firstName: z.string({ error: "Ad zorunludur." }).trim().min(2, "Ad en az 2 karakter olmalıdır."),

  lastName: z.string({ error: "Soyad zorunludur." }).trim().min(2, "Soyad en az 2 karakter olmalıdır."),

  email: plastifayEmailSchema,

  password: z.string({ error: "Şifre zorunludur." }).min(8, "Şifre en az 8 karakter olmalıdır.").regex(passwordRegex, passwordMessage),
});

// Kullanıcı giriş bilgilerini doğrular.
export const loginSchema = z.object({
  email: emailSchema,

  password: z.string({ error: "Şifre zorunludur." }).min(1, "Şifre zorunludur."),
});

// Oturum açmış kullanıcının şifre değiştirme bilgilerini doğrular.
export const changePasswordSchema = z.object({
  currentPassword: z.string({ error: "Mevcut şifre zorunludur." }).min(1, "Mevcut şifre zorunludur."),

  newPassword: z.string({ error: "Yeni şifre zorunludur." }).min(8, "Yeni şifre en az 8 karakter olmalıdır.").regex(passwordRegex, passwordMessage),
});

// Şifremi unuttum isteğindeki email bilgisini doğrular.
export const forgetPasswordSchema = z.object({
  email: emailSchema,
});

// Şifre sıfırlama tokenı ve yeni şifre bilgisini doğrular.
export const newPasswordSchema = z.object({
  token: z.string({ error: "Token zorunludur." }).min(1, "Token zorunludur."),

  password: z.string({ error: "Şifre zorunludur." }).min(8, "Şifre en az 8 karakter olmalıdır.").regex(passwordRegex, passwordMessage),
});

// Email doğrulama bağlantısını tekrar gönderme isteğini doğrular.
export const resendVerificationEmailSchema = z.object({
  email: emailSchema,
});
