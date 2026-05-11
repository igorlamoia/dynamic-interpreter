// @vitest-environment jsdom

import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it } from "vitest";
import {
  KeywordProvider,
  getDefaultCustomizationState,
  getDefaultBooleanLiteralMap,
  getDefaultKeywordMappings,
  migrateStoredMappings,
  useKeywords,
} from "@/contexts/keyword/KeywordContext";
import {
  validateStatementTerminatorLexeme,
  validateBooleanLiteralAliases,
  validateCustomKeyword,
} from "@/contexts/keyword/keyword-validator";
import { buildLexerConfigFromCustomization } from "@/lib/keyword-customization";
import { saveSavedKeywordLanguage } from "@/lib/keyword-language-storage";
import { vi, beforeEach, afterEach } from "vitest";

(
  globalThis as typeof globalThis & {
    IS_REACT_ACT_ENVIRONMENT: boolean;
  }
).IS_REACT_ACT_ENVIRONMENT = true;

const {
  monacoRefMock,
  retokenizeMock,
  updateJavaMMKeywordsMock,
  useEditorMock,
} = vi.hoisted(() => ({
  monacoRefMock: { current: {} },
  retokenizeMock: vi.fn(),
  updateJavaMMKeywordsMock: vi.fn(),
  useEditorMock: vi.fn(() => ({
    monacoRef: { current: {} },
    retokenize: vi.fn(),
  })),
}));

vi.mock("@/hooks/useEditor", () => ({
  useEditor: () => useEditorMock(),
}));

vi.mock("@/utils/compiler/editor/editor-language", () => ({
  updateJavaMMKeywords: updateJavaMMKeywordsMock,
}));

let capturedKeywords: ReturnType<typeof useKeywords> | null = null;

function CaptureKeywords() {
  capturedKeywords = useKeywords();
  return null;
}

