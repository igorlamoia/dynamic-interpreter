import { describe, expect, it, vi } from "vitest";
import {
  buildJavaMMLanguageMetadata,
  buildJavaMMMonarchLanguage,
  registerJavaMMLanguage,
} from "@/utils/compiler/editor/editor-language";

function getDelimiterRules(
  language: ReturnType<typeof buildJavaMMMonarchLanguage>,
) {
  return language.tokenizer.root
    .filter(
      (rule): rule is [RegExp, string] =>
        Array.isArray(rule) && rule[1] === "delimiter",
    )
    .map(([pattern]) => pattern);
}

describe("buildJavaMMLanguageMetadata", () => {
  it("recognizes ternary punctuation as operators", () => {
    const language = buildJavaMMMonarchLanguage({
      allKeywords: [],
      operatorWords: [],
      semanticGroups: { types: [], conditionals: [], loops: [], flow: [], io: [] },
    });

    expect(language.operators).toEqual(expect.arrayContaining(["?", ":"]));
  });

  it("recognizes strict equality as an editor operator", () => {
    const language = buildJavaMMMonarchLanguage({
      allKeywords: [],
      operatorWords: [],
      semanticGroups: { types: [], conditionals: [], loops: [], flow: [], io: [] },
    });

    expect(language.operators).toContain("===");
    expect(language.operators).not.toContain("====");
  });

  it("maps customized words into semantic keyword groups", () => {
    const metadata = buildJavaMMLanguageMetadata([
      { original: "if", custom: "se", tokenId: 28 },
      { original: "while", custom: "enquanto", tokenId: 25 },
      { original: "int", custom: "inteiro", tokenId: 21 },
      { original: "bool", custom: "logico", tokenId: 55 },
      { original: "print", custom: "escreva", tokenId: 33 },
    ]);

    expect(metadata.allKeywords).toEqual(
      expect.arrayContaining([
        "se",
        "enquanto",
        "inteiro",
        "logico",
        "escreva",
      ]),
    );
    expect(metadata.semanticGroups.conditionals).toContain("se");
    expect(metadata.semanticGroups.loops).toContain("enquanto");
    expect(metadata.semanticGroups.types).toContain("inteiro");
    expect(metadata.semanticGroups.types).toContain("logico");
    expect(metadata.semanticGroups.io).toContain("escreva");
  });

  it("includes built-in boolean literals in metadata", () => {
    const metadata = buildJavaMMLanguageMetadata([
      { original: "bool", custom: "bool", tokenId: 55 },
    ]);

    expect(metadata.allKeywords).toEqual(
      expect.arrayContaining(["bool", "true", "false"]),
    );
  });

  it("uses configured boolean literals in metadata instead of the built-in defaults", () => {
    const metadata = buildJavaMMLanguageMetadata(
      [{ original: "bool", custom: "bool", tokenId: 55 }],
      {},
      { true: "yes", false: "no" },
    );

    expect(metadata.allKeywords).toEqual(
      expect.arrayContaining(["bool", "yes", "no"]),
    );
    expect(metadata.allKeywords).not.toEqual(
      expect.arrayContaining(["true", "false"]),
    );
  });

  it("includes a configured statement terminator in metadata", () => {
    const metadata = buildJavaMMLanguageMetadata(
      [{ original: "if", custom: "if", tokenId: 28 }],
      {},
      undefined,
      "uai",
    );

    expect(metadata.statementTerminators).toEqual([";", "uai"]);
  });

  it("assigns semantic Monaco token classes", () => {
    const metadata = buildJavaMMLanguageMetadata([
      { original: "if", custom: "se", tokenId: 28 },
      { original: "while", custom: "enquanto", tokenId: 25 },
      { original: "int", custom: "inteiro", tokenId: 21 },
    ]);

    const language = buildJavaMMMonarchLanguage(metadata);
    const rootTokenizer = language.tokenizer.root.find(
      (rule): rule is [RegExp, { cases: Record<string, string> }] =>
        Array.isArray(rule) &&
        typeof rule[1] === "object" &&
        rule[1] !== null &&
        "cases" in rule[1],
    );

    if (!rootTokenizer || !("cases" in rootTokenizer[1])) {
      throw new Error("Unexpected Monarch tokenizer shape");
    }

    expect(rootTokenizer[1].cases["@conditionals"]).toBe("keyword.conditional");
    expect(rootTokenizer[1].cases["@loops"]).toBe("keyword.loop");
    expect(rootTokenizer[1].cases["@types"]).toBe("keyword.type");
  });

  it("assigns a Monaco token class to custom block delimiters", () => {
    const language = buildJavaMMMonarchLanguage({
      allKeywords: [],
      operatorWords: [],
      statementTerminators: [";"],
      blockDelimiters: ["inicio", "fim"],
      semanticGroups: {
        types: [],
        conditionals: [],
        loops: [],
        flow: [],
        io: [],
      },
    });

    const rootTokenizer = language.tokenizer.root.find(
      (rule): rule is [RegExp, { cases: Record<string, string> }] =>
        Array.isArray(rule) &&
        typeof rule[1] === "object" &&
        rule[1] !== null &&
        "cases" in rule[1],
    );

    if (!rootTokenizer || !("cases" in rootTokenizer[1])) {
      throw new Error("Unexpected Monarch tokenizer shape");
    }

    expect(rootTokenizer[1].cases["@blockDelimiters"]).toBe(
      "keyword.blockDelimiter",
    );
  });

  it("classifies non-keyword identifiers followed by parenthesis as functions", () => {
    const language = buildJavaMMMonarchLanguage({
      allKeywords: ["if", "print"],
      operatorWords: [],
      statementTerminators: [";"],
      semanticGroups: {
        types: ["int", "void"],
        conditionals: ["if"],
        loops: [],
        flow: [],
        io: ["print"],
      },
    });

    const functionRule = language.tokenizer.root.find(
      (rule): rule is [RegExp, { cases: Record<string, string> }] =>
        Array.isArray(rule) &&
        rule[0] instanceof RegExp &&
        String(rule[0]) === "/[a-zA-Z_]\\w*(?=\\s*\\()/" &&
        typeof rule[1] === "object" &&
        rule[1] !== null &&
        "cases" in rule[1],
    );

    if (!functionRule || !("cases" in functionRule[1])) {
      throw new Error("Function-aware tokenizer rule not found");
    }

    expect(functionRule[1].cases["@default"]).toBe("entity.name.function");
    expect(functionRule[1].cases["@conditionals"]).toBe("keyword.conditional");
    expect(functionRule[1].cases["@io"]).toBe("keyword.io");
  });

  it("highlights only semicolon and configured word-like terminators", () => {
    const language = buildJavaMMMonarchLanguage({
      allKeywords: [],
      operatorWords: [],
      statementTerminators: [";", "uai", "_uai"],
      semanticGroups: {
        types: [],
        conditionals: [],
        loops: [],
        flow: [],
        io: [],
      },
    });

    const delimiterRules = getDelimiterRules(language);

    expect(delimiterRules.some((rule) => rule.test(";"))).toBe(true);
    expect(delimiterRules.some((rule) => rule.test("uai"))).toBe(true);
    expect(delimiterRules.some((rule) => rule.test("_uai"))).toBe(true);
    expect(delimiterRules.some((rule) => rule.test("uai123"))).toBe(false);
    expect(delimiterRules.some((rule) => rule.test(","))).toBe(false);
    expect(delimiterRules.some((rule) => rule.test("."))).toBe(false);
  });

  it("preserves semantic meaning after keyword customization", () => {
    const monaco = {
      languages: {
        getLanguages: () => [],
        register: vi.fn(),
        setMonarchTokensProvider: vi.fn(),
        setLanguageConfiguration: vi.fn(),
      },
    };

    registerJavaMMLanguage(
      monaco as never,
      [
        { original: "return", custom: "retorne", tokenId: 30 },
        { original: "scan", custom: "leia", tokenId: 35 },
        { original: "switch", custom: "escolha", tokenId: 50 },
      ] as never,
    );

    const language =
      monaco.languages.setMonarchTokensProvider.mock.calls[0]?.[1];

    expect(language.flow).toContain("retorne");
    expect(language.io).toContain("leia");
    expect(language.conditionals).toContain("escolha");
  });

  it("forwards a configured statement terminator into Monaco registration", () => {
    const monaco = {
      languages: {
        getLanguages: () => [],
        register: vi.fn(),
        setMonarchTokensProvider: vi.fn(),
        setLanguageConfiguration: vi.fn(),
      },
    };

    registerJavaMMLanguage(
      monaco as never,
      [{ original: "if", custom: "if", tokenId: 28 }] as never,
      {
        statementTerminatorLexeme: "uai",
      } as never,
    );

    const language =
      monaco.languages.setMonarchTokensProvider.mock.calls[0]?.[1];
    const delimiterRules = getDelimiterRules(language);

    expect(delimiterRules.some((rule) => rule.test("uai"))).toBe(true);
    expect(delimiterRules.some((rule) => rule.test("uai123"))).toBe(false);
  });

  it("highlights repeated logical negation operators", () => {
    const language = buildJavaMMMonarchLanguage({
      allKeywords: [],
      operatorWords: [],
      statementTerminators: [";"],
      semanticGroups: {
        types: [],
        conditionals: [],
        loops: [],
        flow: [],
        io: [],
      },
    });

    const hasRepeatedNotRule = language.tokenizer.root.some(
      (rule) =>
        Array.isArray(rule) &&
        rule[0] instanceof RegExp &&
        String(rule[0]) === "/!+/" &&
        rule[1] === "operator",
    );

    expect(hasRepeatedNotRule).toBe(true);
  });

  it("includes configured operator aliases in Monarch operators", () => {
    const metadata = buildJavaMMLanguageMetadata(
      [{ original: "if", custom: "if", tokenId: 28 }],
      { logical_and: "and", less_equal: "less_equal" },
    );

    expect(metadata.operatorWords).toEqual(
      expect.arrayContaining(["and", "less_equal"]),
    );
  });

  it("registers operator alias words in the Monaco language", () => {
    const monaco = {
      languages: {
        getLanguages: () => [],
        register: vi.fn(),
        setMonarchTokensProvider: vi.fn(),
        setLanguageConfiguration: vi.fn(),
      },
    };

    registerJavaMMLanguage(
      monaco as never,
      [{ original: "if", custom: "if", tokenId: 28 }] as never,
      {
        operatorWordMap: { logical_and: "and" },
      } as never,
    );

    const language =
      monaco.languages.setMonarchTokensProvider.mock.calls[0]?.[1];

    expect(language.operators).toContain("and");
  });

  it("uses custom block delimiters in Monaco language configuration", () => {
    const monaco = {
      languages: {
        getLanguages: () => [],
        register: vi.fn(),
        setMonarchTokensProvider: vi.fn(),
        setLanguageConfiguration: vi.fn(),
      },
    };

    registerJavaMMLanguage(
      monaco as never,
      [{ original: "if", custom: "se", tokenId: 28 }] as never,
      {
        blockMode: "delimited",
        blockDelimiters: { open: "inicio", close: "fim" },
      } as never,
    );

    const config = monaco.languages.setLanguageConfiguration.mock.calls[0]?.[1];

    expect(config.brackets).toContainEqual(["inicio", "fim"]);
    expect(config.autoClosingPairs).toContainEqual({
      open: "inicio",
      close: "fim",
    });
    expect(config.surroundingPairs).toContainEqual({
      open: "inicio",
      close: "fim",
    });
  });

  it("forwards custom block delimiters into Monaco token metadata", () => {
    const monaco = {
      languages: {
        getLanguages: () => [],
        register: vi.fn(),
        setMonarchTokensProvider: vi.fn(),
        setLanguageConfiguration: vi.fn(),
      },
    };

    registerJavaMMLanguage(
      monaco as never,
      [{ original: "if", custom: "se", tokenId: 28 }] as never,
      {
        blockMode: "delimited",
        blockDelimiters: { open: "inicio", close: "fim" },
      } as never,
    );

    const language =
      monaco.languages.setMonarchTokensProvider.mock.calls[0]?.[1];
    expect(language.blockDelimiters).toEqual(["inicio", "fim"]);
    const blockDelimiterRules = language.tokenizer.root
      .filter(
        (rule): rule is [RegExp, string] =>
          Array.isArray(rule) && rule[1] === "keyword.blockDelimiter",
      )
      .map(([pattern]) => pattern);

    expect(blockDelimiterRules.some((rule) => rule.test("inicio"))).toBe(true);
    expect(blockDelimiterRules.some((rule) => rule.test("fim"))).toBe(true);
  });

  it("offers configured boolean literals in autocomplete", () => {
    const registerCompletionItemProvider = vi.fn(() => ({
      dispose: vi.fn(),
    }));
    const monaco = {
      languages: {
        getLanguages: () => [],
        register: vi.fn(),
        setMonarchTokensProvider: vi.fn(),
        setLanguageConfiguration: vi.fn(),
        registerCompletionItemProvider,
        CompletionItemKind: {
          Keyword: 1,
          Snippet: 2,
          Operator: 3,
          Value: 4,
        },
        CompletionItemInsertTextRule: {
          InsertAsSnippet: 4,
        },
      },
    };

    registerJavaMMLanguage(
      monaco as never,
      [{ original: "bool", custom: "bool", tokenId: 55 }] as never,
      {
        booleanLiteralMap: { true: "yes", false: "no" },
        typingMode: "typed",
        blockMode: "delimited",
        arrayMode: "fixed",
      } as never,
    );

    const provider = registerCompletionItemProvider.mock.calls[0]?.[1];
    const result = provider.provideCompletionItems(
      {
        getWordUntilPosition: () => ({
          startColumn: 1,
          endColumn: 1,
        }),
      },
      { lineNumber: 1, column: 1 },
    );

    const labels = result.suggestions.map(
      (suggestion: { label: string }) => suggestion.label,
    );

    expect(labels).toEqual(expect.arrayContaining(["yes", "no"]));
    expect(labels).not.toEqual(expect.arrayContaining(["true", "false"]));
  });

  it("filters typed fixed array snippets by array mode", () => {
    const registerCompletionItemProvider = vi.fn(() => ({
      dispose: vi.fn(),
    }));
    const monaco = {
      languages: {
        getLanguages: () => [],
        register: vi.fn(),
        setMonarchTokensProvider: vi.fn(),
        setLanguageConfiguration: vi.fn(),
        registerCompletionItemProvider,
        CompletionItemKind: {
          Keyword: 1,
          Snippet: 2,
          Operator: 3,
        },
        CompletionItemInsertTextRule: {
          InsertAsSnippet: 4,
        },
      },
    };

    registerJavaMMLanguage(
      monaco as never,
      [{ original: "int", custom: "int", tokenId: 21 }] as never,
      {
        typingMode: "typed",
        blockMode: "delimited",
        arrayMode: "fixed",
      } as never,
    );

    const provider = registerCompletionItemProvider.mock.calls[0]?.[1];
    const result = provider.provideCompletionItems(
      {
        getWordUntilPosition: () => ({
          startColumn: 1,
          endColumn: 1,
        }),
      },
      { lineNumber: 1, column: 1 },
    );

    const suggestionTexts = result.suggestions.map(
      (suggestion: { insertText: string }) => suggestion.insertText,
    );

    expect(suggestionTexts).toContain("int ${1:vetor}[${2:10}];");
    expect(suggestionTexts).toContain("int ${1:matriz}[${2:3}][${3:3}];");
    expect(suggestionTexts).not.toContain("int ${1:vetor}[];");
    expect(suggestionTexts).not.toContain("int ${1:matriz}[][];");
  });

  it("filters typed dynamic array snippets by array mode", () => {
    const registerCompletionItemProvider = vi.fn(() => ({
      dispose: vi.fn(),
    }));
    const monaco = {
      languages: {
        getLanguages: () => [],
        register: vi.fn(),
        setMonarchTokensProvider: vi.fn(),
        setLanguageConfiguration: vi.fn(),
        registerCompletionItemProvider,
        CompletionItemKind: {
          Keyword: 1,
          Snippet: 2,
          Operator: 3,
        },
        CompletionItemInsertTextRule: {
          InsertAsSnippet: 4,
        },
      },
    };

    registerJavaMMLanguage(
      monaco as never,
      [{ original: "int", custom: "int", tokenId: 21 }] as never,
      {
        typingMode: "typed",
        blockMode: "delimited",
        arrayMode: "dynamic",
      } as never,
    );

    const provider = registerCompletionItemProvider.mock.calls[0]?.[1];
    const result = provider.provideCompletionItems(
      {
        getWordUntilPosition: () => ({
          startColumn: 1,
          endColumn: 1,
        }),
      },
      { lineNumber: 1, column: 1 },
    );

    const suggestionTexts = result.suggestions.map(
      (suggestion: { insertText: string }) => suggestion.insertText,
    );

    expect(suggestionTexts).toContain("int ${1:vetor}[];");
    expect(suggestionTexts).toContain("int ${1:matriz}[][];");
    expect(suggestionTexts).not.toContain("int ${1:vetor}[${2:10}];");
  });

  it("shows untyped fixed array snippets in fixed mode", () => {
    const registerCompletionItemProvider = vi.fn(() => ({
      dispose: vi.fn(),
    }));
    const monaco = {
      languages: {
        getLanguages: () => [],
        register: vi.fn(),
        setMonarchTokensProvider: vi.fn(),
        setLanguageConfiguration: vi.fn(),
        registerCompletionItemProvider,
        CompletionItemKind: {
          Keyword: 1,
          Snippet: 2,
          Operator: 3,
        },
        CompletionItemInsertTextRule: {
          InsertAsSnippet: 4,
        },
      },
    };

    registerJavaMMLanguage(
      monaco as never,
      [
        { original: "int", custom: "int", tokenId: 21 },
        { original: "variavel", custom: "variavel", tokenId: 62 },
      ] as never,
      {
        typingMode: "untyped",
        blockMode: "delimited",
        arrayMode: "fixed",
      } as never,
    );

    const provider = registerCompletionItemProvider.mock.calls[0]?.[1];
    const result = provider.provideCompletionItems(
      {
        getWordUntilPosition: () => ({
          startColumn: 1,
          endColumn: 1,
        }),
      },
      { lineNumber: 1, column: 1 },
    );

    const suggestionTexts = result.suggestions.map(
      (suggestion: { insertText: string }) => suggestion.insertText,
    );

    expect(suggestionTexts).toContain("${1:lista}[${2:10}] = [];");
    expect(suggestionTexts).not.toContain("${1:lista}[] = [];");
  });

  it("shows only dynamic array snippets in untyped dynamic mode", () => {
    const registerCompletionItemProvider = vi.fn(() => ({
      dispose: vi.fn(),
    }));
    const monaco = {
      languages: {
        getLanguages: () => [],
        register: vi.fn(),
        setMonarchTokensProvider: vi.fn(),
        setLanguageConfiguration: vi.fn(),
        registerCompletionItemProvider,
        CompletionItemKind: {
          Keyword: 1,
          Snippet: 2,
          Operator: 3,
        },
        CompletionItemInsertTextRule: {
          InsertAsSnippet: 4,
        },
      },
    };

    registerJavaMMLanguage(
      monaco as never,
      [
        { original: "int", custom: "int", tokenId: 21 },
        { original: "variavel", custom: "variavel", tokenId: 62 },
      ] as never,
      {
        typingMode: "untyped",
        blockMode: "delimited",
        arrayMode: "dynamic",
      } as never,
    );

    const provider = registerCompletionItemProvider.mock.calls[0]?.[1];
    const result = provider.provideCompletionItems(
      {
        getWordUntilPosition: () => ({
          startColumn: 1,
          endColumn: 1,
        }),
      },
      { lineNumber: 1, column: 1 },
    );

    const suggestionTexts = result.suggestions.map(
      (suggestion: { insertText: string }) => suggestion.insertText,
    );

    expect(suggestionTexts).toContain("${1:lista}[] = [];");
    expect(suggestionTexts).not.toContain("${1:lista}[${2:10}] = [];");
    expect(suggestionTexts).not.toContain("int ${1:vetor}[${2:10}];");
  });

  it("registers a hover provider that returns title, category, and description", () => {
    const registerCompletionItemProvider = vi.fn(() => ({
      dispose: vi.fn(),
    }));
    const registerHoverProvider = vi.fn(() => ({
      dispose: vi.fn(),
    }));
    const monaco = {
      Range: class {
        constructor(
          public startLineNumber: number,
          public startColumn: number,
          public endLineNumber: number,
          public endColumn: number,
        ) {}
      },
      languages: {
        getLanguages: () => [],
        register: vi.fn(),
        setMonarchTokensProvider: vi.fn(),
        setLanguageConfiguration: vi.fn(),
        registerCompletionItemProvider,
        registerHoverProvider,
        CompletionItemKind: {
          Keyword: 1,
          Snippet: 2,
          Operator: 3,
          Value: 4,
        },
        CompletionItemInsertTextRule: {
          InsertAsSnippet: 4,
        },
      },
    };

    registerJavaMMLanguage(
      monaco as never,
      [{ original: "print", custom: "mostrar", tokenId: 33 }] as never,
      {
        languageDocumentation: {
          "keyword.print": { description: "Exibe valores na saída." },
        },
      } as never,
    );

    const provider = registerHoverProvider.mock.calls[0]?.[1];
    const result = provider.provideHover(
      {
        getLineContent: () => 'mostrar("oi")',
      },
      { lineNumber: 1, column: 3 },
    );

    expect(result.contents[0].value).toContain("mostrar");
    expect(result.contents[1].value).toContain("Entrada/Saída");
    expect(result.contents[2].value).toContain("Exibe valores na saída.");
  });

  it("does not return semantic hover for lexemes inside strings or comments", () => {
    const registerCompletionItemProvider = vi.fn(() => ({
      dispose: vi.fn(),
    }));
    const registerHoverProvider = vi.fn(() => ({
      dispose: vi.fn(),
    }));
    const monaco = {
      Range: class {
        constructor(
          public startLineNumber: number,
          public startColumn: number,
          public endLineNumber: number,
          public endColumn: number,
        ) {}
      },
      languages: {
        getLanguages: () => [],
        register: vi.fn(),
        setMonarchTokensProvider: vi.fn(),
        setLanguageConfiguration: vi.fn(),
        registerCompletionItemProvider,
        registerHoverProvider,
        CompletionItemKind: {
          Keyword: 1,
          Snippet: 2,
          Operator: 3,
          Value: 4,
        },
        CompletionItemInsertTextRule: {
          InsertAsSnippet: 4,
        },
      },
    };

    registerJavaMMLanguage(
      monaco as never,
      [{ original: "print", custom: "mostrar", tokenId: 33 }] as never,
      {
        languageDocumentation: {
          "keyword.print": { description: "Exibe valores na saída." },
        },
      } as never,
    );

    const provider = registerHoverProvider.mock.calls[0]?.[1];
    const stringHover = provider.provideHover(
      {
        getLineContent: () => 'mostrar("mostrar")',
        getLineTokens: () => ({
          findTokenIndexAtOffset: (offset: number) =>
            offset >= 9 && offset <= 16 ? 1 : 0,
          getStandardTokenType: (tokenIndex: number) =>
            tokenIndex === 1 ? 2 : 0,
        }),
      },
      { lineNumber: 1, column: 12 },
    );
    const commentHover = provider.provideHover(
      {
        getLineContent: () => "// mostrar",
        getLineTokens: () => ({
          findTokenIndexAtOffset: (offset: number) => (offset >= 3 ? 1 : 0),
          getStandardTokenType: (tokenIndex: number) =>
            tokenIndex === 1 ? 1 : 0,
        }),
      },
      { lineNumber: 1, column: 5 },
    );

    expect(stringHover).toBeNull();
    expect(commentHover).toBeNull();
  });

  it("disposes the previous hover provider before registering a new one", () => {
    const firstHoverDisposable = { dispose: vi.fn() };
    const secondHoverDisposable = { dispose: vi.fn() };
    const registerCompletionItemProvider = vi.fn(() => ({
      dispose: vi.fn(),
    }));
    const registerHoverProvider = vi
      .fn()
      .mockReturnValueOnce(firstHoverDisposable)
      .mockReturnValueOnce(secondHoverDisposable);
    const monaco = {
      Range: class {
        constructor(
          public startLineNumber: number,
          public startColumn: number,
          public endLineNumber: number,
          public endColumn: number,
        ) {}
      },
      languages: {
        getLanguages: () => [],
        register: vi.fn(),
        setMonarchTokensProvider: vi.fn(),
        setLanguageConfiguration: vi.fn(),
        registerCompletionItemProvider,
        registerHoverProvider,
        CompletionItemKind: {
          Keyword: 1,
          Snippet: 2,
          Operator: 3,
          Value: 4,
        },
        CompletionItemInsertTextRule: {
          InsertAsSnippet: 4,
        },
      },
    };

    registerJavaMMLanguage(
      monaco as never,
      [{ original: "print", custom: "mostrar", tokenId: 33 }] as never,
      {} as never,
    );
    registerJavaMMLanguage(
      monaco as never,
      [{ original: "scan", custom: "ler", tokenId: 35 }] as never,
      {} as never,
    );

    expect(firstHoverDisposable.dispose).toHaveBeenCalledTimes(1);
    expect(registerHoverProvider).toHaveBeenCalledTimes(2);
  });
});
