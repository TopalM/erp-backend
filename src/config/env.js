// Zorunlu environment variable kontrolü.
// Eğer ilgili değişken .env dosyasında yoksa uygulama başlatılmaz.
const requiredEnv = (key) => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

export const env = {
  // Uygulamanın çalışacağı port numarası
  port: Number(process.env.PORT || 5000),

  // Çalışma ortamı
  // development | test | production
  nodeEnv: process.env.NODE_ENV || "development",

  // PostgreSQL veritabanı ayarları
  postgres: {
    // Prisma tarafından kullanılan PostgreSQL bağlantı adresi
    databaseUrl: requiredEnv("DATABASE_URL"),
  },

  // JWT kimlik doğrulama ayarları
  jwt: {
    // JWT token imzalama anahtarı
    secret: requiredEnv("JWT_SECRET"),

    // JWT token geçerlilik süresi
    // Örnek: 1d, 7d, 30d
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  },

  // CORS ayarları
  cors: {
    // API'ye erişebilecek frontend adresleri
    origins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(",").map((origin) => origin.trim()) : [],
  },

  // Frontend uygulamasının adresi
  // Email doğrulama ve şifre sıfırlama linkleri oluşturulurken kullanılır.
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",

  // Dosya depolama sağlayıcısı
  // Şu an Yandex Disk kullanılıyor.
  // İleride AWS S3, MinIO veya Local Storage'a geçilebilir.
  fileStorage: {
    // Aktif dosya depolama provider'ı
    // LOCAL | YANDEX | GOOGLE_DRIVE | ONEDRIVE | S3 | MINIO
    provider: process.env.FILE_STORAGE_PROVIDER || "YANDEX",

    // ERP dosyalarının storage üzerindeki ana klasörü
    basePath: process.env.FILE_STORAGE_BASE_PATH || "/PlastifayERP",

    // Local provider kullanılırsa dosyaların tutulacağı ana klasör
    localRoot: process.env.FILE_STORAGE_LOCAL_ROOT || "uploads/storage",
  },

  // Mail sunucusu ayarları
  mail: {
    // SMTP sunucu adresi
    host: requiredEnv("MAIL_HOST"),

    // SMTP port numarası
    port: Number(process.env.MAIL_PORT || 587),

    // SSL/TLS kullanılsın mı?
    secure: process.env.MAIL_SECURE === "true",

    // SMTP kullanıcı adı
    user: requiredEnv("MAIL_USER"),

    // SMTP şifresi
    password: requiredEnv("MAIL_PASSWORD"),

    // Gönderici e-posta adresi
    address: requiredEnv("MAIL_ADDRESS"),

    // Mail gönderici adı
    fromName: process.env.MAIL_FROM_NAME || "Plastifay ERP",
  },

  // Yandex Disk ayarları
  yandexDisk: {
    // Yandex Disk API erişim tokenı
    token: process.env.YANDEX_DISK_TOKEN,

    // ERP dosyalarının tutulacağı ana klasör
    basePath: process.env.YANDEX_DISK_BASE_PATH || "/PlastifayERP",
  },
};
