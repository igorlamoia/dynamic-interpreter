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
    draft.booleanLiteralMap = { true: "sim", false: "nao" };

    const preview = buildWizardPreview(draft, {
      activeStepId: "structure",
      presetId: "didactic-pt",
    });

    expect(preview.languageLabel).toBe("Didatica em Portugues");
    expect(preview.basedOnLabel).toBe("Didatica em Portugues");
    expect(preview.dna).toContain("blocos com delimitadores");
    expect(preview.snippet).toContain("escreva(");
    expect(preview.tokenPreview.map((token) => token.lexeme)).toContain(
      "escreva",
    );
  });

  it("switches to an indentation example for python-like presets", () => {
    const draft = getDefaultCustomizationState();
    draft.modes.block = "indentation";

    const preview = buildWizardPreview(draft, {
      activeStepId: "structure",
      presetId: "python-like",
    });

    expect(preview.languageLabel).toBe("Pythonica");
    expect(preview.dna).toContain("blocos por indentacao");
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

    expect(preview.dna).toContain("nao tipada");
    expect(preview.chosenLexemes).toContainEqual({
      original: "variavel",
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

    expect(preview.languageLabel).toBe("Minimalista");
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

    expect(preview.languageLabel).toBe("Mineres");
    expect(preview.dna).toContain("terminador obrigatorio");
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

    expect(preview.languageLabel).toBe("Ruby-like");
    expect(preview.snippet).toContain("inicio");
    expect(preview.snippet).toContain("fim");
  });

  it("prefers the custom language name over the preset label", () => {
    const preview = buildWizardPreview(getDefaultCustomizationState(), {
      activeStepId: "identity",
      presetId: "minimal",
      languageName: "CafeScript BR",
      languageImageUrl: "https://img.example/cafe.jpg",
    });

    expect(preview.languageLabel).toBe("CafeScript BR");
    expect(preview.basedOnLabel).toBe("Minimalista");
    expect(preview.languageImageUrl).toBe("https://img.example/cafe.jpg");
  });

  it("uses a richer full-program example on the review step", () => {
    const preview = buildWizardPreview(getDefaultCustomizationState(), {
      activeStepId: "review",
      presetId: "didactic-pt",
    });

    expect(preview.baselineSnippet).toContain("int idade = 25");
    expect(preview.baselineSnippet).toContain('print("Olá Mundo!")');
    expect(preview.baselineSnippet).toContain("scan(nome)");
    expect(preview.baselineSnippet).toContain("switch (nivel)");
    expect(preview.baselineSnippet).toContain("return idade");
    expect(preview.snippet).toContain("case 1");
    expect(preview.snippet).toContain("continue");
    expect(preview.snippet).toContain("break");
  });

  it("uses the generic variable keyword in review previews for untyped languages", () => {
    const draft = getDefaultCustomizationState();
    draft.modes.typing = "untyped";

    const preview = buildWizardPreview(draft, {
      activeStepId: "review",
      presetId: "python-like",
    });

    expect(preview.baselineSnippet).toContain('variavel nome = "Kiki"');
    expect(preview.baselineSnippet).toContain("variavel idade = 25");
    expect(preview.baselineSnippet).not.toContain("int idade = 25");
    expect(preview.snippet).toContain("variavel estudante = true");
  });
});
