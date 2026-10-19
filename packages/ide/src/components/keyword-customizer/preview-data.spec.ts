import { describe, expect, it } from "vitest";
import { getDefaultCustomizationState } from "@/contexts/keyword/KeywordContext";
import { buildWizardPreview } from "./preview-data";
import { applyWizardPreset } from "./wizard-model";

describe("buildWizardPreview", () => {
  it("uses the current draft mappings in the live example and token summary", () => {
    const draft = getDefaultCustomizationState();
    draft.mappings = draft.mappings.map((item) =>
      item.original === "print" ? { ...item, custom: "escreva" } : item,
    );
    draft.mappings = draft.mappings.map((item) =>
      item.original === "if" ? { ...item, custom: "se" } : item,
    );
    // "nao" colidia com o operador logical_not do Portugol, que virou o padrao em
    // 86a138a: o lexer rejeitava a linguagem e o preview de tokens saia vazio.
    draft.booleanLiteralMap = { true: "sim", false: "negativo" };

    const preview = buildWizardPreview(draft, {
      activeStepId: "structure",
      presetId: "didactic-pt",
    });

    expect(preview.name).toBe("Didática em Português");
    expect(preview.basedOnLabel).toBe("Didática em Português");
    expect(preview.dna).toContain("blocos com delimitadores");
    expect(preview.snippet).toContain("escreva(");
    expect(preview.snippet).toContain("vazio main()");
    expect(preview.tokenPreview.map((token) => token.lexeme)).toContain(
      "vazio",
    );
  });

  it("switches to an indentation example for python-like presets", () => {
    const draft = getDefaultCustomizationState();
    draft.modes.block = "indentation";

    const preview = buildWizardPreview(draft, {
      activeStepId: "structure",
      presetId: "python-like",
    });

    expect(preview.name).toBe("Pythonica");
    expect(preview.dna).toContain("blocos por indentação");
    expect(preview.snippet).toContain(":");
    expect(preview.snippet).not.toContain("{");
  });

  it("adds the array mode to the language DNA", () => {
    const draft = getDefaultCustomizationState();
    draft.modes.array = "dynamic";

    const preview = buildWizardPreview(draft, {
      activeStepId: "structure",
      presetId: "minimal",
    });

    expect(preview.dna).toContain("vetores dinâmicos");
  });

  it("hides explicit type aliases from the python-like summary when the preset is untyped", () => {
    const draft = applyWizardPreset(
      getDefaultCustomizationState(),
      "python-like",
    );

    const preview = buildWizardPreview(draft, {
      activeStepId: "types",
      presetId: "python-like",
    });

    expect(preview.dna).toContain("não tipada");
    expect(preview.chosenLexemes).toContainEqual({
      original: "variable",
      custom: "nome",
    });
    expect(preview.chosenLexemes).not.toContainEqual({
      original: "int",
      custom: "numero",
    });
    expect(preview.chosenLexemes).not.toContainEqual({
      original: "float",
      custom: "decimal",
    });
    expect(preview.chosenLexemes).not.toContainEqual({
      original: "bool",
      custom: "flag",
    });
    expect(preview.chosenLexemes).not.toContainEqual({
      original: "string",
      custom: "texto",
    });
    expect(preview.chosenLexemes).not.toContainEqual({
      original: "void",
      custom: "nada",
    });
  });

  it("uses the minimal preset label and short aliases in the preview", () => {
    const draft = getDefaultCustomizationState();
    draft.mappings = draft.mappings.map((item) =>
      item.original === "print" ? { ...item, custom: "out" } : item,
    );

    const preview = buildWizardPreview(draft, {
      activeStepId: "structure",
      presetId: "minimal",
    });

    expect(preview.name).toBe("Minimalista");
    expect(preview.snippet).toContain("out(");
    expect(preview.chosenLexemes).toContainEqual({
      original: "print",
      custom: "out",
    });
  });

  it("uses the mineres-like label and terminator in the preview", () => {
    const draft = getDefaultCustomizationState();
    draft.modes.semicolon = "required";
    draft.statementTerminatorLexeme = "uai";
    draft.blockDelimiters = { open: "simbora", close: "cabo" };

    const preview = buildWizardPreview(draft, {
      activeStepId: "structure",
      presetId: "mineres-like",
    });

    expect(preview.name).toBe("Minerês");
    expect(preview.dna).toContain("terminador obrigatório");
    expect(preview.snippet).toContain("uai");
    expect(preview.snippet).toContain("simbora");
    expect(preview.snippet).toContain("cabo");
  });

  it("switches to inicio and fim delimiters for ruby-like presets", () => {
    const draft = getDefaultCustomizationState();
    draft.blockDelimiters = { open: "inicio", close: "fim" };

    const preview = buildWizardPreview(draft, {
      activeStepId: "structure",
      presetId: "ruby-like",
    });

    expect(preview.name).toBe("Ruby-like");
    expect(preview.snippet).toContain("inicio");
    expect(preview.snippet).toContain("fim");
  });

  it("prefers the custom language name over the preset label", () => {
    const preview = buildWizardPreview(getDefaultCustomizationState(), {
      activeStepId: "identity",
      presetId: "minimal",
      name: "CafeScript BR",
      languageImageUrl: "https://img.example/cafe.jpg",
    });

    expect(preview.name).toBe("CafeScript BR");
    expect(preview.basedOnLabel).toBe("Minimalista");
    expect(preview.languageImageUrl).toBe("https://img.example/cafe.jpg");
  });

  it("uses the ninja prompt as the identity step example", () => {
    const draft = getDefaultCustomizationState();
    draft.mappings = draft.mappings.map((item) =>
      item.original === "scan" ? { ...item, custom: "teste" } : item,
    );

    const preview = buildWizardPreview(draft, {
      activeStepId: "identity",
      presetId: "free",
    });

    expect(preview.snippet).toBe(
      ["teste(nome);", 'escreva("Bem-vindo, ", nome);'].join("\n"),
    );
    expect(preview.snippetInput).toEqual(["Naruto"]);
    expect(preview.snippetOutput).toEqual(["Bem-vindo, Naturo"]);
  });

  it("uses the ninja prompt as the IO step example", () => {
    const draft = getDefaultCustomizationState();
    draft.mappings = draft.mappings.map((item) =>
      item.original === "scan" ? { ...item, custom: "teste" } : item,
    );

    const preview = buildWizardPreview(draft, {
      activeStepId: "IO",
      presetId: "free",
    });

    expect(preview.snippet).toBe(
      ["teste(nome);", 'escreva("Bem-vindo, ", nome);'].join("\n"),
    );
    expect(preview.snippetInput).toEqual(["Naruto"]);
    expect(preview.snippetOutput).toEqual(["Bem-vindo, Naturo"]);
  });

  it("uses the current rules operator sample on the rules step", () => {
    const preview = buildWizardPreview(
      applyWizardPreset(getDefaultCustomizationState(), "free"),
      {
        activeStepId: "rules",
        presetId: "free",
      },
    );

    expect(preview.snippet).not.toContain("int saldo = 150;");
    expect(preview.snippet).toContain(
      "bool saldoSuficiente = saldo >= 100;",
    );
    expect(preview.snippet).toContain(
      "bool descontoLiberado = temBeneficio && podeComprar;",
    );
  });

  it("combines all flow examples on the flow step", () => {
    const preview = buildWizardPreview(
      applyWizardPreset(getDefaultCustomizationState(), "free"),
      {
        activeStepId: "flow",
        presetId: "free",
      },
    );

    expect(preview.snippet).toContain('if (saldo >= 100) {');
    expect(preview.snippet).toContain('case "padrao":');
    expect(preview.snippet).toContain(
      "for (dia = 1; dia <= 7; dia = dia + 1)",
    );
    expect(preview.snippet).toContain("while (indice < totalPedidos)");
    expect(preview.snippet).toContain("return enviados;");
    expect(preview.snippet).not.toContain("Maes Hughes always dies");
  });

  it("omits terminators from the IO ninja example when line endings are optional", () => {
    const draft = getDefaultCustomizationState();
    draft.modes.semicolon = "optional-eol";
    draft.mappings = draft.mappings.map((item) =>
      item.original === "scan" ? { ...item, custom: "teste" } : item,
    );

    const preview = buildWizardPreview(draft, {
      activeStepId: "IO",
      presetId: "python-like",
    });

    expect(preview.snippet).toBe(
      ["teste(nome)", 'escreva("Bem-vindo, ", nome)'].join("\n"),
    );
  });

  it("combines every step preview on the review step", () => {
    const draft = applyWizardPreset(getDefaultCustomizationState(), "free");

    const preview = buildWizardPreview(draft, {
      activeStepId: "review",
      presetId: "free",
    });

    expect(preview.baselineSnippet).not.toContain("// Identidade");
    expect(preview.baselineSnippet).toContain("// Entrada e saida");
    expect(preview.baselineSnippet).toContain("// Tipos");
    expect(preview.baselineSnippet).toContain("// Estrutura");
    expect(preview.baselineSnippet).toContain("// Operadores");
    expect(preview.baselineSnippet).toContain("// Fluxo");
    expect(preview.snippet).toContain("scan(nome);");
    expect(preview.snippet).toContain('string heroi = "Eren Yeager";');
    expect(preview.snippet).toContain("void main() {");
    expect(preview.snippet).toContain(
      "bool descontoLiberado = temBeneficio && podeComprar;",
    );
    expect(preview.snippet).toContain('case "padrao":');
    expect(preview.snippet).not.toContain(
      "for (dia = 1; dia <= 7; dia = dia + 1)",
    );
    expect(preview.snippet).toContain("return enviados;");
    expect(preview.snippet).not.toContain("Maes Hughes always dies");
  });

  it("uses the generic variable keyword in review previews for untyped languages", () => {
    const draft = applyWizardPreset(getDefaultCustomizationState(), "free");
    draft.modes.typing = "untyped";

    const preview = buildWizardPreview(draft, {
      activeStepId: "review",
      presetId: "python-like",
    });

    expect(preview.baselineSnippet).toContain("// Tipos");
    expect(preview.snippet).toContain('variable heroi = "Eren Yeager";');
    expect(preview.snippet).toContain("variable cadastroAtivo = true;");
    expect(preview.snippet).toContain("function main() {");
    expect(preview.snippet).not.toContain("int score = 1");
  });
});
