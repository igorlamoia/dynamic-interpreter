import { DEFAULT_BOOLEAN_LITERAL_MAP } from "@/lib/keyword-map";
import { OPERATOR_WORD_FIELDS } from "@/lib/operator-word-map";
import type { StoredKeywordCustomization } from "@/contexts/keyword/types";
import type { IDEOperatorWordMap } from "@/entities/compiler-config";

type KeywordCategory =
  | "Tipo"
  | "Condicional"
  | "Laço de repetição"
  | "Controle de fluxo"
  | "Entrada/Saída";

export type ResolvedLanguageDocumentation = {
  id: string;
  lexeme: string;
  category: string;
  description: string;
};

const KEYWORD_CATEGORY_BY_ORIGINAL: Record<string, KeywordCategory> = {
  int: "Tipo",
  float: "Tipo",
  bool: "Tipo",
  string: "Tipo",
  void: "Tipo",
  variable: "Tipo",
  function: "Tipo",
  if: "Condicional",
  else: "Condicional",
  switch: "Condicional",
  case: "Condicional",
  default: "Condicional",
  for: "Laço de repetição",
  while: "Laço de repetição",
  break: "Controle de fluxo",
  continue: "Controle de fluxo",
  return: "Controle de fluxo",
  print: "Entrada/Saída",
  scan: "Entrada/Saída",
};

const DEFAULT_DESCRIPTIONS: Record<string, string> = {
  "keyword.int": "Declara valores inteiros na linguagem.",
  "keyword.float": "Declara valores numéricos com parte decimal.",
  "keyword.bool": "Declara valores booleanos.",
  "keyword.string": "Declara textos.",
  "keyword.void": "Declara funções sem valor de retorno.",
  "keyword.variable": "Declara variáveis em modo não tipado.",
  "keyword.function": "Declara funções em modo não tipado.",
  "keyword.if": "Inicia uma decisão condicional.",
  "keyword.else": "Define o ramo alternativo de uma decisão.",
  "keyword.switch": "Seleciona um fluxo com múltiplos casos.",
  "keyword.case": "Define um caso dentro de uma seleção.",
  "keyword.default": "Define o caso padrão de uma seleção.",
  "keyword.for": "Executa um laço com inicialização, condição e atualização.",
  "keyword.while": "Executa um laço enquanto a condição for verdadeira.",
  "keyword.break": "Interrompe imediatamente o laço ou bloco de seleção atual.",
  "keyword.continue": "Pula para a próxima iteração do laço atual.",
  "keyword.return": "Encerra a função atual e retorna um valor quando aplicável.",
  "keyword.print": "Exibe valores na saída da linguagem.",
  "keyword.scan": "Lê valores de entrada para o programa.",
  "operator.logical_or":
    "Retorna verdadeiro quando pelo menos uma condição é verdadeira.",
  "operator.logical_and":
    "Retorna verdadeiro quando todas as condições são verdadeiras.",
  "operator.logical_not": "Inverte o valor lógico de uma expressão.",
  "operator.less": "Compara se o valor da esquerda é menor que o da direita.",
  "operator.less_equal":
    "Compara se o valor da esquerda é menor ou igual ao da direita.",
  "operator.greater":
    "Compara se o valor da esquerda é maior que o da direita.",
  "operator.greater_equal":
    "Compara se o valor da esquerda é maior ou igual ao da direita.",
  "operator.equal_equal":
    "Compara se dois valores possuem o mesmo conteúdo.",
  "operator.not_equal":
    "Compara se dois valores são diferentes entre si.",
  "boolean.true": "Representa o valor lógico verdadeiro.",
  "boolean.false": "Representa o valor lógico falso.",
  "terminator.statement": "Marca o fim de uma instrução na linguagem.",
  "delimiter.open": "Marca a abertura de um bloco delimitado.",
  "delimiter.close": "Marca o fechamento de um bloco delimitado.",
};

