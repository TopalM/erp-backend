import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import { sendMail } from "../../platform/notification/mail/mail.service.js";
import { verifyEmailTemplate } from "../../platform/notification/mail/templates/verify-email.template.js";
import { resetPasswordTemplate } from "../../platform/notification/mail/templates/reset-password.template.js";

import { prisma } from "../../../database/prisma.client.js";
import { env } from "../../../config/env.js";
import { AppError } from "../../../utils/appError.js";
import { sanitizeUser } from "../../../utils/sanitizeUser.js";
import { AUTH_EVENTS, createAuthEventLog } from "../../platform/audit/auth-event-logs/auth-event.service.js";

// Email bilgisini normalize eder.
// Boş veya hatalı email gelirse kullanıcıya Türkçe hata döner.
const normalizeEmail = (email) => {
  if (!email || typeof email !== "string") {
    throw new AppError("E-posta adresi zorunludur.", 400);
  }

  return email.trim().toLowerCase();
};

// İsim bilgisini Türkçe karakterlere uygun şekilde formatlar.
// Fazla boşlukları temizler ve kelime başlarını büyütür.
const formatName = (value) => {
  return value
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (char) => char.toLocaleUpperCase("tr-TR"));
};

// Soyisim bilgisini Türkçe karakterlere uygun şekilde büyük harfe çevirir.
const formatSurname = (value) => {
  return value.trim().toLocaleUpperCase("tr-TR");
};

// Parola güvenlik kurallarını kontrol eder.
// En az 8 karakter, en az 1 büyük harf, 1 küçük harf ve 1 rakam zorunludur.
const validatePassword = (password) => {
  if (!password || password.length < 8) {
    throw new AppError("Şifre en az 8 karakter olmalıdır.", 400);
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;

  if (!passwordRegex.test(password)) {
    throw new AppError("Şifre en az bir büyük harf, bir küçük harf, bir rakam ve bir özel karakter içermelidir.", 400);
  }
};

// Sadece Plastifay kurumsal email adreslerine kayıt izni verir.
const validatePlastifayEmail = (email) => {
  if (!email.endsWith("@plastifay.com.tr")) {
    throw new AppError("Sadece @plastifay.com.tr uzantılı e-posta adresleri ile kayıt olunabilir.", 400);
  }
};

// JWT içine yazılacak kullanıcı bilgilerini hazırlar.
const createTokenPayload = (user) => {
  return {
    userId: user.id,
    email: user.email,
    role: user.role.name,
    departmentId: user.departmentId,
    tokenVersion: user.tokenVersion,
  };
};

// Email doğrulama tokenı üretir.
const createEmailVerificationToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

// Email doğrulama tokenının geçerlilik süresini oluşturur.
const createEmailVerificationExpires = () => {
  return new Date(Date.now() + 24 * 60 * 60 * 1000);
};

// Kullanıcıya email doğrulama bağlantısı gönderir.
const sendEmailVerificationMail = async (user, token) => {
  const verificationUrl = `${env.frontendUrl}/verify-email/${token}`;

  const html = verifyEmailTemplate({
    firstName: user.firstName,
    lastName: user.lastName,
    verificationUrl,
  });

  await sendMail({
    to: user.email,
    subject: "Plastifay ERP Email Doğrulama",
    html,
  });
};

// Şifre sıfırlama tokenı üretir.
const createPasswordResetToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

// Şifre sıfırlama tokenının geçerlilik süresini oluşturur.
const createPasswordResetExpires = () => {
  return new Date(Date.now() + 60 * 60 * 1000);
};

// Kullanıcıya şifre sıfırlama bağlantısı gönderir.
const sendResetPasswordMail = async (user, token) => {
  const resetUrl = `${env.frontendUrl}/new-password/${token}`;

  const html = resetPasswordTemplate({
    firstName: user.firstName,
    resetUrl,
  });

  await sendMail({
    to: user.email,
    subject: "Plastifay ERP Şifre Sıfırlama",
    html,
  });
};

// Yeni kullanıcı kaydı oluşturur.
// Kullanıcı pasif olarak oluşturulur, VIEWER rolü atanır ve email doğrulama maili gönderilir.
export const register = async (data, req = null) => {
  let createdUserId = null;

  try {
    const email = normalizeEmail(data.email);

    validatePlastifayEmail(email);
    validatePassword(data.password);

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError("Bu e-posta adresi zaten kullanılıyor.", 409);
    }

    const viewerRole = await prisma.role.findUnique({
      where: {
        name: "VIEWER",
      },
    });

    if (!viewerRole) {
      throw new AppError("Varsayılan VIEWER rolü bulunamadı.", 500);
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        firstName: formatName(data.firstName),
        lastName: formatSurname(data.lastName),
        email,
        passwordHash,
        isActive: false,
        departmentId: null,
        roleId: viewerRole.id,
      },
      include: {
        role: true,
        department: true,
      },
    });

    createdUserId = user.id;

    const emailVerificationToken = createEmailVerificationToken();
    const emailVerificationExpires = createEmailVerificationExpires();

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken,
        emailVerificationExpires,
      },
      include: {
        role: true,
        department: true,
      },
    });

    await sendEmailVerificationMail(updatedUser, emailVerificationToken);

    await createAuthEventLog({
      userId: updatedUser.id,
      email: updatedUser.email,
      event: AUTH_EVENTS.REGISTER_SUCCESS,
      success: true,
      message: "Kullanıcı başarıyla kayıt oldu.",
      req,
    });

    await createAuthEventLog({
      userId: updatedUser.id,
      email: updatedUser.email,
      event: AUTH_EVENTS.EMAIL_VERIFICATION_SENT,
      success: true,
      message: "Email doğrulama maili gönderildi.",
      req,
    });

    return sanitizeUser(updatedUser);
  } catch (error) {
    if (createdUserId) {
      await prisma.authEventLog.deleteMany({
        where: {
          userId: createdUserId,
        },
      });

      await prisma.user.delete({
        where: {
          id: createdUserId,
        },
      });
    }

    throw error;
  }
};

