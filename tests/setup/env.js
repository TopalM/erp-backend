process.env.NODE_ENV = "test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-jwt-secret";
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";

process.env.FILE_STORAGE_PROVIDER = "LOCAL";
process.env.FILE_STORAGE_BASE_PATH = "PlastifayERPTest";
process.env.FILE_STORAGE_LOCAL_ROOT = "uploads/test-storage";

process.env.MAIL_HOST = process.env.MAIL_HOST || "localhost";
process.env.MAIL_PORT = process.env.MAIL_PORT || "1025";
process.env.MAIL_USER = process.env.MAIL_USER || "test";
process.env.MAIL_PASSWORD = process.env.MAIL_PASSWORD || "test";
process.env.MAIL_ADDRESS = process.env.MAIL_ADDRESS || "test@plastifay.com.tr";
process.env.MAIL_FROM_NAME = process.env.MAIL_FROM_NAME || "Plastifay Test";
process.env.CORS_ORIGINS = process.env.CORS_ORIGINS || "http://localhost:5173";
process.env.FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
