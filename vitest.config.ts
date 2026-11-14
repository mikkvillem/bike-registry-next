import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: { include: ["tests/**/*.test.ts"], testTimeout: 30_000 },
  // Mirrors the "@/*" path alias in tsconfig.json, so modules under test can
  // import each other the same way the app does.
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
});
