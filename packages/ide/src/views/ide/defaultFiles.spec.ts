import { describe, expect, it } from "vitest";
import enIde from "@/i18n/locales/en/ide";
import esIde from "@/i18n/locales/es/ide";
import ptBrIde from "@/i18n/locales/pt-BR/ide";
import ptPtIde from "@/i18n/locales/pt-PT/ide";
import {
  createDefaultFiles,
  createLocaleSyncedDefaultFiles,
  DEFAULT_FILE_DEFINITIONS,
} from "./defaultFiles";

const localeFiles = [
  ptBrIde.files,
  ptPtIde.files,
  enIde.files,
  esIde.files,
];

describe("IDE default files", () => {
  it("defines the expected educational project paths", () => {
    expect(DEFAULT_FILE_DEFINITIONS).toContainEqual(
      expect.objectContaining({
        path: "src/grammar/token.?",
      }),
    );
    expect(DEFAULT_FILE_DEFINITIONS.map((file) => file.path)).toEqual([
      "src/grammar/token.?",
      "src/grammar/lexer.?",
      "src/grammar/expr.?",
      "src/grammar/stmt.?",
      "src/grammar/grammar.?",
      "src/parser/parser.?",
      "src/parser/ast.?",
      "src/semantics/types.?",
      "src/semantics/scope.?",
      "src/semantics/semantic.?",
      "src/ir/emitter.ts",
      "src/ir/interpreter.ts",
      "src/main.?",
      "tests/lexer.spec.ts",
      "README.md",
    ]);
  });

  it("does not define duplicated paths", () => {
    const paths = DEFAULT_FILE_DEFINITIONS.map((file) => file.path);

    expect(new Set(paths).size).toBe(paths.length);
  });

  it("uses keys that exist in every IDE locale", () => {
    DEFAULT_FILE_DEFINITIONS.forEach(({ intlKey }) => {
      localeFiles.forEach((files) => {
        expect(files).toHaveProperty(intlKey);
        expect(files[intlKey]).not.toHaveLength(0);
      });
    });
  });

  it("creates editor files from the selected locale content", () => {
    expect(createDefaultFiles(ptBrIde.files)).toContainEqual({
      path: "src/grammar/token.?",
      initialCode: ptBrIde.files.token,
    });
  });

  it("keeps file content locale-specific", () => {
    expect(ptBrIde.files.token).not.toBe(enIde.files.token);
    expect(esIde.files.token).not.toBe(enIde.files.token);
  });

  it("marks every default file except the main program as locale-synced", () => {
    const syncedPaths = createLocaleSyncedDefaultFiles(enIde.files).map(
      (file) => file.path,
    );

    expect(syncedPaths).not.toContain("src/main.?");
    expect(syncedPaths).toContain("src/grammar/token.?");
    expect(syncedPaths).toContain("README.md");
  });
});
