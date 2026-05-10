import type { StoredKeywordCustomization } from "@/contexts/keyword/types";

export type WizardStepId =
  | "identity"
  | "types"
  | "IO"
  | "structure"
  | "rules"
  | "flow"
  | "review";

export type WizardStepIcon =
  | "fingerprint"
  | "book-open-text"
  | "cable"
  | "blocks"
  | "sigma"
  | "route"
  | "clipboard-check";

export type WizardPresetId =
  | "didactic-pt"
  | "minimal"
  | "python-like"
  | "ruby-like"
  | "mineres-like"
  | "free";

type WizardPresetDefinition = {
  label: string;
};

type StyledPresetMappings = {
  int: string;
  float: string;
  bool: string;
  string: string;
  void: string;
  for: string;
  while: string;
  break: string;
  continue: string;
  if: string;
  else: string;
  return: string;
  print: string;
  scan: string;
  switch: string;
  case: string;
  default: string;
  variavel: string;
  funcao: string;
};

type StyledOperatorWordMap = Required<
  StoredKeywordCustomization["operatorWordMap"]
>;

type StyledWizardPresetDefinition = WizardPresetDefinition & {
  mappings: StyledPresetMappings;
  operatorWordMap: StyledOperatorWordMap;
  booleanLiteralMap: StoredKeywordCustomization["booleanLiteralMap"];
  statementTerminatorLexeme: string;
  blockDelimiters: StoredKeywordCustomization["blockDelimiters"];
  modes: StoredKeywordCustomization["modes"];
};

const DIDACTIC_PT_PRESET: StyledWizardPresetDefinition = {
  label: "Didatica em Portugues",
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
  booleanLiteralMap: {
    true: "verdadeiro",
    false: "falso",
  },
  statementTerminatorLexeme: ";",
  blockDelimiters: { open: "inicio", close: "fim" },
  modes: {
    semicolon: "required",
    block: "delimited",
    typing: "typed",
    array: "fixed",
  },
};

const MINIMAL_PRESET: StyledWizardPresetDefinition = {
  label: "Minimalista",
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
  booleanLiteralMap: {
    true: "1",
    false: "0",
  },
  statementTerminatorLexeme: ".",
  blockDelimiters: { open: "[", close: "]" },
  modes: {
    semicolon: "optional-eol",
    block: "delimited",
    typing: "untyped",
    array: "dynamic",
  },
};

const PYTHON_LIKE_PRESET: StyledWizardPresetDefinition = {
  label: "Pythonica",
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
  booleanLiteralMap: {
    true: "verdadeiro",
    false: "falso",
  },
  statementTerminatorLexeme: "",
  blockDelimiters: { open: "", close: "" },
  modes: {
    semicolon: "optional-eol",
    block: "indentation",
    typing: "untyped",
    array: "dynamic",
  },
};

const RUBY_LIKE_PRESET: StyledWizardPresetDefinition = {
  label: "Ruby-like",
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
  booleanLiteralMap: {
    true: "true_word",
    false: "false_word",
  },
  statementTerminatorLexeme: "",
  blockDelimiters: { open: "inicio", close: "fim" },
  modes: {
    semicolon: "optional-eol",
    block: "delimited",
    typing: "untyped",
    array: "dynamic",
  },
};

const MINERES_LIKE_PRESET: StyledWizardPresetDefinition = {
  label: "Mineres",
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
  booleanLiteralMap: {
    true: "eh",
    false: "num_eh",
  },
  statementTerminatorLexeme: "uai",
  blockDelimiters: { open: "simbora", close: "cabo" },
  modes: {
    semicolon: "required",
    block: "delimited",
    typing: "typed",
    array: "fixed",
  },
};

const FREE_PRESET: WizardPresetDefinition = {
  label: "Livre",
};

const WIZARD_PRESETS: Record<WizardPresetId, WizardPresetDefinition> = {
  "didactic-pt": DIDACTIC_PT_PRESET,
  minimal: MINIMAL_PRESET,
  "python-like": PYTHON_LIKE_PRESET,
  "ruby-like": RUBY_LIKE_PRESET,
  "mineres-like": MINERES_LIKE_PRESET,
  free: FREE_PRESET,
};