describe("keyword context lexer config", () => {
  beforeEach(() => {
    capturedKeywords = null;
    retokenizeMock.mockReset();
    updateJavaMMKeywordsMock.mockReset();
    useEditorMock.mockReset();
    useEditorMock.mockReturnValue({
      monacoRef: monacoRefMock,
      retokenize: retokenizeMock,
    });
    localStorage.clear();
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("exposes a nested customization object with grouped setters", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(
        React.createElement(
          KeywordProvider,
          null,
          React.createElement(CaptureKeywords),
        ),
      );
    });

    act(() => {
      capturedKeywords?.setModes((prev) => ({
        ...prev,
        typing: "untyped",
        array: "fixed",
      }));
    });

    expect(capturedKeywords?.customization.modes.typing).toBe("untyped");
    expect(capturedKeywords?.customization.modes.array).toBe("fixed");
    expect(capturedKeywords?.buildLexerConfig().grammar).toEqual({
      semicolonMode: "optional-eol",
      blockMode: "delimited",
      typingMode: "untyped",
      arrayMode: "fixed",
    });

    expect(capturedKeywords?.setCustomization).toBeTypeOf("function");
    expect(capturedKeywords?.setModes).toBeTypeOf("function");

    act(() => {
      root.unmount();
    });
  });

  it("builds the same lexer config shape as the shared helper", () => {
    const customization = getDefaultCustomizationState();
    customization.modes.typing = "untyped";
    customization.modes.array = "dynamic";
    customization.statementTerminatorLexeme = " @@ ";
    customization.blockDelimiters = { open: " inicio ", close: " fim " };

    const helperConfig = buildLexerConfigFromCustomization(customization);

    expect(helperConfig).toMatchObject({
      grammar: {
        semicolonMode: "optional-eol",
        blockMode: "delimited",
        typingMode: "untyped",
        arrayMode: "dynamic",
      },
      statementTerminatorLexeme: "@@",
      blockDelimiters: { open: "inicio", close: "fim" },
    });
    expect(capturedKeywords).toBeNull();
  });

  it("mounts without crashing when no editor context is available", () => {
    useEditorMock.mockReturnValue({} as ReturnType<typeof useEditorMock>);

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    expect(() => {
      act(() => {
        root.render(
          React.createElement(
            KeywordProvider,
            null,
            React.createElement(CaptureKeywords),
          ),
        );
      });
    }).not.toThrow();

    expect(capturedKeywords).not.toBeNull();
    expect(updateJavaMMKeywordsMock).not.toHaveBeenCalled();
    expect(retokenizeMock).not.toHaveBeenCalled();

    act(() => {
      root.unmount();
    });
  });

  it("normalizes stored flat grammar fields into nested customization modes", () => {
    localStorage.setItem(
      "keyword-customization",
      JSON.stringify({
        mappings: getDefaultKeywordMappings(),
        operatorWordMap: { logical_and: "et" },
        booleanLiteralMap: { true: "verdadeiro", false: "falso" },
        statementTerminatorLexeme: "@@",
        blockDelimiters: { open: "inicio", close: "fim" },
        semicolonMode: "required",
        blockMode: "indentation",
        typingMode: "untyped",
        arrayMode: "dynamic",
        ui: { isKeywordCustomizerOpen: true },
      }),
    );

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(
        React.createElement(
          KeywordProvider,
          null,
          React.createElement(CaptureKeywords),
        ),
      );
    });

    expect(capturedKeywords?.customization).toMatchObject({
      operatorWordMap: { logical_and: "et" },
      booleanLiteralMap: { true: "verdadeiro", false: "falso" },
      statementTerminatorLexeme: "@@",
      blockDelimiters: { open: "inicio", close: "fim" },
      modes: {
        semicolon: "required",
        block: "indentation",
        typing: "untyped",
        array: "dynamic",
      },
    });
    expect(capturedKeywords?.customization).not.toHaveProperty("ui");

    act(() => {
      root.unmount();
    });
  });

  it("writes normalized nested customization back to localStorage after hydration", () => {
    localStorage.setItem(
      "keyword-customization",
      JSON.stringify({
        mappings: getDefaultKeywordMappings(),
        operatorWordMap: { logical_and: "et" },
        booleanLiteralMap: { true: "verdadeiro", false: "falso" },
        statementTerminatorLexeme: "@@",
        blockDelimiters: { open: "inicio", close: "fim" },
        semicolonMode: "required",
        blockMode: "indentation",
        typingMode: "untyped",
        arrayMode: "dynamic",
        ui: { isKeywordCustomizerOpen: true },
      }),
    );

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(
        React.createElement(
          KeywordProvider,
          null,
          React.createElement(CaptureKeywords),
        ),
      );
    });

    const persisted = JSON.parse(
      localStorage.getItem("keyword-customization") ?? "{}",
    ) as Record<string, unknown>;

    expect(persisted).toMatchObject({
      operatorWordMap: { logical_and: "et" },
      booleanLiteralMap: { true: "verdadeiro", false: "falso" },
      statementTerminatorLexeme: "@@",
      blockDelimiters: { open: "inicio", close: "fim" },
      modes: {
        semicolon: "required",
        block: "indentation",
        typing: "untyped",
        array: "dynamic",
      },
    });
    expect(persisted).not.toHaveProperty("ui");

    expect(persisted).not.toHaveProperty("semicolonMode");
    expect(persisted).not.toHaveProperty("blockMode");
    expect(persisted).not.toHaveProperty("typingMode");
    expect(persisted).not.toHaveProperty("arrayMode");

    act(() => {
      root.unmount();
    });
  });

  it("migrates legacy keyword mappings into the full nested customization state", () => {
    const legacyMappings = getDefaultKeywordMappings().map((mapping) =>
      mapping.original === "print"
        ? { ...mapping, custom: "escreva" }
        : mapping,
    );
    localStorage.setItem("keyword-mappings", JSON.stringify(legacyMappings));

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(
        React.createElement(
          KeywordProvider,
          null,
          React.createElement(CaptureKeywords),
        ),
      );
    });

    expect(capturedKeywords?.customization).toMatchObject({
      mappings: expect.arrayContaining([
        expect.objectContaining({
          original: "print",
          custom: "escreva",
        }),
      ]),
      modes: getDefaultCustomizationState().modes,
    });
    expect(capturedKeywords?.customization).not.toHaveProperty("ui");

    act(() => {
      root.unmount();
    });
  });

  it("hydrates stored payloads with an empty language documentation map", () => {
    localStorage.setItem(
      "keyword-customization",
      JSON.stringify({
        mappings: getDefaultKeywordMappings(),
        operatorWordMap: {},
        booleanLiteralMap: {},
        statementTerminatorLexeme: "",
        blockDelimiters: { open: "", close: "" },
        modes: {
          semicolon: "optional-eol",
          block: "delimited",
          typing: "typed",
          array: "fixed",
        },
      }),
    );

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(
        React.createElement(
          KeywordProvider,
          null,
          React.createElement(CaptureKeywords),
        ),
      );
    });

    expect(
      (capturedKeywords?.customization as never).languageDocumentation,
    ).toEqual({});

    act(() => {
      root.unmount();
    });
  });

  it("forwards language documentation metadata to Monaco updates", () => {
    localStorage.setItem(
      "keyword-customization",
      JSON.stringify({
        mappings: getDefaultKeywordMappings(),
        operatorWordMap: {},
        booleanLiteralMap: {},
        statementTerminatorLexeme: "",
        blockDelimiters: { open: "", close: "" },
        modes: {
          semicolon: "optional-eol",
          block: "delimited",
          typing: "typed",
          array: "fixed",
        },
        languageDocumentation: {
          "keyword.print": {
            description: "Exibe valores na saída.",
          },
        },
      }),
    );

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(
        React.createElement(
          KeywordProvider,
          null,
          React.createElement(CaptureKeywords),
        ),
      );
    });

    expect(updateJavaMMKeywordsMock).toHaveBeenCalled();
    expect(updateJavaMMKeywordsMock).toHaveBeenLastCalledWith(
      monacoRefMock.current,
      expect.any(Array),
      expect.objectContaining({
        languageDocumentation: {
          "keyword.print": {
            description: "Exibe valores na saída.",
          },
        },
      }),
    );

    act(() => {
      root.unmount();
    });
  });

  it("hydrates the active saved language when a saved-language slug is selected", () => {
    const savedCustomization = getDefaultCustomizationState();
    savedCustomization.mappings = savedCustomization.mappings.map((mapping) =>
      mapping.original === "print"
        ? { ...mapping, custom: "escreva_neon" }
        : mapping,
    );

    saveSavedKeywordLanguage({
      name: "Didatica Neon",
      slug: "didatica-neon",
      imageUrl: "https://img.example/neon.png",
      imageQuery: "neon language",
      presetId: "didactic-pt",
      customization: savedCustomization,
    });
    localStorage.setItem(
      "keyword-customization",
      JSON.stringify(getDefaultCustomizationState()),
    );

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(
        React.createElement(
          KeywordProvider,
          null,
          React.createElement(CaptureKeywords),
        ),
      );
    });

    expect(
      capturedKeywords?.customization.mappings.find(
        (mapping) => mapping.original === "print",
      )?.custom,
    ).toBe("escreva_neon");
    expect(localStorage.getItem("keyword-customization")).toContain(
      "escreva_neon",
    );

    act(() => {
      root.unmount();
    });
  });

  it("falls back to defaults when the active saved language is corrupt", () => {
    localStorage.setItem("keyword-customization-active", "broken-language");
    localStorage.setItem("keyword-customization-broken-language", "{broken");

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(
        React.createElement(
          KeywordProvider,
          null,
          React.createElement(CaptureKeywords),
        ),
      );
    });

    expect(capturedKeywords?.customization).toEqual(
      getDefaultCustomizationState(),
    );
    expect(localStorage.getItem("keyword-customization")).toContain('"print"');

    act(() => {
      root.unmount();
    });
  });
});

