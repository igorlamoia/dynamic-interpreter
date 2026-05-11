import { describe, expect, it } from "vitest";
import { getDefaultCustomizationState } from "@/contexts/keyword/KeywordContext";
import {
  WIZARD_PRESET_LABELS,
  WIZARD_STEPS,
  applyWizardPreset,
  getWizardStepFields,
} from "./wizard-model";
import { buildLexerConfigFromCustomization } from "@/lib/keyword-customization";

const STYLED_KEYWORDS = [
  "int",
  "float",
  "bool",
  "string",
  "void",
  "for",
  "while",
  "break",
  "continue",
  "if",
  "else",
  "return",
  "print",
  "scan",
  "switch",
  "case",
  "default",
  "variavel",
  "funcao",
] as const;

const DEFAULT_OPERATOR_WORD_KEYS = [
  "logical_or",
  "logical_and",
  "logical_not",
  "less",
  "less_equal",
  "greater",
  "greater_equal",
  "equal_equal",
  "not_equal",
] as const;

const DIDACTIC_PT_EXPECTED = {
  mappings: {
    int: "numero_inteiro",
    float: "numero_real",
    bool: "logico",
    string: "texto",
    void: "vazio",
    for: "para",
    while: "enquanto",
    break: "pare",
    continue: "continue",
    if: "se",
    else: "senao",
    return: "retorne",
    print: "escreva",
    scan: "leia",
    switch: "escolha",
    case: "caso",
    default: "padrao",
    variavel: "variavel",
    funcao: "funcao",
  },
  operatorWordMap: {
    logical_or: "ou",
    logical_and: "e",
    logical_not: "nao",
    less: "menor",
    less_equal: "menor_ou_igual",
    greater: "maior",
    greater_equal: "maior_ou_igual",
    equal_equal: "igual",
    not_equal: "diferente",
  },
  booleanLiteralMap: { true: "verdadeiro", false: "falso" },
  statementTerminatorLexeme: ";",
  blockDelimiters: { open: "inicio", close: "fim" },
  modes: {
    semicolon: "required",
    block: "delimited",
    typing: "typed",
    array: "fixed",
  },
} as const;

const MINIMAL_EXPECTED = {
  mappings: {
    int: "i",
    float: "f",
    bool: "b",
    string: "s",
    void: "_",
    for: "fr",
    while: "wh",
    break: "br",
    continue: "ct",
    if: "if_",
    else: "el",
    return: "rt",
    print: "out",
    scan: "in",
    switch: "sw",
    case: "cs",
    default: "df",
    variavel: "var",
    funcao: "fn",
  },
  operatorWordMap: {
    logical_or: "ou",
    logical_and: "e",
    logical_not: "nao",
    less: "lt",
    less_equal: "lte",
    greater: "gt",
    greater_equal: "gte",
    equal_equal: "eq",
    not_equal: "neq",
  },
  booleanLiteralMap: { true: "1", false: "0" },
  statementTerminatorLexeme: ".",
  blockDelimiters: { open: "[", close: "]" },
  modes: {
    semicolon: "optional-eol",
    block: "delimited",
    typing: "untyped",
    array: "dynamic",
  },
} as const;

const PYTHON_LIKE_EXPECTED = {
  mappings: {
    int: "numero",
    float: "decimal",
    bool: "flag",
    string: "texto",
    void: "nada",
    for: "para",
    while: "enquanto",
    break: "sai",
    continue: "segue",
    if: "se",
    else: "senao",
    return: "retorne",
    print: "imprime",
    scan: "le",
    switch: "match",
    case: "case",
    default: "padrao",
    variavel: "nome",
    funcao: "defina",
  },
  operatorWordMap: {
    logical_or: "ou",
    logical_and: "e",
    logical_not: "nao",
    less: "menor",
    less_equal: "menor_ou_igual",
    greater: "maior",
    greater_equal: "maior_ou_igual",
    equal_equal: "igual",
    not_equal: "diferente",
  },
  booleanLiteralMap: { true: "verdadeiro", false: "falso" },
  statementTerminatorLexeme: "",
  blockDelimiters: { open: "", close: "" },
  modes: {
    semicolon: "optional-eol",
    block: "indentation",
    typing: "untyped",
    array: "dynamic",
  },
} as const;

