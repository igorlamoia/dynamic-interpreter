import { describe, expect, it } from "vitest";
import { CUSTOMIZABLE_KEYWORDS, ORIGINAL_KEYWORDS } from "@/contexts/keyword";
import type { StoredKeywordCustomization } from "@/contexts/keyword/types";
import ptBrLanguageSample from "@/i18n/locales/pt-BR/language-sample";
import {
  buildCompleteLanguageSample,
  buildHelloWorldSample,
  buildLanguageCategorySample,
} from "./language-sample";

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
    expect(sample).toContain('texto name = "" fim');
    expect(sample).toContain("leia(texto, name) fim");
    expect(sample).toContain("enquanto (count menor_ou_igual 3) inicio");
    expect(sample).toContain("retorne fim");
    expect(sample.endsWith("fecha")).toBe(true);
  });

  it("separates non-semicolon terminators from statements", () => {
    const sample = buildHelloWorldSample(
      createCustomization({
        statementTerminatorLexeme: "@@",
      }),
    );

    expect(sample).toContain('string name = "" @@');
    expect(sample).toContain("return 0 @@");
  });

  it("uses localized prompt text and identifiers", () => {
    const sample = buildHelloWorldSample(
      createCustomization(),
      ptBrLanguageSample,
    );

    expect(sample).toContain('print("Qual o seu nome?");');
    expect(sample).toContain('string nome = "";');
    expect(sample).toContain("scan(string, nome);");
    expect(sample).toContain('print("ola mundo, ", nome, "!");');
    expect(sample).toContain("contarAteTres();");
    expect(sample).toContain("void contarAteTres() {");
    expect(sample).toContain("int contador = 1;");
    expect(sample).toContain("while (contador <= 3) {");
  });

  it("renames localized identifiers that collide with current reserved words", () => {
    const sample = buildHelloWorldSample(
      createCustomization({
        mappings: ORIGINAL_KEYWORDS.map((original) => ({
          original,
          custom:
            {
              print: "nome",
              scan: "contador",
              while: "contarAteTres",
            }[original] ?? original,
          tokenId: CUSTOMIZABLE_KEYWORDS[original],
        })),
      }),
      ptBrLanguageSample,
    );

    expect(sample).toContain('string nomeValue = "";');
    expect(sample).toContain("int contadorValue = 1;");
    expect(sample).toContain("void contarAteTresFunction() {");
    expect(sample).toContain('nome("Qual o seu nome?");');
    expect(sample).toContain("contador(string, nomeValue);");
    expect(sample).toContain("contarAteTres (contadorValue <= 3) {");
    expect(sample).not.toContain('string nome = "";');
    expect(sample).not.toContain("int contador = 1;");
    expect(sample).not.toContain("void contarAteTres() {");
  });
});

describe("buildCompleteLanguageSample", () => {
  it("builds a complete typed example using flow branches and all operator aliases", () => {
    const sample = buildCompleteLanguageSample(createCustomization());

    expect(sample).toContain('if (name == "Eren Yeager")');
    expect(sample).toContain('print("Eren is the anti-hero");');
    expect(sample).toContain('print("Press f to pay respect?");');
    expect(sample).toContain('else if (name == "Mikasa Ackerman")');
    expect(sample).toContain('print("Mikasa is a hero");');
    expect(sample).toContain('print("Lelouch vi Britannia has a plan");');
    expect(sample).toContain('print("Roy Mustang is a hero");');
    expect(sample).toContain('print("Maes Hughes always dies");');
    expect(sample).toContain("i < 3");
    expect(sample).toContain("score <= 3");
    expect(sample).toContain("height >= 1.8");
    expect(sample).toContain('name != "Zeke Yeager"');
    expect(sample).toContain("!false");
  });

  it("builds a complete untyped example with untyped declarations", () => {
    const sample = buildCompleteLanguageSample(
      createCustomization({
        modes: {
          semicolon: "required",
          block: "delimited",
          typing: "untyped",
          array: "dynamic",
        },
      }),
    );

    expect(sample).toContain("function main()");
    expect(sample).toContain('variable name = "";');
    expect(sample).toContain("variable i = 0;");
    expect(sample).toContain("for (i = 0; i < 3; i++)");
    expect(sample).not.toContain("int i = 0");
  });

  it("builds category samples from the same model as lexeme examples", () => {
    const customization = createCustomization();

    expect(buildLanguageCategorySample("entrada", customization)).toContain(
      'print("Eren e Mikasa");',
    );
    expect(buildLanguageCategorySample("tipos", customization)).toContain(
      [
        "void vingarEldianos() {",
        '  string heroi = "Eren Yeager";',
        "  float distanciaAtaque = 12756.28;",
        "  bool estrondoAtivado = true;",
        "  int numeroTitans = 580000;",
        "}",
      ].join("\n"),
    );
    expect(buildLanguageCategorySample("tipos", customization)).not.toContain(
      "\n\n",
    );
    expect(buildLanguageCategorySample("estrutura", customization)).toContain(
      [
        "void main() {",
        '  print("Tu te tornas eternamente responsável por aquilo que cativas.");',
        '  print("Nada do que acontece é esquecido, mesmo que você não se lembre.");',
        '  print("As pessoas só vão entender umas as outras quando sentirem a mesma dor");',
        "}",
      ].join("\n"),
    );
    expect(buildLanguageCategorySample("fluxo", customization)).toContain(
      "Maes Hughes always dies",
    );
    const operatorSample = buildLanguageCategorySample(
      "operadores",
      customization,
    );
    expect(operatorSample).toContain(
      "bool narutoQuerConversar, erenQuerDestruirTudo, mikasaAmaEren = true;",
    );
    expect(operatorSample).toContain("bool erenQuerOuvir = false;");
    expect(operatorSample).not.toContain("int pacienciaDoEren");
    expect(operatorSample).not.toContain("int pacienciaDaMikasa");
    expect(operatorSample).toContain(
      "if (narutoQuerConversar && erenQuerOuvir) {",
    );
    expect(operatorSample).toContain(
      'print("Naruto venceu com o poder da amizade!");',
    );
    expect(operatorSample).toContain(
      "if (pacienciaDaMikasa < 5 || !mikasaAmaEren) {",
    );
    expect(operatorSample).toContain(
      'print("Mikasa pegou a espada. Acabou o diálogo!");',
    );
  });

  it("omits terminators from the structure category when line endings are optional", () => {
    const sample = buildLanguageCategorySample(
      "estrutura",
      createCustomization({
        statementTerminatorLexeme: "",
        modes: {
          semicolon: "optional-eol",
          block: "delimited",
          typing: "typed",
          array: "fixed",
        },
      }),
    );

    expect(sample).toContain("void main()");
    expect(sample).toContain(
      'print("Tu te tornas eternamente responsável por aquilo que cativas.")',
    );
    expect(sample).toContain(
      'print("Nada do que acontece é esquecido, mesmo que você não se lembre.")',
    );
    expect(sample).toContain(
      'print("As pessoas só vão entender umas as outras quando sentirem a mesma dor")',
    );
    expect(sample).not.toContain(
      'print("Tu te tornas eternamente responsável por aquilo que cativas.");',
    );
  });
});
