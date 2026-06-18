import * as authService from "./auth.service.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { successResponse } from "../../../utils/apiResponse.js";

// Yeni kullanıcı kaydı oluşturur.
// Kullanıcı bilgilerini authService.register'a gönderir.
// Kayıt sonrası kullanıcı bilgisini döner.
export const register = asyncHandler(async (req, res) => {
  const user = await authService.register(req.body, req);

  return successResponse(res, user, "User registered successfully.", 201);
});

// Kullanıcı giriş işlemini yapar.
// Email ve password bilgilerini kontrol eder.
// Başarılı girişte token ve kullanıcı bilgilerini döner.
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const result = await authService.login(email, password, req);

  return successResponse(res, result, "Login successful.");
});

// Oturum açmış kullanıcının bilgilerini döner.
// req.user auth middleware tarafından doldurulur.
export const me = asyncHandler(async (req, res) => {
  return successResponse(res, req.user, "Authenticated user fetched.");
});

// Kullanıcının mevcut şifresini doğrulayıp yeni şifre belirler.
// Şifre değişince mevcut tokenları geçersizleştirmek için service tarafında tokenVersion artırılmalıdır.
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  await authService.changePassword(req.user.id, currentPassword, newPassword, req);

  return successResponse(res, null, "Password changed successfully.");
});

// Email doğrulama tokenını kontrol eder.
// Token geçerliyse kullanıcının emailVerifiedAt alanını günceller.
export const verifyEmail = asyncHandler(async (req, res) => {
  const user = await authService.verifyEmail(req.params.token, req);

  return successResponse(res, user, "Email verified successfully.");
});

// Şifremi unuttum akışını başlatır.
// Email kayıtlıysa reset linki gönderir.
// Güvenlik için email kayıtlı değilse bile aynı mesaj döner.
export const forgetPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  await authService.forgetPassword(email, req);

  return successResponse(res, null, "Password reset link has been sent if the email is registered.");
});

// Şifre sıfırlama tokenı ile yeni şifre belirler.
// Token geçerliyse passwordHash güncellenir ve token temizlenir.
export const newPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  await authService.newPassword(token, password, req);

  return successResponse(res, null, "Password has been reset successfully.");
});

// Kullanıcı çıkış işlemini yapar.
// Service tarafında tokenVersion artırılarak mevcut token geçersizleştirilebilir.
export const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user.id, req);

  return successResponse(res, null, "Logout successful.");
});

// Email doğrulama bağlantısını tekrar gönderir.
// Email kayıtlı ve doğrulanmamışsa yeni doğrulama maili gönderir.
// Güvenlik için her durumda genel mesaj döner.
export const resendVerificationEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;

  await authService.resendVerificationEmail(email, req);

  return successResponse(res, null, "Verification email has been sent if the email is registered and not verified.");
});
