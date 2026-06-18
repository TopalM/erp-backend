import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,

    // Her testten önce çalışacak setup dosyası
    setupFiles: ["./tests/setup.js"],

    testTimeout: 30000,
  },
});
