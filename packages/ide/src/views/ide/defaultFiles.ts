import type { IdeFilesIntl } from "@/i18n/types/ide";

type IdeFileIntlKey = keyof IdeFilesIntl;

export const USER_PROGRAM_FILE_PATH = "src/main.?";

interface DefaultFileDefinition {
  path: string;
  intlKey: IdeFileIntlKey;
}

export const DEFAULT_FILE_DEFINITIONS = [
  {
    path: "src/grammar/token.?",
    intlKey: "token",
  },
  {
    path: "src/grammar/lexer.?",
    intlKey: "lexer",
  },
  {
    path: "src/grammar/expr.?",
    intlKey: "expr",
  },
  {
    path: "src/grammar/stmt.?",
    intlKey: "stmt",
  },
  {
    path: "src/grammar/grammar.?",
    intlKey: "grammar",
  },
  {
    path: "src/parser/parser.?",
    intlKey: "parser",
  },
  {
    path: "src/parser/ast.?",
    intlKey: "ast",
  },
  {
    path: "src/semantics/types.?",
    intlKey: "types",
  },
  {
    path: "src/semantics/scope.?",
    intlKey: "scope",
  },
  {
    path: "src/semantics/semantic.?",
    intlKey: "semantic",
  },
  {
    path: "src/ir/emitter.ts",
    intlKey: "emitter",
  },
  {
    path: "src/ir/interpreter.ts",
    intlKey: "interpreter",
  },
  {
    path: USER_PROGRAM_FILE_PATH,
    intlKey: "main",
  },
  {
    path: "tests/lexer.spec.ts",
    intlKey: "lexerSpec",
  },
  {
    path: "README.md",
    intlKey: "readme",
  },
] as const satisfies readonly DefaultFileDefinition[];

export function createDefaultFiles(intlFiles: IdeFilesIntl) {
  return DEFAULT_FILE_DEFINITIONS.map(({ path, intlKey }) => ({
    path,
    initialCode: intlFiles[intlKey],
  }));
}

export function createLocaleSyncedDefaultFiles(intlFiles: IdeFilesIntl) {
  return createDefaultFiles(intlFiles).filter(
    ({ path }) => path !== USER_PROGRAM_FILE_PATH,
  );
}
