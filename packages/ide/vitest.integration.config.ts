import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    include: [
      "src/tests/integration/**/*.spec.ts",
      "src/components/Ast.spec.tsx",
      "src/components/keyword-customizer/**/*.spec.ts",
      "src/components/keyword-customizer/**/*.spec.tsx",
      "src/features/**/*.spec.ts",
      "src/features/**/*.spec.tsx",
    ],
    environment: "node",
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
