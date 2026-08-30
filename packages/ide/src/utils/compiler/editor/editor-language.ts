import type * as monacoEditor from "monaco-editor";
import type {
  IDEBooleanLiteralMap,
  IDELanguageDocumentationMap,
  IDEOperatorWordMap,
} from "@/entities/compiler-config";
import type { StoredKeywordCustomization } from "@/contexts/keyword/types";
import { resolveDocumentationByLexeme } from "@/lib/language-documentation";
import { DEFAULT_BOOLEAN_LITERAL_MAP } from "@/lib/keyword-map";
import {
  JavaMMArrayMode,
  JavaMMBlockMode,
  JavaMMSnippetVariant,
  JavaMMTypingMode,
} from "./types";
import { KEYWORD_SNIPPETS } from "./keyword-snippets";

export const JAVAMM_LANGUAGE_ID = "java--";

export type JavaMMKeywordMapping = {
  original: string;
  custom: string;
  tokenId: number;
};

type JavaMMSemanticGroupName =
  | "types"
  | "conditionals"
  | "loops"
  | "flow"
  | "io";

export type JavaMMLanguageMetadata = {
  allKeywords: string[];
  operatorWords: string[];
  statementTerminators?: string[];
  blockDelimiters?: string[];
  semanticGroups: Record<JavaMMSemanticGroupName, string[]>;
};

export type JavaMMBlockDelimiters = {
  open: string;
  close: string;
};

export type JavaMMLanguageOptions = {
  blockMode?: "delimited" | "indentation";
  blockDelimiters?: JavaMMBlockDelimiters;
  operatorWordMap?: IDEOperatorWordMap;
  booleanLiteralMap?: IDEBooleanLiteralMap;
  languageDocumentation?: IDELanguageDocumentationMap;
  statementTerminatorLexeme?: string;
  typingMode?: "typed" | "untyped";
  arrayMode?: "fixed" | "dynamic";
};

const BUILT_IN_LITERAL_LABEL = "Literal booleano";

const DEFAULT_OPERATORS = [
  "=",
  ">",
  "<",
  "!",
  "==",
  "===",
  "<=",
  ">=",
  "!=",
  "&&",
  "||",
  "+",
  "-",
  "*",
  "/",
  "%",
  "+=",
  "-=",
  "*=",
  "/=",
  "%=",
  "++",
  "--",
  "**",
  "?",
  ":",
];

const WORD_LIKE_TERMINATOR = /^[A-Za-z_][A-Za-z0-9_]*$/;

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeStatementTerminators(
  statementTerminatorLexeme?: string,
): string[] {
  const terminators = [";"];
  const normalizedTerminator = statementTerminatorLexeme?.trim();

  if (normalizedTerminator) {
    terminators.push(normalizedTerminator);
  }

  return Array.from(new Set(terminators));
}

function buildStatementTerminatorRules(
  statementTerminators: string[] = [";"],
): [RegExp, string][] {
  return statementTerminators.map((terminator) => [
    WORD_LIKE_TERMINATOR.test(terminator)
      ? new RegExp(`\\b${escapeRegExp(terminator)}\\b`)
      : new RegExp(escapeRegExp(terminator)),
    "delimiter",
  ]);
}

function buildBlockDelimiterRules(
  blockDelimiters: string[] = [],
): [RegExp, string][] {
  return blockDelimiters.map((delimiter) => [
    new RegExp(`\\b${escapeRegExp(delimiter)}\\b`),
    "keyword.blockDelimiter",
  ]);
}