const MINERES_LIKE_EXPECTED = {
  mappings: {
    int: "trem_di_numeru",
    float: "trem_cum_virgula",
    bool: "trem_discolhe",
    string: "trem_discrita",
    void: "trem_de_nada",
    for: "roda_esse_trem",
    while: "enquanto_tiver_trem",
    break: "para_o_trem",
    continue: "toca_o_trem",
    if: "uai_se",
    else: "uai_senao",
    return: "ta_bao",
    print: "oia_proce_ve",
    scan: "xove",
    switch: "dependenu",
    case: "du_casu",
    default: "deixa_assim",
    variavel: "trem",
    funcao: "bora_cumpade",
  },
  operatorWordMap: {
    logical_or: "quarque_um",
    logical_and: "tamem",
    logical_not: "vam_marca",
    less: "menor",
    less_equal: "menor_ou_igual",
    greater: "maior",
    greater_equal: "maior_ou_igual",
    equal_equal: "mema_coisa",
    not_equal: "neh_nada",
  },
  booleanLiteralMap: { true: "eh", false: "num_eh" },
  statementTerminatorLexeme: "uai",
  blockDelimiters: { open: "simbora", close: "cabo" },
  modes: {
    semicolon: "required",
    block: "delimited",
    typing: "typed",
    array: "fixed",
  },
} as const;

const RUBY_LIKE_EXPECTED = {
  mappings: {
    int: "num",
    float: "decimal",
    bool: "bool",
    string: "str",
    void: "nil",
    for: "for_each",
    while: "while_do",
    break: "break_loop",
    continue: "next_loop",
    if: "if_then",
    else: "else_branch",
    return: "return_value",
    print: "puts",
    scan: "gets",
    switch: "case_of",
    case: "when_case",
    default: "otherwise",
    variavel: "var",
    funcao: "def",
  },
  operatorWordMap: {
    logical_or: "or_word",
    logical_and: "and_word",
    logical_not: "not_word",
    less: "lt",
    less_equal: "lte",
    greater: "gt",
    greater_equal: "gte",
    equal_equal: "eq",
    not_equal: "neq",
  },
  booleanLiteralMap: { true: "true_word", false: "false_word" },
  statementTerminatorLexeme: "",
  blockDelimiters: { open: "inicio", close: "fim" },
  modes: {
    semicolon: "optional-eol",
    block: "delimited",
    typing: "untyped",
    array: "dynamic",
  },
} as const;

type StyledPresetExpectation = {
  mappings: Record<(typeof STYLED_KEYWORDS)[number], string>;
  operatorWordMap: Record<(typeof DEFAULT_OPERATOR_WORD_KEYS)[number], string>;
  booleanLiteralMap: { true: string; false: string };
  statementTerminatorLexeme: string;
  blockDelimiters: { open: string; close: string };
  modes: {
    semicolon: "required" | "optional-eol";
    block: "delimited" | "indentation";
    typing: "typed" | "untyped";
    array: "fixed" | "dynamic";
  };
};

function expectStyledPreset(
  next: ReturnType<typeof getDefaultCustomizationState>,
  expected: StyledPresetExpectation,
) {
  expect(
    next.mappings.map(({ original, custom }) => [original, custom]),
  ).toEqual(
    STYLED_KEYWORDS.map((keyword) => [keyword, expected.mappings[keyword]]),
  );
  expect(next.operatorWordMap).toEqual(expected.operatorWordMap);
  expect(next.booleanLiteralMap).toEqual(expected.booleanLiteralMap);
  expect(next.statementTerminatorLexeme).toBe(
    expected.statementTerminatorLexeme,
  );
  expect(next.blockDelimiters).toEqual(expected.blockDelimiters);
  expect(next.modes).toEqual(expected.modes);
}

