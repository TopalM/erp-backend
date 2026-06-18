import express from "express";

import * as authController from "./auth.controller.js";
import { authMiddleware } from "../../../middlewares/auth.middleware.js";
import { validate } from "../../../middlewares/validate.middleware.js";

import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  forgetPasswordSchema,
  newPasswordSchema,
  resendVerificationEmailSchema,
} from "./auth.validation.js";

const router = express.Router();

// Yeni kullanıcı kaydı oluşturur.
// Kullanıcı pasif olarak açılır, VIEWER rolü atanır ve email doğrulama bağlantısı gönderilir.
router.post("/register", validate(registerSchema), authController.register);

// Kullanıcı giriş işlemini yapar.
// Başarılı girişte JWT token ve kullanıcı bilgilerini döner.
router.post("/login", validate(loginSchema), authController.login);

// Email doğrulama tokenını kontrol eder.
// Token geçerliyse kullanıcının emailVerifiedAt alanı güncellenir.
router.get("/verify-email/:token", authController.verifyEmail);

// Oturum açmış kullanıcının mevcut şifresini değiştirir.
// authMiddleware zorunludur çünkü kullanıcı giriş yapmış olmalıdır.
router.post("/change-password", authMiddleware, validate(changePasswordSchema), authController.changePassword);

// Şifremi unuttum akışını başlatır.
// Email kayıtlıysa şifre sıfırlama bağlantısı gönderilir.
// Güvenlik için kayıtlı olmayan emailde de genel başarılı mesaj döner.
router.post("/forgot-password", validate(forgetPasswordSchema), authController.forgetPassword);

// Şifre sıfırlama tokenı ile yeni şifre belirler.
router.post("/reset-password", validate(newPasswordSchema), authController.newPassword);

// Email doğrulama bağlantısını tekrar gönderir.
// Email kayıtlı ve doğrulanmamışsa yeni doğrulama maili oluşturur.
router.post("/resend-verification-email", validate(resendVerificationEmailSchema), authController.resendVerificationEmail);

// Kullanıcı çıkış işlemini yapar.
// tokenVersion artırılarak mevcut token geçersizleştirilir.
router.post("/logout", authMiddleware, authController.logout);

// Oturum açmış kullanıcının bilgilerini döner.
router.get("/me", authMiddleware, authController.me);

export default router;