describe("migrateStoredMappings", () => {
  it("preserves older saved mappings and appends bool with its default value", () => {
    const legacyMappings = getDefaultKeywordMappings()
      .filter((mapping) => mapping.original !== "bool")
      .map((mapping) =>
        mapping.original === "int"
          ? { ...mapping, custom: "inteiro" }
          : mapping.original === "print"
            ? { ...mapping, custom: "escreva" }
            : mapping,
      );

    const migrated = migrateStoredMappings(legacyMappings);

    expect(migrated).not.toBeNull();
    const normalizedMigrated = migrated ?? [];

    expect(normalizedMigrated).toHaveLength(getDefaultKeywordMappings().length);
    expect(
      normalizedMigrated.find((mapping) => mapping.original === "int")?.custom,
    ).toBe("inteiro");
    expect(
      normalizedMigrated.find((mapping) => mapping.original === "print")
        ?.custom,
    ).toBe("escreva");
    expect(
      normalizedMigrated.find((mapping) => mapping.original === "bool"),
    ).toEqual({
      original: "bool",
      custom: "bool",
      tokenId: 55,
    });
  });
});

describe("validateCustomKeyword", () => {
  it("allows true when boolean literal aliases are customized away from defaults", () => {
    const error = validateCustomKeyword(
      "int",
      "true",
      getDefaultKeywordMappings(),
      { true: "yes", false: "no" },
    );

    expect(error).toBeNull();
  });

  it("rejects conflicts with the active boolean literal aliases", () => {
    const error = validateCustomKeyword(
      "print",
      "yes",
      getDefaultKeywordMappings(),
      { true: "yes", false: "no" },
    );

    expect(error).toBe('"yes" já está sendo usada como literal booleano.');
  });
});

