import type { StoredKeywordCustomization } from "@/contexts/keyword/types";
import { CUSTOMIZABLE_KEYWORDS, ORIGINAL_KEYWORDS } from "@/contexts/keyword";
import type { WizardPresetId } from "@/components/keyword-customizer/wizard-model";

export const DEFAULT_LANGUAGE_KEY_PREFIX = "builtin:";
export const PORTUGOL_LANGUAGE_KEY = `${DEFAULT_LANGUAGE_KEY_PREFIX}portugol`;

export type DefaultLanguage = {
  key: string;
  name: string;
  description: string;
  imageUrl: string;
  imageQuery: string;
  presetId: WizardPresetId;
  customization: StoredKeywordCustomization;
};

type KeywordOverrides = Record<(typeof ORIGINAL_KEYWORDS)[number], string>;

function createCustomization(
  mappings: KeywordOverrides,
  customization: Omit<StoredKeywordCustomization, "mappings" | "languageDocumentation">,
): StoredKeywordCustomization {
  return {
    mappings: ORIGINAL_KEYWORDS.map((original) => ({
      original,
      custom: mappings[original],
      tokenId: CUSTOMIZABLE_KEYWORDS[original],
    })),
    ...customization,
    languageDocumentation: {},
  };
}

const PORTUGOL_CUSTOMIZATION = createCustomization(
  {
    int: "inteiro",
    float: "real",
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
    variable: "variavel",
    function: "funcao",
  },
  {
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
  },
);

const PYTHON_LIKE_CUSTOMIZATION = createCustomization(
  {
    int: "number",
    float: "float",
    bool: "bool",
    string: "str",
    void: "none",
    for: "for",
    while: "while",
    break: "break",
    continue: "continue",
    if: "if",
    else: "else",
    return: "return",
    print: "print",
    scan: "input",
    switch: "match",
    case: "case",
    default: "default",
    variable: "let",
    function: "def",
  },
  {
    operatorWordMap: {
      logical_or: "or",
      logical_and: "and",
      logical_not: "not",
      less: "lt",
      less_equal: "lte",
      greater: "gt",
      greater_equal: "gte",
      equal_equal: "eq",
      not_equal: "neq",
    },
    booleanLiteralMap: {
      true: "True",
      false: "False",
    },
    statementTerminatorLexeme: "",
    blockDelimiters: { open: "", close: "" },
    modes: {
      semicolon: "optional-eol",
      block: "indentation",
      typing: "untyped",
      array: "dynamic",
    },
  },
);

const C_LIKE_CUSTOMIZATION = createCustomization(
  {
    int: "int",
    float: "float",
    bool: "bool",
    string: "string",
    void: "void",
    for: "for",
    while: "while",
    break: "break",
    continue: "continue",
    if: "if",
    else: "else",
    return: "return",
    print: "printf",
    scan: "scanf",
    switch: "switch",
    case: "case",
    default: "default",
    variable: "var",
    function: "function",
  },
  {
    operatorWordMap: {},
    booleanLiteralMap: {
      true: "true",
      false: "false",
    },
    statementTerminatorLexeme: ";",
    blockDelimiters: { open: "{", close: "}" },
    modes: {
      semicolon: "required",
      block: "delimited",
      typing: "typed",
      array: "fixed",
    },
  },
);

const RUBY_LIKE_CUSTOMIZATION = createCustomization(
  {
    int: "number",
    float: "decimal",
    bool: "boolean",
    string: "string",
    void: "nil",
    for: "for",
    while: "while",
    break: "break",
    continue: "next",
    if: "if",
    else: "else",
    return: "return",
    print: "puts",
    scan: "gets",
    switch: "case",
    case: "when",
    default: "else_case",
    variable: "local",
    function: "def",
  },
  {
    operatorWordMap: {
      logical_or: "or",
      logical_and: "and",
      logical_not: "not",
      less: "lt",
      less_equal: "lte",
      greater: "gt",
      greater_equal: "gte",
      equal_equal: "eq",
      not_equal: "neq",
    },
    booleanLiteralMap: {
      true: "true",
      false: "false",
    },
    statementTerminatorLexeme: "",
    blockDelimiters: { open: "do", close: "end" },
    modes: {
      semicolon: "optional-eol",
      block: "delimited",
      typing: "untyped",
      array: "dynamic",
    },
  },
);

export const DEFAULT_LANGUAGES: DefaultLanguage[] = [
  {
    key: PORTUGOL_LANGUAGE_KEY,
    name: "Portugol",
    description: "Linguagem padrao em portugues com blocos inicio/fim.",
    imageUrl: "/images/language-default.png",
    imageQuery: "portuguese educational programming language",
    presetId: "didactic-pt",
    customization: PORTUGOL_CUSTOMIZATION,
  },
  {
    key: `${DEFAULT_LANGUAGE_KEY_PREFIX}python-like`,
    name: "Python-like",
    description: "Sintaxe por indentacao, sem ponto e virgula obrigatorio.",
    imageUrl: "/images/ed.png",
    imageQuery: "python indentation programming language",
    presetId: "python-like",
    customization: PYTHON_LIKE_CUSTOMIZATION,
  },
  {
    key: `${DEFAULT_LANGUAGE_KEY_PREFIX}c-like`,
    name: "C-like",
    description: "Sintaxe com chaves, tipos explicitos e ponto e virgula.",
    imageUrl: "/images/ein.png",
    imageQuery: "c programming language braces",
    presetId: "free",
    customization: C_LIKE_CUSTOMIZATION,
  },
  {
    key: `${DEFAULT_LANGUAGE_KEY_PREFIX}ruby-like`,
    name: "Ruby-like",
    description: "Sintaxe com blocos do/end e comandos sem ponto e virgula.",
    imageUrl: "/images/ed-ein.png",
    imageQuery: "ruby programming language blocks",
    presetId: "ruby-like",
    customization: RUBY_LIKE_CUSTOMIZATION,
  },
];

export function isDefaultLanguageKey(key: string): boolean {
  return DEFAULT_LANGUAGES.some((language) => language.key === key);
}

export function getDefaultLanguage(
  key = PORTUGOL_LANGUAGE_KEY,
): DefaultLanguage {
  return (
    DEFAULT_LANGUAGES.find((language) => language.key === key) ??
    DEFAULT_LANGUAGES[0]
  );
}

export function getDefaultLanguageCustomization(): StoredKeywordCustomization {
  const customization = getDefaultLanguage().customization;
  return {
    ...customization,
    mappings: customization.mappings.map((mapping) => ({ ...mapping })),
    operatorWordMap: { ...customization.operatorWordMap },
    booleanLiteralMap: { ...customization.booleanLiteralMap },
    blockDelimiters: { ...customization.blockDelimiters },
    modes: { ...customization.modes },
    languageDocumentation: { ...customization.languageDocumentation },
  };
}
