import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";

import { env } from "./config/env.js";
import routes from "./routes/index.js";
import { globalErrorHandler, notFoundHandler } from "./middlewares/error.middleware.js";
import { successResponse } from "./utils/apiResponse.js";

const app = express();

app.set("trust proxy", 1);
// Temel güvenlik headerlarını ekler.
// XSS, clickjacking, MIME sniffing gibi bazı yaygın saldırılara karşı koruma sağlar.
app.use(helmet());

// Development ortamında HTTP request loglarını konsola basar.
if (env.nodeEnv === "development") {
  app.use(morgan("dev"));
}

// CORS ayarları.
// Frontend uygulamasının backend API'ye erişmesini sağlar.
app.use(
  cors({
    origin: env.cors.origins.length > 0 ? env.cors.origins : true,
    credentials: true,
  }),
);

// JSON request body limitini belirler.
// Büyük payload saldırılarını engellemek için limit düşük tutulur.
app.use(express.json({ limit: "1mb" }));

// Genel rate limit.
// Tüm API istekleri için temel istek sınırı uygular.
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.nodeEnv === "development" ? 2000 : 500,
  skip: (req) => req.method === "OPTIONS",
  message: {
    success: false,
    message: "Çok fazla istek gönderildi. Lütfen daha sonra tekrar deneyin.",
    errors: null,
  },
});

// Login rate limit.
// Brute-force saldırılarını azaltmak için login endpointine özel daha düşük limit uygular.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.nodeEnv === "development" ? 100 : 10,
  skip: (req) => req.method === "OPTIONS",
  message: {
    success: false,
    message: "Çok fazla giriş denemesi yapıldı. Lütfen daha sonra tekrar deneyin.",
    errors: null,
  },
});

// Register rate limit.
// Kötüye kullanımı engellemek için kayıt endpointine özel limit uygular.
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: env.nodeEnv === "development" ? 50 : 5,
  skip: (req) => req.method === "OPTIONS",
  message: {
    success: false,
    message: "Çok fazla kayıt denemesi yapıldı. Lütfen daha sonra tekrar deneyin.",
    errors: null,
  },
});

// Sistem sağlık kontrol endpointi.
// Deployment, monitoring veya uptime servisleri tarafından kullanılabilir.
app.get("/health", (req, res) => {
  return successResponse(res, {
    service: "Plastifay ERP API",
    database: "PostgreSQL",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

// Lokal upload dosyalarını statik olarak servis eder.
// Yandex Disk kullanılacaksa bu alan geçici/local dosya görüntüleme için kalabilir.
app.use(
  "/uploads",
  (req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static("uploads"),
);

// Auth endpointlerine özel rate limitler.
app.use("/api/auth/login", loginLimiter);
app.use("/api/auth/register", registerLimiter);

// Tüm API route'larına genel rate limit uygulanır.
app.use("/api", generalLimiter, routes);

// Tanımlı olmayan route'lar için 404 handler.
app.use(notFoundHandler);

// Tüm hataları merkezi olarak yakalayan global error handler.
app.use(globalErrorHandler);

export default app;
