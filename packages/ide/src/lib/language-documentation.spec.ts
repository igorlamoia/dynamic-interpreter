import { describe, expect, it } from "vitest";
import { getDefaultCustomizationState } from "@/contexts/keyword/KeywordContext";
import {
  getDefaultDocumentationDescription,
  resolveDocumentationByLexeme,
} from "./language-documentation";

describe("language documentation", () => {
  it("resolves renamed keywords by semantic id", () => {
    const customization = getDefaultCustomizationState();
    customization.mappings = customization.mappings.map((mapping) =>
      mapping.original === "print"
        ? { ...mapping, custom: "mostrar" }
        : mapping,
    );
    customization.languageDocumentation = {
      "keyword.print": {
        description: "Exibe valores na saída.",
      },
    };

    const entry = resolveDocumentationByLexeme("mostrar", customization);

    expect(entry).toEqual({
      id: "keyword.print",
      lexeme: "mostrar",
      category: "Entrada/Saída",
      description: "Exibe valores na saída.",
    });
  });

  it("resolves operator aliases with operator category", () => {
    const customization = getDefaultCustomizationState();
    customization.operatorWordMap.logical_and = "e";
    customization.languageDocumentation = {
      "operator.logical_and": {
        description: "Retorna verdadeiro quando ambas as condições são verdadeiras.",
      },
    };

    const entry = resolveDocumentationByLexeme("e", customization);

    expect(entry).toEqual({
      id: "operator.logical_and",
      lexeme: "e",
      category: "Operador",
      description:
        "Retorna verdadeiro quando ambas as condições são verdadeiras.",
    });
  });

  it("generates fallback descriptions for blank user entries", () => {
    const customization = getDefaultCustomizationState();
    customization.blockDelimiters = { open: "inicio", close: "fim" };
    customization.languageDocumentation = {
      "delimiter.open": {
        description: "   ",
      },
    };

    const entry = resolveDocumentationByLexeme("inicio", customization);

    expect(entry).toEqual({
      id: "delimiter.open",
      lexeme: "inicio",
      category: "Delimitador de bloco",
      description: getDefaultDocumentationDescription("delimiter.open"),
    });
  });

  it("resolves a custom statement terminator", () => {
    const customization = getDefaultCustomizationState();
    customization.statementTerminatorLexeme = "@@";

    const entry = resolveDocumentationByLexeme("@@", customization);

    expect(entry).toEqual({
      id: "terminator.statement",
      lexeme: "@@",
      category: "Terminador",
      description: getDefaultDocumentationDescription("terminator.statement"),
    });
  });

  it("does not resolve empty delimiters or unknown lexemes", () => {
    const customization = getDefaultCustomizationState();
    // Fixado aqui: o padrao passou a ser Portugol, que delimita blocos com
    // inicio/fim (86a138a). O teste e sobre delimitadores vazios.
    customization.blockDelimiters = { open: "", close: "" };

    expect(resolveDocumentationByLexeme("inicio", customization)).toBeNull();
    expect(resolveDocumentationByLexeme("desconhecido", customization)).toBeNull();
  });

  it("uses the active boolean aliases instead of fixed defaults", () => {
    const customization = getDefaultCustomizationState();
    customization.booleanLiteralMap = {
      true: "sim",
      false: "nao",
    };

    const entry = resolveDocumentationByLexeme("sim", customization);

    expect(entry).toEqual({
      id: "boolean.true",
      lexeme: "sim",
      category: "Literal booleano",
      description: getDefaultDocumentationDescription("boolean.true"),
    });
  });
});
