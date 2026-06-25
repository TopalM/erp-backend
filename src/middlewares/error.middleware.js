import { env } from "../config/env.js";
import { errorResponse } from "../utils/apiResponse.js";
import { createAuditLog } from "../modules/platform/audit/audit-logs/audit-log.service.js";

export const notFoundHandler = (req, res, next) => {
  return errorResponse(res, "İstenen endpoint bulunamadı.", 404);
};

export const globalErrorHandler = async (error, req, res, next) => {
  if (error?.name === "MulterError") {
    const statusCode = error.code === "LIMIT_FILE_SIZE" ? 413 : 400;

    return res.status(statusCode).json({
      success: false,
      message: error.code === "LIMIT_FILE_SIZE" ? "Dosya boyutu limiti aşıldı." : "Dosya yükleme hatası.",
      errors: [
        {
          field: "file",
          message: error.message,
          code: error.code,
        },
      ],
    });
  }

  const statusCode = error.statusCode || 500;

  if (statusCode === 500) {
    console.error(error);

    await createAuditLog({
      actorUser: req.user || null,
      action: "ERROR",
      module: "SYSTEM",
      message: error.message || "Beklenmeyen sunucu hatası.",
      oldValue: null,
      newValue: {
        path: req.originalUrl,
        method: req.method,
        stack: env.nodeEnv === "production" ? undefined : error.stack,
      },
      req,
    });
  }

  const message =
    env.nodeEnv === "production" && statusCode === 500
      ? "Sunucu tarafında beklenmeyen bir hata oluştu."
      : error.message || "Sunucu tarafında beklenmeyen bir hata oluştu.";

  const errors = env.nodeEnv === "production" && statusCode === 500 ? null : error.errors || null;

  return errorResponse(res, message, statusCode, errors);
};
