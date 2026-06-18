import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// `@/*` -> raiz do projeto (mesmo alias do tsconfig.json).
export default defineConfig({
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
    exclude: ["node_modules", ".next"],
  },
  // O tsconfig do Next usa `jsx: "preserve"`. A partir do Vitest 4 (Vite 8, que
  // transforma via oxc), o transform respeita essa opção e deixa o JSX intacto
  // ao importar arquivos .tsx nos testes, gerando "invalid JS syntax". Forçamos
  // o runtime automático do JSX (React 19) apenas no transform de teste.
  oxc: {
    jsx: {
      runtime: "automatic",
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
});