describe("boolean literal customization", () => {
  it("returns true and false as the default boolean literal aliases", () => {
    expect(getDefaultBooleanLiteralMap()).toEqual({
      true: "true",
      false: "false",
    });
  });

  it("rejects duplicate boolean literal aliases", () => {
    const error = validateBooleanLiteralAliases(
      { true: "sim", false: "sim" },
      getDefaultKeywordMappings(),
      {},
      { open: "", close: "" },
    );

    expect(error).toBe("Os literais booleanos precisam ser diferentes.");
  });

  it("rejects boolean literal aliases that conflict with keyword customizations", () => {
    const mappings = getDefaultKeywordMappings().map((mapping) =>
      mapping.original === "int" ? { ...mapping, custom: "inteiro" } : mapping,
    );

    const error = validateBooleanLiteralAliases(
      { true: "inteiro", false: "falso" },
      mappings,
      {},
      { open: "", close: "" },
    );

    expect(error).toBe(
      '"inteiro" conflicts with an existing keyword customization.',
    );
  });
});

describe("statement terminator customization", () => {
  function createCustomization(
    overrides: Partial<ReturnType<typeof getDefaultCustomizationState>> = {},
  ) {
    return {
      ...getDefaultCustomizationState(),
      ...overrides,
    };
  }

  it("accepts non-conflicting symbolic terminators", () => {
    const error = validateStatementTerminatorLexeme(
      "@@",
      createCustomization(),
    );

    expect(error).toBeNull();
  });

  it("rejects whitespace in statement terminators", () => {
    const error = validateStatementTerminatorLexeme(
      "two words",
      createCustomization(),
    );

    expect(error).toBe("O terminador não pode conter espaços.");
  });

  it("accepts semicolon as the default statement terminator", () => {
    const error = validateStatementTerminatorLexeme(";", createCustomization());

    expect(error).toBeNull();
  });

  it("rejects reserved operator characters in statement terminators", () => {
    const error = validateStatementTerminatorLexeme(
      "!!",
      createCustomization(),
    );

    expect(error).toBe(
      "O terminador não pode reutilizar símbolos ou operadores fixos da linguagem.",
    );
  });

  it("rejects terminators that collide with keyword customizations", () => {
    const error = validateStatementTerminatorLexeme(
      "uai",
      createCustomization({
        mappings: [
          { original: "if", custom: "uai", tokenId: 28 },
          { original: "while", custom: "enquanto", tokenId: 25 },
        ],
      }),
    );

    expect(error).toBe(
      '"uai" conflicts with an existing keyword customization.',
    );
  });

  it("rejects original reserved keywords even after customization remaps them", () => {
    const error = validateStatementTerminatorLexeme(
      "if",
      createCustomization({
        mappings: [{ original: "if", custom: "se", tokenId: 28 }],
      }),
    );

    expect(error).toBe(
      '"if" conflicts with an existing keyword customization.',
    );
  });

  it("rejects terminators that collide with operator aliases", () => {
    const error = validateStatementTerminatorLexeme(
      "uai",
      createCustomization({
        operatorWordMap: { logical_and: "uai" },
      }),
    );

    expect(error).toBe('"uai" conflicts with an existing operator alias.');
  });

  it("rejects terminators that collide with boolean aliases", () => {
    const error = validateStatementTerminatorLexeme(
      "uai",
      createCustomization({
        booleanLiteralMap: { true: "uai", false: "nao" },
      }),
    );

    expect(error).toBe(
      '"uai" conflicts with an existing boolean literal alias.',
    );
  });

  it("rejects default boolean literals even after customization remaps them", () => {
    const error = validateStatementTerminatorLexeme(
      "true",
      createCustomization({
        booleanLiteralMap: { true: "sim", false: "nao" },
      }),
    );

    expect(error).toBe(
      '"true" conflicts with an existing keyword customization.',
    );
  });

  it("rejects terminators that collide with block delimiters", () => {
    const error = validateStatementTerminatorLexeme(
      "uai",
      createCustomization({
        blockDelimiters: { open: "uai", close: "fim" },
      }),
    );

    expect(error).toBe('"uai" conflicts with the configured block delimiters.');
  });
});