export function buildJavaMMMonarchLanguage(
  metadata: JavaMMLanguageMetadata,
): monacoEditor.languages.IMonarchLanguage {
  const statementTerminators = metadata.statementTerminators ?? [";"];
  const blockDelimiters = metadata.blockDelimiters ?? [];

  return {
    keywords: metadata.allKeywords,
    types: metadata.semanticGroups.types,
    conditionals: metadata.semanticGroups.conditionals,
    loops: metadata.semanticGroups.loops,
    flow: metadata.semanticGroups.flow,
    io: metadata.semanticGroups.io,
    blockDelimiters: metadata.blockDelimiters ?? [],
    operatorWords: metadata.operatorWords,
    operators: [...DEFAULT_OPERATORS, ...metadata.operatorWords],
    symbols: /[=><!~?:&|+\-*\/\^%]+/,
    tokenizer: {
      root: [
        ...buildStatementTerminatorRules(statementTerminators),
        ...buildBlockDelimiterRules(blockDelimiters),
        [
          /[a-zA-Z_]\w*(?=\s*\()/,
          {
            cases: {
              "@types": "keyword.type",
              "@conditionals": "keyword.conditional",
              "@loops": "keyword.loop",
              "@flow": "keyword.flow",
              "@io": "keyword.io",
              "@blockDelimiters": "keyword.blockDelimiter",
              "@operatorWords": "operator.word",
              "@keywords": "keyword",
              "@default": "entity.name.function",
            },
          },
        ],
        [
          /[a-zA-Z_]\w*/,
          {
            cases: {
              "@types": "keyword.type",
              "@conditionals": "keyword.conditional",
              "@loops": "keyword.loop",
              "@flow": "keyword.flow",
              "@io": "keyword.io",
              "@blockDelimiters": "keyword.blockDelimiter",
              "@operatorWords": "operator.word",
              "@keywords": "keyword",
              "@default": "identifier",
            },
          },
        ],
        { include: "@whitespace" },
        [/[{}()\[\]]/, "@brackets"],
        [/[<>](?!@symbols)/, "@brackets"],
        [/!+/, "operator"],
        [
          /@symbols/,
          {
            cases: {
              "@operators": "operator",
              "@default": "",
            },
          },
        ],
        [/\d*\.\d+([eE][\-+]?\d+)?/, "number.float"],
        [/0[xX][0-9a-fA-F]+/, "number.hex"],
        [/\d+/, "number"],
        [/"([^"\\]|\\.)*$/, "string.invalid"],
        [/"/, { token: "string.quote", bracket: "@open", next: "@string" }],
      ],

      string: [
        [/[^\\"]+/, "string"],
        [/\\./, "string.escape"],
        [/"/, { token: "string.quote", bracket: "@close", next: "@pop" }],
      ],

      whitespace: [
        [/[ \t\r\n]+/, "white"],
        [/\/\*/, "comment", "@comment"],
        [/\/\/.*$/, "comment"],
      ],

      comment: [
        [/[^\/*]+/, "comment"],
        [/\*\//, "comment", "@pop"],
        [/[\/*]/, "comment"],
      ],
    },
  };
}

export function buildJavaMMLanguageConfiguration(
  options: JavaMMLanguageOptions = {},
): monacoEditor.languages.LanguageConfiguration {
  const brackets: [string, string][] = [
    ["{", "}"],
    ["[", "]"],
    ["(", ")"],
  ];
  const autoClosingPairs: monacoEditor.languages.IAutoClosingPair[] = [
    { open: "{", close: "}" },
    { open: "[", close: "]" },
    { open: "(", close: ")" },
    { open: '"', close: '"' },
  ];
  const surroundingPairs: monacoEditor.languages.IAutoClosingPair[] = [
    { open: "{", close: "}" },
    { open: "[", close: "]" },
    { open: "(", close: ")" },
    { open: '"', close: '"' },
  ];
  const open = options.blockDelimiters?.open.trim();
  const close = options.blockDelimiters?.close.trim();

  if (options.blockMode === "delimited" && open && close) {
    brackets.push([open, close]);
    autoClosingPairs.push({ open, close });
    surroundingPairs.push({ open, close });
  }

  return {
    comments: {
      lineComment: "//",
      blockComment: ["/*", "*/"],
    },
    brackets,
    autoClosingPairs,
    surroundingPairs,
  };
}

const SEMANTIC_KEYWORD_GROUPS: Record<JavaMMSemanticGroupName, Set<string>> = {
  types: new Set([
    "int",
    "float",
    "bool",
    "string",
    "void",
    "variavel",
    "funcao",
  ]),
  conditionals: new Set(["if", "else", "switch", "case", "default"]),
  loops: new Set(["for", "while"]),
  flow: new Set(["break", "continue", "return"]),
  io: new Set(["print", "scan"]),
};

export function buildJavaMMLanguageMetadata(
  keywordMappings: JavaMMKeywordMapping[],
  operatorWordMap: IDEOperatorWordMap = {},
  booleanLiteralMap: IDEBooleanLiteralMap = DEFAULT_BOOLEAN_LITERAL_MAP,
  statementTerminatorLexeme?: string,
  blockDelimiters?: JavaMMBlockDelimiters,
): JavaMMLanguageMetadata {
  const semanticGroups: JavaMMLanguageMetadata["semanticGroups"] = {
    types: [],
    conditionals: [],
    loops: [],
    flow: [],
    io: [],
  };
  const normalizedBlockDelimiters = [
    blockDelimiters?.open?.trim(),
    blockDelimiters?.close?.trim(),
  ].filter((value): value is string => Boolean(value));
  const operatorWords = Array.from(
    new Set(
      Object.values(operatorWordMap)
        .map((value) => value?.trim())
        .filter((value): value is string => Boolean(value)),
    ),
  );

  const booleanLiterals = Array.from(
    new Set(
      Object.values({
        ...DEFAULT_BOOLEAN_LITERAL_MAP,
        ...booleanLiteralMap,
      })
        .map((value) => value?.trim())
        .filter((value): value is string => Boolean(value)),
    ),
  );

  for (const mapping of keywordMappings) {
    const customKeyword = mapping.custom.trim();
    if (!customKeyword) continue;

    for (const [groupName, originals] of Object.entries(
      SEMANTIC_KEYWORD_GROUPS,
    ) as [JavaMMSemanticGroupName, Set<string>][]) {
      if (originals.has(mapping.original)) {
        semanticGroups[groupName].push(customKeyword);
      }
    }
  }

  return {
    allKeywords: Array.from(
      new Set([
        ...keywordMappings
          .map((mapping) => mapping.custom.trim())
          .filter(Boolean),
        ...booleanLiterals,
      ]),
    ),
    operatorWords,
    statementTerminators: normalizeStatementTerminators(
      statementTerminatorLexeme,
    ),
    blockDelimiters: Array.from(new Set(normalizedBlockDelimiters)),
    semanticGroups,
  };
}

const SEMANTIC_GROUP_LABELS: Record<JavaMMSemanticGroupName, string> = {
  types: "Tipo",
  conditionals: "Condicional",
  loops: "Laço de repetição",
  flow: "Controle de fluxo",
  io: "Entrada/Saída",
};

function mapSnippetKeywords(
  snippetBody: string,
  keywordMappings: JavaMMKeywordMapping[],
): string {
  const mappingEntries = keywordMappings
    .map((m) => ({ original: m.original, custom: m.custom.trim() }))
    .filter((m) => Boolean(m.custom));

  if (!mappingEntries.length) return snippetBody;

  return mappingEntries.reduce((acc, item) => {
    const expression = new RegExp(`\\b${item.original}\\b`, "g");
    return acc.replace(expression, item.custom);
  }, snippetBody);
}

function isSnippetSupported(
  snippet: JavaMMSnippetVariant,
  typingMode: JavaMMTypingMode,
  blockMode: JavaMMBlockMode,
  arrayMode: JavaMMArrayMode,
): boolean {
  const supportsTyping =
    !snippet.typingMode || snippet.typingMode === typingMode;
  const supportsBlock = !snippet.blockMode || snippet.blockMode === blockMode;
  const supportsArray = !snippet.arrayMode || snippet.arrayMode === arrayMode;
  return supportsTyping && supportsBlock && supportsArray;
}

let completionProviderDisposable: monacoEditor.IDisposable | null = null;
let hoverProviderDisposable: monacoEditor.IDisposable | null = null;

const STANDARD_TOKEN_TYPE_COMMENT = 1;
const STANDARD_TOKEN_TYPE_STRING = 2;
const STANDARD_TOKEN_TYPE_REGEX = 4;

type LineTokensLike = {
  findTokenIndexAtOffset?: (offset: number) => number;
  getStandardTokenType?: (tokenIndex: number) => number;
};

type HoverableModelLike = {
  getLineTokens?: (lineNumber: number) => LineTokensLike | null | undefined;
};

function buildHoverCustomization(
  keywordMappings: JavaMMKeywordMapping[],
  options: JavaMMLanguageOptions,
): StoredKeywordCustomization {
  return {
    mappings: keywordMappings.map((mapping) => ({
      original: mapping.original,
      custom: mapping.custom,
      tokenId: mapping.tokenId,
    })),
    operatorWordMap: options.operatorWordMap ?? {},
    booleanLiteralMap: {
      ...DEFAULT_BOOLEAN_LITERAL_MAP,
      ...options.booleanLiteralMap,
    },
    statementTerminatorLexeme: options.statementTerminatorLexeme ?? "",
    blockDelimiters: {
      open: options.blockDelimiters?.open ?? "",
      close: options.blockDelimiters?.close ?? "",
    },
    modes: {
      semicolon: "optional-eol",
      block: options.blockMode ?? "delimited",
      typing: options.typingMode ?? "typed",
      array: options.arrayMode ?? "fixed",
    },
    languageDocumentation: options.languageDocumentation ?? {},
  };
}

function isNonCodeTokenType(tokenType: number | null | undefined): boolean {
  return (
    tokenType === STANDARD_TOKEN_TYPE_COMMENT ||
    tokenType === STANDARD_TOKEN_TYPE_STRING ||
    tokenType === STANDARD_TOKEN_TYPE_REGEX
  );
}

function shouldSuppressHoverForPosition(
  model: HoverableModelLike,
  position: { lineNumber: number; column: number },
): boolean {
  const getLineTokens = model.getLineTokens;
  if (typeof getLineTokens !== "function") return false;

  const lineTokens = getLineTokens(position.lineNumber);
  if (!lineTokens) return false;

  const findTokenIndexAtOffset = lineTokens.findTokenIndexAtOffset;
  const getStandardTokenType = lineTokens.getStandardTokenType;
  if (
    typeof findTokenIndexAtOffset !== "function" ||
    typeof getStandardTokenType !== "function"
  ) {
    return false;
  }

  const tokenIndex = findTokenIndexAtOffset(Math.max(position.column - 1, 0));
  if (typeof tokenIndex !== "number" || tokenIndex < 0) return false;

  return isNonCodeTokenType(getStandardTokenType(tokenIndex));
}

function isIdentifierCharacter(value: string | undefined): boolean {
  return Boolean(value && /[A-Za-z0-9_]/.test(value));
}

function isWordLikeLexeme(value: string): boolean {
  return /^[A-Za-z_][A-Za-z0-9_]*$/.test(value);
}

function buildHoverLexemes(
  keywordMappings: JavaMMKeywordMapping[],
  options: JavaMMLanguageOptions,
): string[] {
  const lexemes = [
    ...keywordMappings.map((mapping) => mapping.custom.trim()),
    ...Object.values(options.operatorWordMap ?? {}).map((value) =>
      value?.trim(),
    ),
    ...Object.values({
      ...DEFAULT_BOOLEAN_LITERAL_MAP,
      ...options.booleanLiteralMap,
    }).map((value) => value?.trim()),
    options.statementTerminatorLexeme?.trim(),
  ];

  if (options.blockMode !== "indentation") {
    lexemes.push(
      options.blockDelimiters?.open?.trim(),
      options.blockDelimiters?.close?.trim(),
    );
  }

  return Array.from(
    new Set(lexemes.filter((value): value is string => Boolean(value))),
  ).sort((left, right) => right.length - left.length);
}

function findHoveredLexeme(
  monaco: typeof monacoEditor,
  model: { getLineContent: (lineNumber: number) => string },
  position: { lineNumber: number; column: number },
  keywordMappings: JavaMMKeywordMapping[],
  options: JavaMMLanguageOptions,
) {
  const lineContent = model.getLineContent(position.lineNumber);
  const column = position.column;

  for (const lexeme of buildHoverLexemes(keywordMappings, options)) {
    let searchIndex = lineContent.indexOf(lexeme);

    while (searchIndex !== -1) {
      const startColumn = searchIndex + 1;
      const endColumn = startColumn + lexeme.length;
      const containsPosition = column >= startColumn && column < endColumn;
      const before = lineContent[searchIndex - 1];
      const after = lineContent[searchIndex + lexeme.length];
      const respectsBoundaries =
        !isWordLikeLexeme(lexeme) ||
        (!isIdentifierCharacter(before) && !isIdentifierCharacter(after));

      if (containsPosition && respectsBoundaries) {
        return {
          lexeme,
          range:
            typeof monaco.Range === "function"
              ? new monaco.Range(
                  position.lineNumber,
                  startColumn,
                  position.lineNumber,
                  endColumn,
                )
              : {
                  startLineNumber: position.lineNumber,
                  startColumn,
                  endLineNumber: position.lineNumber,
                  endColumn,
                },
        };
      }

      searchIndex = lineContent.indexOf(lexeme, searchIndex + 1);
    }
  }

  return null;
}

/**
 * Registra a linguagem Java-- no Monaco com um Monarch tokenizer.
 * As keywords customizáveis são recebidas como parâmetro para permitir atualização dinâmica.
 */
export function registerJavaMMLanguage(
  monaco: typeof monacoEditor,
  keywordMappings: JavaMMKeywordMapping[],
  options: JavaMMLanguageOptions = {},
) {
  // Registrar a linguagem apenas uma vez
  const languages = monaco.languages.getLanguages();
  if (!languages.some((lang) => lang.id === JAVAMM_LANGUAGE_ID)) {
    monaco.languages.register({ id: JAVAMM_LANGUAGE_ID });
  }

  const metadata = buildJavaMMLanguageMetadata(
    keywordMappings,
    options.operatorWordMap,
    options.booleanLiteralMap,
    options.statementTerminatorLexeme,
    options.blockDelimiters,
  );

  // (Re)definir o tokenizer Monarch
  monaco.languages.setMonarchTokensProvider(
    JAVAMM_LANGUAGE_ID,
    buildJavaMMMonarchLanguage(metadata),
  );

  // Configuração de linguagem (brackets, comentários, auto-close)
  monaco.languages.setLanguageConfiguration(
    JAVAMM_LANGUAGE_ID,
    buildJavaMMLanguageConfiguration(options),
  );

  // Dispose previous completion provider before registering a new one
  completionProviderDisposable?.dispose();
  if (typeof monaco.languages.registerCompletionItemProvider === "function") {
    completionProviderDisposable =
      monaco.languages.registerCompletionItemProvider(JAVAMM_LANGUAGE_ID, {
        provideCompletionItems(model, position) {
          const preferredTypingMode: JavaMMTypingMode =
            options.typingMode ?? "typed";
          const preferredBlockMode: JavaMMBlockMode =
            options.blockMode ?? "delimited";
          const word = model.getWordUntilPosition(position);
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn,
          };

          const suggestions: monacoEditor.languages.CompletionItem[] = [];
          const preferredArrayMode: JavaMMArrayMode =
            options.arrayMode ?? "fixed";

          for (const mapping of keywordMappings) {
            const keyword = mapping.custom.trim();
            if (!keyword) continue;

            let groupLabel = "Palavra-chave";
            for (const [groupName, originals] of Object.entries(
              SEMANTIC_KEYWORD_GROUPS,
            ) as [JavaMMSemanticGroupName, Set<string>][]) {
              if (originals.has(mapping.original)) {
                groupLabel = SEMANTIC_GROUP_LABELS[groupName];
                break;
              }
            }

            // Keyword completion
            suggestions.push({
              label: keyword,
              kind: monaco.languages.CompletionItemKind.Keyword,
              detail: groupLabel,
              insertText: keyword,
              range,
            });

            // Snippet completion (multiple typed/untyped + block-mode variants)
            const snippets = KEYWORD_SNIPPETS[mapping.original] ?? [];
            for (const snippet of snippets) {
              if (
                !isSnippetSupported(
                  snippet,
                  preferredTypingMode,
                  preferredBlockMode,
                  preferredArrayMode,
                )
              ) {
                continue;
              }

              const customBody = mapSnippetKeywords(
                snippet.body,
                keywordMappings,
              );
              const suffix = snippet.labelSuffix
                ? ` (${snippet.labelSuffix})`
                : "";
              suggestions.push({
                label: `${keyword}…${suffix}`,
                kind: monaco.languages.CompletionItemKind.Snippet,
                detail: snippet.description,
                documentation: customBody,
                insertText: customBody,
                insertTextRules:
                  monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                range,
              });
            }
          }

          // Add operator word completions
          const metadata = buildJavaMMLanguageMetadata(
            keywordMappings,
            options.operatorWordMap,
            options.booleanLiteralMap,
            options.statementTerminatorLexeme,
            options.blockDelimiters,
          );
          for (const operatorWord of metadata.operatorWords) {
            suggestions.push({
              label: operatorWord,
              kind: monaco.languages.CompletionItemKind.Operator,
              detail: "Operador",
              insertText: operatorWord,
              range,
            });
          }

          const booleanLiterals = Array.from(
            new Set(
              Object.values({
                ...DEFAULT_BOOLEAN_LITERAL_MAP,
                ...options.booleanLiteralMap,
              })
                .map((value) => value?.trim())
                .filter((value): value is string => Boolean(value)),
            ),
          );

          for (const literal of booleanLiterals) {
            suggestions.push({
              label: literal,
              kind:
                monaco.languages.CompletionItemKind.Value ??
                monaco.languages.CompletionItemKind.Keyword,
              detail: BUILT_IN_LITERAL_LABEL,
              insertText: literal,
              range,
            });
          }

          return { suggestions };
        },
      });
  } else {
    completionProviderDisposable = null;
  }

  hoverProviderDisposable?.dispose();
  if (typeof monaco.languages.registerHoverProvider === "function") {
    hoverProviderDisposable = monaco.languages.registerHoverProvider(
      JAVAMM_LANGUAGE_ID,
      {
        provideHover(model, position) {
          if (shouldSuppressHoverForPosition(model as HoverableModelLike, position)) {
            return null;
          }

          const hovered = findHoveredLexeme(
            monaco,
            model,
            position,
            keywordMappings,
            options,
          );
          if (!hovered) return null;

          const entry = resolveDocumentationByLexeme(
            hovered.lexeme,
            buildHoverCustomization(keywordMappings, options),
          );
          if (!entry) return null;

          return {
            range: hovered.range,
            contents: [
              { value: `**${entry.lexeme}**` },
              { value: `*${entry.category}*` },
              {
                value: `${entry.description}\n\nExemplo inline: \`${entry.lexeme}\`\n\n\
\
\
\
\`\`\`java--\n${entry.lexeme}();\n\`\`\`\n\n[Monaco Markdown Guide](https://github.com/microsoft/monaco-editor/blob/main/CHANGELOG.md)`,
              },
            ],
          };
        },
      },
    );
  } else {
    hoverProviderDisposable = null;
  }
}

/**
 * Atualiza apenas o tokenizer (keywords) sem re-registrar a linguagem inteira.
 * Chamado quando o usuário altera as keywords customizadas.
 */
export function updateJavaMMKeywords(
  monaco: typeof monacoEditor,
  keywordMappings: JavaMMKeywordMapping[],
  options: JavaMMLanguageOptions = {},
) {
  registerJavaMMLanguage(monaco, keywordMappings, options);
}
