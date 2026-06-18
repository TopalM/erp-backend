import { AppError } from "../utils/appError.js";

// Request body verilerini Zod schema ile doğrular.
// Doğrulama başarılıysa parse edilmiş veriyi req.body içine yazar.
// Başarısız olursa detaylı validasyon hataları döndürür.
export const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      return next(new AppError("Gönderilen veriler doğrulanamadı.", 400, errors));
    }

    req.body = result.data;

    next();
  };
};