function trimLexeme(value: string | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

export function getKeywordDocumentationId(original: string): string {
  return `keyword.${original}`;
}

export function getOperatorDocumentationId(
  key: keyof IDEOperatorWordMap,
): string {
  return `operator.${key}`;
}

export function getBooleanDocumentationId(
  value: "true" | "false",
): string {
  return `boolean.${value}`;
}

export function getDefaultDocumentationDescription(id: string): string {
  return DEFAULT_DESCRIPTIONS[id] ?? "Elemento customizável da linguagem.";
}

export function getDocumentationCategory(id: string): string {
  if (id.startsWith("keyword.")) {
    const original = id.slice("keyword.".length);
    return KEYWORD_CATEGORY_BY_ORIGINAL[original] ?? "Palavra-chave";
  }

  if (id.startsWith("operator.")) return "Operador";
  if (id.startsWith("boolean.")) return "Literal booleano";
  if (id === "terminator.statement") return "Terminador";
  if (id.startsWith("delimiter.")) return "Delimitador de bloco";

  return "Palavra-chave";
}

function resolveKeywordLexeme(
  lexeme: string,
  customization: StoredKeywordCustomization,
): ResolvedLanguageDocumentation | null {
  const mapping = customization.mappings.find(
    (item) => trimLexeme(item.custom) === lexeme,
  );
  if (!mapping) return null;

  const id = getKeywordDocumentationId(mapping.original);
  return buildResolvedEntry(id, lexeme, customization);
}

function resolveOperatorLexeme(
  lexeme: string,
  customization: StoredKeywordCustomization,
): ResolvedLanguageDocumentation | null {
  for (const field of OPERATOR_WORD_FIELDS) {
    if (trimLexeme(customization.operatorWordMap[field.key]) !== lexeme) {
      continue;
    }

    return buildResolvedEntry(
      getOperatorDocumentationId(field.key),
      lexeme,
      customization,
    );
  }

  return null;
}

function resolveBooleanLexeme(
  lexeme: string,
  customization: StoredKeywordCustomization,
): ResolvedLanguageDocumentation | null {
  const booleanLiterals = {
    ...DEFAULT_BOOLEAN_LITERAL_MAP,
    ...customization.booleanLiteralMap,
  };

  for (const value of ["true", "false"] as const) {
    if (trimLexeme(booleanLiterals[value]) !== lexeme) continue;

    return buildResolvedEntry(
      getBooleanDocumentationId(value),
      lexeme,
      customization,
    );
  }

  return null;
}

function resolveStatementTerminatorLexeme(
  lexeme: string,
  customization: StoredKeywordCustomization,
): ResolvedLanguageDocumentation | null {
  if (trimLexeme(customization.statementTerminatorLexeme) !== lexeme) {
    return null;
  }

  return buildResolvedEntry("terminator.statement", lexeme, customization);
}

function resolveDelimiterLexeme(
  lexeme: string,
  customization: StoredKeywordCustomization,
): ResolvedLanguageDocumentation | null {
  if (customization.modes.block !== "delimited") return null;

  const open = trimLexeme(customization.blockDelimiters.open);
  if (open && open === lexeme) {
    return buildResolvedEntry("delimiter.open", lexeme, customization);
  }

  const close = trimLexeme(customization.blockDelimiters.close);
  if (close && close === lexeme) {
    return buildResolvedEntry("delimiter.close", lexeme, customization);
  }

  return null;
}

function buildResolvedEntry(
  id: string,
  lexeme: string,
  customization: StoredKeywordCustomization,
): ResolvedLanguageDocumentation {
  const userDescription = trimLexeme(
    customization.languageDocumentation[id]?.description,
  );

  return {
    id,
    lexeme,
    category: getDocumentationCategory(id),
    description: userDescription || getDefaultDocumentationDescription(id),
  };
}

export function resolveDocumentationByLexeme(
  lexeme: string,
  customization: StoredKeywordCustomization,
): ResolvedLanguageDocumentation | null {
  const normalizedLexeme = trimLexeme(lexeme);
  if (!normalizedLexeme) return null;

  return (
    resolveKeywordLexeme(normalizedLexeme, customization) ||
    resolveOperatorLexeme(normalizedLexeme, customization) ||
    resolveBooleanLexeme(normalizedLexeme, customization) ||
    resolveStatementTerminatorLexeme(normalizedLexeme, customization) ||
    resolveDelimiterLexeme(normalizedLexeme, customization)
  );
}