export const WIZARD_PRESET_LABELS: Record<WizardPresetId, string> = {
  "didactic-pt": DIDACTIC_PT_PRESET.label,
  minimal: MINIMAL_PRESET.label,
  "python-like": PYTHON_LIKE_PRESET.label,
  "ruby-like": RUBY_LIKE_PRESET.label,
  "mineres-like": MINERES_LIKE_PRESET.label,
  free: FREE_PRESET.label,
};

export const WIZARD_STEPS = [
  {
    id: "identity",
    title: "Identidade",
    description: "Escolha o ponto de partida da linguagem.",
    icon: "fingerprint",
  },

  {
    id: "IO",
    title: "Entrada/Saída",
    description: "Defina saída, leitura e a linguagem das variáveis.",
    icon: "cable",
  },
  {
    id: "types",
    title: "Tipagem",
    description:
      "Defina leitura, escrita e o vocabulário usado para declarar variáveis.",
    icon: "book-open-text",
  },
  {
    id: "structure",
    title: "Estrutura",
    description: "Configure blocos, delimitadores e o fim das instruções.",
    icon: "blocks",
  },
  {
    id: "rules",
    title: "Operadores",
    description:
      "Ajuste os operadores, literais booleanos e regras de decisão.",
    icon: "sigma",
  },
  {
    id: "flow",
    title: "Fluxo",
    description: "Customize o vocabulario de controle.",
    icon: "route",
  },
  {
    id: "review",
    title: "Revisão",
    description: "Confira o resumo final antes de salvar.",
    icon: "clipboard-check",
  },
] as const;

const STEP_FIELDS: Record<WizardStepId, string[]> = {
  identity: [],
  IO: ["print", "scan"],
  types: ["int", "float", "bool", "string", "variavel", "modes.typing"],
  structure: [
    "statementTerminatorLexeme",
    "modes.semicolon",
    "modes.array",
    "void",
    "funcao",
    "modes.block",
    "blockDelimiters",
  ],
  rules: ["booleanLiteralMap", "operatorWordMap"],
  flow: [
    "if",
    "else",
    "while",
    "for",
    "return",
    "break",
    "continue",
    "switch",
    "case",
    "default",
  ],
  review: [],
};

export function getWizardStepFields(stepId: WizardStepId) {
  return STEP_FIELDS[stepId];
}

function createBasePresetState(
  state: StoredKeywordCustomization,
): StoredKeywordCustomization {
  return {
    ...state,
    mappings: state.mappings.map((item) => ({
      ...item,
      custom: item.original,
    })),
    operatorWordMap: {},
    booleanLiteralMap: { true: "true", false: "false" },
    statementTerminatorLexeme: "",
    blockDelimiters: { open: "", close: "" },
  };
}

function replaceMapping(
  state: StoredKeywordCustomization,
  original: string,
  custom: string,
): StoredKeywordCustomization {
  return {
    ...state,
    mappings: state.mappings.map((item) =>
      item.original === original ? { ...item, custom } : item,
    ),
  };
}

function replaceMappings(
  state: StoredKeywordCustomization,
  mappingOverrides: StyledPresetMappings,
): StoredKeywordCustomization {
  return Object.entries(mappingOverrides).reduce(
    (current, [original, custom]) => replaceMapping(current, original, custom),
    state,
  );
}

function isStyledPreset(
  preset: WizardPresetDefinition,
): preset is StyledWizardPresetDefinition {
  return "mappings" in preset;
}

export function applyWizardPreset(
  state: StoredKeywordCustomization,
  presetId: WizardPresetId,
): StoredKeywordCustomization {
  const preset = WIZARD_PRESETS[presetId];
  const baseState = createBasePresetState(state);

  if (!isStyledPreset(preset)) {
    return baseState;
  }

  return {
    ...replaceMappings(baseState, preset.mappings),
    operatorWordMap: { ...preset.operatorWordMap },
    booleanLiteralMap: { ...preset.booleanLiteralMap },
    statementTerminatorLexeme: preset.statementTerminatorLexeme,
    blockDelimiters: { ...preset.blockDelimiters },
    modes: { ...preset.modes },
  };
}
