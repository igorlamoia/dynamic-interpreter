import { describe, expect, it } from "vitest";
import { getDefaultCustomizationState } from "@/contexts/keyword/KeywordContext";
import type { StoredKeywordCustomization } from "@/contexts/keyword/types";
import {
  buildDynamicArraySnippet,
  buildFixedArraySnippet,
  buildOptionalTerminatorSnippet,
  buildRequiredTerminatorSnippet,
  typedVariableSnippet,
  untypedVariableSnippet,
} from "./preview-builder";

describe("preview-builder variable snippets", () => {
  function createDraft(): StoredKeywordCustomization {
    const defaultCustomization = getDefaultCustomizationState();

    return {
      ...defaultCustomization,
      mappings: defaultCustomization.mappings.map((mapping) => {
        if (mapping.original === "variable") {
          return { ...mapping, custom: "var" };
        }

        if (mapping.original === "int") {
          return { ...mapping, custom: "numero" };
        }

        if (mapping.original === "float") {
          return { ...mapping, custom: "decimal" };
        }

        if (mapping.original === "bool") {
          return { ...mapping, custom: "logico" };
        }

        if (mapping.original === "string") {
          return { ...mapping, custom: "texto" };
        }

        return mapping;
      }),
      modes: {
        ...defaultCustomization.modes,
        semicolon: "required",
        typing: "typed",
      },
      statementTerminatorLexeme: "fim",
    };
  }

  it("builds the typed example from the draft", () => {
    const draft = createDraft();

    expect(typedVariableSnippet(draft)).toBe(
      'texto nome = "Kiki"fim\nnumero idade = 25fim\ndecimal altura = 1.75fim\nlogico estudante = truefim',
    );
  });

  it("builds the untyped example from the draft", () => {
    const draft = createDraft();
    draft.modes.typing = "untyped";

    expect(untypedVariableSnippet(draft)).toBe(
      'var nome = "Kiki"fim\nvar idade = 25fim\nvar altura = 1.75fim\nvar estudante = truefim',
    );
  });
});

describe("preview-builder structure option snippets", () => {
  it("builds semicolon option examples from the current language", () => {
    const draft = getDefaultCustomizationState();
    draft.mappings = draft.mappings.map((mapping) =>
      mapping.original === "print" ? { ...mapping, custom: "mostrar" } : mapping,
    );
    draft.statementTerminatorLexeme = "fim";

    expect(buildOptionalTerminatorSnippet(draft)).toBe('mostrar("ok")');
    expect(buildRequiredTerminatorSnippet(draft)).toBe('mostrar("ok")fim');
  });

  it("builds typed array option examples with exact fixed sizes", () => {
    const draft = getDefaultCustomizationState();
    draft.mappings = draft.mappings.map((mapping) => {
      if (mapping.original === "string") {
        return { ...mapping, custom: "texto" };
      }

      return mapping;
    });
    draft.modes.semicolon = "required";
    draft.statementTerminatorLexeme = "fim";

    expect(buildFixedArraySnippet(draft)).toBe(
      'texto animes[2] = ["Naruto", "AOT"]fim',
    );
    expect(buildDynamicArraySnippet(draft)).toBe(
      'texto animes[] = ["Naruto", "AOT"]fim',
    );
  });

  it("builds untyped array option examples with exact fixed sizes", () => {
    const draft = getDefaultCustomizationState();
    draft.modes.typing = "untyped";
    draft.modes.semicolon = "optional-eol";

    expect(buildFixedArraySnippet(draft)).toBe(
      'animes[2] = ["Naruto", "AOT"]',
    );
    expect(buildDynamicArraySnippet(draft)).toBe(
      'animes[] = ["Naruto", "AOT"]',
    );
  });
});