describe("wizard-model", () => {
  it("keeps the step order from the spec", () => {
    expect(WIZARD_STEPS.map((step) => step.id)).toEqual([
      "identity",
      "IO",
      "types",
      "structure",
      "rules",
      "flow",
      "review",
    ]);
  });

  it("maps current persisted fields into the merged variables step", () => {
    expect(getWizardStepFields("types")).toEqual([
      "int",
      "float",
      "bool",
      "string",
      "variavel",
      "modes.typing",
    ]);
  });

  it("maps terminator, array and block controls into the structure step", () => {
    expect(getWizardStepFields("structure")).toEqual([
      "statementTerminatorLexeme",
      "modes.semicolon",
      "modes.array",
      "void",
      "funcao",
      "modes.block",
      "blockDelimiters",
    ]);
  });

  it("applies the didactic preset with explicit aliases for every supported surface", () => {
    const base = getDefaultCustomizationState();
    const next = applyWizardPreset(base, "didactic-pt");

    expectStyledPreset(next, DIDACTIC_PT_EXPECTED);
  });

  it("applies the python-like preset with indentation and explicit aliases for every supported surface", () => {
    const base = getDefaultCustomizationState();
    const next = applyWizardPreset(base, "python-like");

    expectStyledPreset(next, PYTHON_LIKE_EXPECTED);
  });

  it("applies the ruby-like preset with inicio and fim block delimiters for every supported surface", () => {
    const base = getDefaultCustomizationState();
    const next = applyWizardPreset(base, "ruby-like");

    expectStyledPreset(next, RUBY_LIKE_EXPECTED);
  });

  it("applies the mineres-like preset with explicit aliases for every supported surface", () => {
    const base = getDefaultCustomizationState();
    const next = applyWizardPreset(base, "mineres-like");

    expectStyledPreset(next, MINERES_LIKE_EXPECTED);
  });

  it("applies the minimal preset with short aliases for every supported surface", () => {
    const base = getDefaultCustomizationState();
    const next = applyWizardPreset(base, "minimal");

    expectStyledPreset(next, MINIMAL_EXPECTED);
  });

  it("resets back to a clean base for the free preset", () => {
    const base = getDefaultCustomizationState();
    const mutated = {
      ...base,
      mappings: base.mappings.map((item) =>
        item.original === "print"
          ? { ...item, custom: "escreva" }
          : item.original === "return"
            ? { ...item, custom: "entregue" }
            : item,
      ),
      operatorWordMap: { ...base.operatorWordMap, plus: "mais" },
      statementTerminatorLexeme: ";",
    };

    const free = applyWizardPreset(mutated, "free");

    expect(
      free.mappings.find((item) => item.original === "print")?.custom,
    ).toBe("print");
    expect(
      free.mappings.find((item) => item.original === "return")?.custom,
    ).toBe("return");
    expect(free.operatorWordMap).toEqual({});
    expect(free.statementTerminatorLexeme).toBe("");
  });

  it("publishes labels for the stylized preset set", () => {
    expect(WIZARD_PRESET_LABELS).toMatchObject({
      "didactic-pt": "Didatica em Portugues",
      minimal: "Minimalista",
      "python-like": "Pythonica",
      "ruby-like": "Ruby-like",
      "mineres-like": "Mineres",
      free: "Livre",
    });
    expect(WIZARD_PRESET_LABELS).not.toHaveProperty("traditional");
  });
});

describe("buildLexerConfigFromCustomization", () => {
  it("normalizes the draft into the same grammar payload shape used today", () => {
    const draft = getDefaultCustomizationState();
    draft.modes.typing = "untyped";
    draft.modes.array = "dynamic";
    draft.blockDelimiters = { open: " inicio ", close: " fim " };
    draft.statementTerminatorLexeme = " @@ ";

    expect(buildLexerConfigFromCustomization(draft)).toMatchObject({
      grammar: {
        semicolonMode: draft.modes.semicolon,
        blockMode: draft.modes.block,
        typingMode: "untyped",
        arrayMode: "dynamic",
      },
      statementTerminatorLexeme: "@@",
      blockDelimiters: { open: "inicio", close: "fim" },
    });
  });

  it("omits semicolon terminator from the compiler payload because it is built in", () => {
    const draft = getDefaultCustomizationState();
    draft.statementTerminatorLexeme = " ; ";

    expect(buildLexerConfigFromCustomization(draft)).not.toHaveProperty(
      "statementTerminatorLexeme",
    );
  });
});
