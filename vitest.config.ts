import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// `@/*` -> raiz do projeto (mesmo alias do tsconfig.json).
export default defineConfig({
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
    exclude: ["node_modules", ".next"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
});