// Kullanıcı giriş işlemini yapar.
// Email ve şifreyi kontrol eder, başarısız denemeleri sayar, gerekirse hesabı kilitler.
// Başarılı girişte JWT token ve kullanıcı bilgilerini döner.
export const login = async (email, password, req = null) => {
  if (!email || !password) {
    throw new AppError("E-posta ve şifre zorunludur.", 400);
  }

  const normalizedEmail = normalizeEmail(email);

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    include: {
      role: true,
      department: true,
    },
  });

  if (!user) {
    await createAuthEventLog({
      email: normalizedEmail,
      event: AUTH_EVENTS.LOGIN_FAILED,
      success: false,
      message: "Kullanıcı bulunamadı.",
      req,
    });

    throw new AppError("E-posta veya şifre hatalı.", 401);
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    throw new AppError("Hesap geçici olarak kilitlendi. Lütfen daha sonra tekrar deneyin.", 423);
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    const failedAttempts = user.failedLoginAttempts + 1;
    const shouldLock = failedAttempts >= 5;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: failedAttempts,
        lockedUntil: shouldLock ? new Date(Date.now() + 15 * 60 * 1000) : null,
      },
    });

    await createAuthEventLog({
      userId: user.id,
      email: user.email,
      event: shouldLock ? AUTH_EVENTS.ACCOUNT_LOCKED : AUTH_EVENTS.LOGIN_FAILED,
      success: false,
      message: shouldLock ? "Çok fazla başarısız giriş nedeniyle hesap kilitlendi." : "Şifre hatalı.",
      req,
    });

    throw new AppError("E-posta veya şifre hatalı.", 401);
  }

  if (!user.emailVerifiedAt) {
    throw new AppError("Lütfen e-posta adresinizi doğrulayın.", 403);
  }

  if (!user.isActive) {
    throw new AppError("Kullanıcı hesabı aktif değildir.", 403);
  }

  const loggedInUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
      tokenVersion: {
        increment: 1,
      },
    },
    include: {
      role: true,
      department: true,
      userPermissions: {
        include: {
          permission: true,
        },
      },
    },
  });

  await createAuthEventLog({
    userId: loggedInUser.id,
    email: loggedInUser.email,
    event: AUTH_EVENTS.LOGIN_SUCCESS,
    success: true,
    message: "Giriş başarılı.",
    req,
  });

  const token = jwt.sign(createTokenPayload(loggedInUser), env.jwt.secret, {
    expiresIn: env.jwt.expiresIn,
  });

  return {
    token,
    user: sanitizeUser(loggedInUser),
  };
};

