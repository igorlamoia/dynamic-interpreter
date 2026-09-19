import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    // Todos os specs do IDE. Antes era uma lista fechada de caminhos, e 34 dos 62
    // arquivos nunca rodavam -- nem no `npm test` nem no CI -- e 44 testes
    // apodreceram sem ninguem ver. Spec novo agora entra automaticamente.
    include: ["src/**/*.spec.ts", "src/**/*.spec.tsx"],
    // Pendentes, e SO estes: specs do wizard de criacao de linguagem que ficaram
    // defasados apos os redesenhos da interface desde abril. Dependem de decisao
    // de produto (ver docs/superpowers/plans/2026-09-17-playwright-e2e-gate.md).
    // Remover daqui ao atualizar cada um.
    exclude: [
      "**/node_modules/**",
      "src/components/keyword-customizer.spec.tsx",
      "src/components/keyword-customizer/preview-panel.spec.tsx",
      "src/components/keyword-customizer/preview-data.spec.ts",
      "src/components/keyword-customizer/wizard-model.spec.ts",
      "src/components/keyword-customizer/keyword-customizer-validation.spec.ts",
      "src/components/keyword-customizer/steps/identity-step.spec.tsx",
      "src/components/keyword-customizer/steps/structure-step.spec.tsx",
      "src/components/keyword-customizer/steps/flow-step.spec.tsx",
    ],
    environment: "node",
    setupFiles: [
      "./src/test/setup-local-storage.ts",
      "./src/test/setup-jsdom-shims.ts",
    ],
    maxWorkers: 1,
  },
  resolve: {
    alias: [
      {
        find: "@",
        replacement: path.resolve(__dirname, "src"),
      },
      {
        find: /^@ts-compilator-for-java\/compiler\/src\//,
        replacement: path.resolve(__dirname, "../compiler/src") + "/",
      },
      {
        find: /^@ts-compilator-for-java\/compiler\//,
        replacement: path.resolve(__dirname, "../compiler/src") + "/",
      },
    ],
  },
});
