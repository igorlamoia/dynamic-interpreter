import { describe, expect, it } from "vitest";
import { CUSTOMIZABLE_KEYWORDS, ORIGINAL_KEYWORDS } from "@/contexts/keyword";
import type { StoredKeywordCustomization } from "@/contexts/keyword/types";
import ptBrLanguageSample from "@/i18n/locales/pt-BR/language-sample";
import { buildHelloWorldSample } from "./language-sample";

function createCustomization(
  overrides: Partial<StoredKeywordCustomization> = {},
): StoredKeywordCustomization {
  return {
    mappings: ORIGINAL_KEYWORDS.map((original) => ({
      original,
      custom: original,
      tokenId: CUSTOMIZABLE_KEYWORDS[original],
    })),
    operatorWordMap: {},
    booleanLiteralMap: { true: "true", false: "false" },
    statementTerminatorLexeme: ";",
    blockDelimiters: { open: "{", close: "}" },
    modes: {
      semicolon: "required",
      block: "delimited",
      typing: "typed",
      array: "fixed",
    },
    languageDocumentation: {},
    ...overrides,
  };
}

describe("buildHelloWorldSample", () => {
  it("generates typed delimited code with required terminators", () => {
    expect(buildHelloWorldSample(createCustomization())).toBe(`int main() {
  string name = "";
  print("What is your name?");
  scan(string, name);
  print("hello world, ", name, "!");
  countToThree();
  return 0;
}

void countToThree() {
  int count = 1;
  while (count <= 3) {
    print(count);
    count = count + 1;
  }
  return;
}`);
  });

  it("generates untyped indentation code without optional terminators", () => {
    const customization = createCustomization({
      statementTerminatorLexeme: "",
      blockDelimiters: { open: "", close: "" },
      modes: {
        semicolon: "optional-eol",
        block: "indentation",
        typing: "untyped",
        array: "dynamic",
      },
    });

    expect(buildHelloWorldSample(customization)).toBe(`function main():
  variable name = ""
  print("What is your name?")
  scan(name)
  print("hello world, ", name, "!")
  countToThree()
  return 0

function countToThree():
  variable count = 1
  while (count <= 3):
    print(count)
    count = count + 1`);
  });

  it("uses customized lexemes for keywords, blocks, terminator, and operators", () => {
    const customization = createCustomization({
      mappings: ORIGINAL_KEYWORDS.map((original) => ({
        original,
        custom:
          {
            int: "inteiro",
            string: "texto",
            void: "vazio",
            while: "enquanto",
            return: "retorne",
            print: "escreva",
            scan: "leia",
          }[original] ?? original,
        tokenId: CUSTOMIZABLE_KEYWORDS[original],
      })),
      operatorWordMap: { less_equal: "menor_ou_igual" },
      statementTerminatorLexeme: "fim",
      blockDelimiters: { open: "inicio", close: "fecha" },
    });

    const sample = buildHelloWorldSample(customization);

    expect(sample).toContain("inteiro main() inicio");
    expect(sample).toContain("texto name = \"\"fim");
    expect(sample).toContain("leia(texto, name)fim");
    expect(sample).toContain(
      "enquanto (count menor_ou_igual 3) inicio",
    );
    expect(sample).toContain("retornefim");
    expect(sample.endsWith("fecha")).toBe(true);
  });

  it("uses localized prompt text and identifiers", () => {
    const sample = buildHelloWorldSample(
      createCustomization(),
      ptBrLanguageSample,
    );

    expect(sample).toContain('print("Qual o seu nome?");');
    expect(sample).toContain("string nome = \"\";");
    expect(sample).toContain("scan(string, nome);");
    expect(sample).toContain('print("ola mundo, ", nome, "!");');
    expect(sample).toContain("contarAteTres();");
    expect(sample).toContain("void contarAteTres() {");
    expect(sample).toContain("int contador = 1;");
    expect(sample).toContain("while (contador <= 3) {");
  });
});