// Email doğrulama tokenını kontrol eder.
// Token geçerliyse kullanıcının email doğrulama bilgisini günceller.
export const verifyEmail = async (token, req = null) => {
  if (!token) {
    throw new AppError("Doğrulama tokenı zorunludur.", 400);
  }

  const user = await prisma.user.findFirst({
    where: {
      emailVerificationToken: token,
    },
    include: {
      role: true,
      department: true,
    },
  });

  if (!user) {
    await createAuthEventLog({
      event: AUTH_EVENTS.EMAIL_VERIFICATION_FAILED,
      success: false,
      message: "Geçersiz doğrulama tokenı.",
      req,
    });

    throw new AppError("Geçersiz doğrulama tokenı.", 400);
  }

  if (user.emailVerifiedAt) {
    return sanitizeUser(user);
  }

  if (!user.emailVerificationExpires || user.emailVerificationExpires < new Date()) {
    await createAuthEventLog({
      userId: user.id,
      email: user.email,
      event: AUTH_EVENTS.EMAIL_VERIFICATION_FAILED,
      success: false,
      message: "Doğrulama tokenının süresi doldu.",
      req,
    });

    throw new AppError("Doğrulama tokenının süresi doldu.", 400);
  }

  const verifiedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerifiedAt: new Date(),
      emailVerificationToken: null,
      emailVerificationExpires: null,
    },
    include: {
      role: true,
      department: true,
    },
  });

  await createAuthEventLog({
    userId: verifiedUser.id,
    email: verifiedUser.email,
    event: AUTH_EVENTS.EMAIL_VERIFIED,
    success: true,
    message: "E-posta başarıyla doğrulandı.",
    req,
  });

  return sanitizeUser(verifiedUser);
};

// Oturum açmış kullanıcının mevcut şifresini değiştirir.
// Mevcut şifre doğrulanır, yeni şifre güvenlik kurallarından geçirilir.
// Şifre değişince tokenVersion artırılarak mevcut tokenlar geçersizleştirilir.
export const changePassword = async (userId, currentPassword, newPassword, req = null) => {
  if (!currentPassword || !newPassword) {
    throw new AppError("Mevcut şifre ve yeni şifre zorunludur.", 400);
  }

  validatePassword(newPassword);

  if (currentPassword === newPassword) {
    throw new AppError("Yeni şifre mevcut şifreden farklı olmalıdır.", 400);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || !user.isActive) {
    throw new AppError("Kullanıcı bulunamadı veya aktif değil.", 404);
  }

  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);

  if (!isCurrentPasswordValid) {
    throw new AppError("Mevcut şifre hatalı.", 400);
  }

  const newPasswordHash = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash: newPasswordHash,
      tokenVersion: {
        increment: 1,
      },
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  });

  await createAuthEventLog({
    userId: user.id,
    email: user.email,
    event: AUTH_EVENTS.PASSWORD_CHANGED,
    success: true,
    message: "Şifre başarıyla değiştirildi.",
    req,
  });

  return null;
};

