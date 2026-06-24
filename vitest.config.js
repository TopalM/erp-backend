import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ["./tests/setup.js"],
    testTimeout: 30000,

    fileParallelism: false,
    sequence: {
      concurrent: false,
      shuffle: false,
    },

    pool: "forks",
    maxWorkers: 1,
    isolate: false,

    coverage: {
      provider: "v8",

      reporter: ["text", "html"],

      exclude: [
        "node_modules/**",

        // test dosyaları
        "tests/**",

        // seed dosyaları
        "src/seed/**",

        // entrypoint dosyaları (isteğe bağlı)
        "src/server.js",
      ],
    },
  },
});
