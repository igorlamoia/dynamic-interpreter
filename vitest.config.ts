import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./packages/ide/src", import.meta.url)),
      "@ts-compilator-for-java/compiler/src": fileURLToPath(
        new URL("./packages/compiler/src", import.meta.url),
      ),
      "@ts-compilator-for-java/compiler": fileURLToPath(
        new URL("./packages/compiler/src", import.meta.url),
      ),
    },
  },
  test: {
    environment: "node",
    // O glob padrão do Vitest alcançaria os arquivos do Playwright em
    // packages/e2e. O sufixo .e2e.ts já os separa; este exclude é a
    // segunda barreira, para o caso de alguém criar um .spec.ts lá.
    exclude: ["**/node_modules/**", "**/dist/**", "packages/e2e/**"],
  },
});