// Kullanıcı çıkış işlemini yapar.
// tokenVersion artırılarak mevcut token geçersizleştirilir.
export const logout = async (userId, req = null) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      tokenVersion: {
        increment: 1,
      },
    },
  });

  await createAuthEventLog({
    userId: user.id,
    email: user.email,
    event: AUTH_EVENTS.LOGOUT,
    success: true,
    message: "Çıkış başarılı.",
    req,
  });
};

// Şifremi unuttum akışını başlatır.
// Email kayıtlıysa şifre sıfırlama bağlantısı gönderir.
// Güvenlik için email kayıtlı değilse hata dönmez.
export const forgetPassword = async (email, req = null) => {
  const normalizedEmail = normalizeEmail(email);

  const user = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
    include: {
      role: true,
      department: true,
    },
  });

  if (!user) {
    return null;
  }

  const passwordResetToken = createPasswordResetToken();
  const passwordResetExpires = createPasswordResetExpires();

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      passwordResetToken,
      passwordResetExpires,
    },
  });

  try {
    await sendResetPasswordMail(user, passwordResetToken);
  } catch (error) {
    console.error("Password reset mail could not be sent:", error.message);
  }

  await createAuthEventLog({
    userId: user.id,
    email: user.email,
    event: AUTH_EVENTS.PASSWORD_RESET_REQUESTED,
    success: true,
    message: "Şifre sıfırlama talebi oluşturuldu.",
    req,
  });

  return null;
};

// Şifre sıfırlama tokenı ile yeni şifre oluşturur.
// Token geçerliyse şifre güncellenir, reset token temizlenir ve mevcut tokenlar geçersizleştirilir.
export const newPassword = async (token, password, req = null) => {
  if (!token || !password) {
    throw new AppError("Token ve şifre zorunludur.", 400);
  }

  validatePassword(password);

  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: token,
    },
    include: {
      role: true,
      department: true,
    },
  });

  if (!user) {
    throw new AppError("Geçersiz şifre sıfırlama tokenı.", 400);
  }

  if (!user.passwordResetExpires || user.passwordResetExpires < new Date()) {
    throw new AppError("Şifre sıfırlama tokenının süresi doldu.", 400);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      passwordHash,

      passwordResetToken: null,
      passwordResetExpires: null,

      emailVerifiedAt: user.emailVerifiedAt || new Date(),
      emailVerificationToken: null,
      emailVerificationExpires: null,

      tokenVersion: {
        increment: 1,
      },

      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  });

  await createAuthEventLog({
    userId: user.id,
    email: user.email,
    event: AUTH_EVENTS.PASSWORD_RESET_COMPLETED,
    success: true,
    message: "Şifre sıfırlama işlemi başarıyla tamamlandı.",
    req,
  });

  return null;
};

// Email doğrulama bağlantısını tekrar gönderir.
// Email kayıtlı değilse veya zaten doğrulanmışsa hata dönmez.
export const resendVerificationEmail = async (email, req = null) => {
  const normalizedEmail = normalizeEmail(email);

  const user = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
    include: {
      role: true,
      department: true,
    },
  });

  if (!user) {
    return null;
  }

  if (user.emailVerifiedAt) {
    return null;
  }

  const emailVerificationToken = createEmailVerificationToken();
  const emailVerificationExpires = createEmailVerificationExpires();

  const updatedUser = await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      emailVerificationToken,
      emailVerificationExpires,
    },
    include: {
      role: true,
      department: true,
    },
  });

  await sendEmailVerificationMail(updatedUser, emailVerificationToken);

  await createAuthEventLog({
    userId: updatedUser.id,
    email: updatedUser.email,
    event: AUTH_EVENTS.EMAIL_VERIFICATION_SENT,
    success: true,
    message: "Email doğrulama maili tekrar gönderildi.",
    req,
  });

  return null;
};
