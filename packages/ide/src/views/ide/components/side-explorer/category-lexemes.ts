import { PREVIEW_CATEGORIES } from "@/components/keyword-customizer/preview-panel/categories-list";
import {
  DEFAULT_BOOLEAN_LITERAL_MAP,
  DEFAULT_OPERATOR_WORD_MAP,
} from "@/lib/keyword-map";
import { OPERATOR_WORD_FIELDS } from "@/lib/operator-word-map";
import type { LanguageCustomization } from "./language-panel";
import {
  getLanguageLexemeExample,
  type LexemeExampleCategory,
} from "./language-sample";

const OPERATOR_SYMBOLS = Object.fromEntries(
  OPERATOR_WORD_FIELDS.map((field) => [field.key, field.symbol]),
) as Record<keyof typeof DEFAULT_OPERATOR_WORD_MAP, string>;

function getKeywordValue(
  customization: LanguageCustomization,
  original: string,
): string {
  return (
    customization.mappings.find((item) => item.original === original)?.custom ||
    original
  );
}

export function getCategoryLexemes(
  categoryKey: (typeof PREVIEW_CATEGORIES)[number]["key"],
  customization: LanguageCustomization,
): string[] {
  switch (categoryKey) {
    case "entrada":
      return [
        getKeywordValue(customization, "print"),
        getKeywordValue(customization, "scan"),
      ];
    case "tipos":
      if (customization.modes.typing === "untyped") {
        return [
          getKeywordValue(customization, "variable"),
          getKeywordValue(customization, "function"),
        ];
      }

      return [
        getKeywordValue(customization, "int"),
        getKeywordValue(customization, "float"),
        getKeywordValue(customization, "bool"),
        getKeywordValue(customization, "string"),
        getKeywordValue(customization, "void"),
        getKeywordValue(customization, "variable"),
        getKeywordValue(customization, "function"),
      ];
    case "lacos":
      return [
        getKeywordValue(customization, "for"),
        getKeywordValue(customization, "while"),
      ];
    case "fluxo":
      return [
        getKeywordValue(customization, "if"),
        getKeywordValue(customization, "else"),
        getKeywordValue(customization, "switch"),
        getKeywordValue(customization, "case"),
        getKeywordValue(customization, "default"),
        getKeywordValue(customization, "break"),
        getKeywordValue(customization, "continue"),
        getKeywordValue(customization, "return"),
      ];
    case "estrutura":
      return [
        customization.modes.block === "delimited"
          ? customization.blockDelimiters.open?.trim()
          : "",
        customization.modes.block === "delimited"
          ? customization.blockDelimiters.close?.trim()
          : "",
        customization.modes.semicolon === "required"
          ? customization.statementTerminatorLexeme?.trim()
          : "",
      ].filter((lexeme): lexeme is string => Boolean(lexeme));
    case "operadores":
      return [
        customization.operatorWordMap.logical_and?.trim() ||
          OPERATOR_SYMBOLS.logical_and,
        customization.operatorWordMap.logical_or?.trim() ||
          OPERATOR_SYMBOLS.logical_or,
        customization.operatorWordMap.logical_not?.trim() ||
          OPERATOR_SYMBOLS.logical_not,
        customization.operatorWordMap.less?.trim() ||
          OPERATOR_SYMBOLS.less,
        customization.operatorWordMap.less_equal?.trim() ||
          OPERATOR_SYMBOLS.less_equal,
        customization.operatorWordMap.greater?.trim() ||
          OPERATOR_SYMBOLS.greater,
        customization.operatorWordMap.greater_equal?.trim() ||
          OPERATOR_SYMBOLS.greater_equal,
        customization.operatorWordMap.equal_equal?.trim() ||
          OPERATOR_SYMBOLS.equal_equal,
        customization.operatorWordMap.not_equal?.trim() ||
          OPERATOR_SYMBOLS.not_equal,
        customization.booleanLiteralMap.true?.trim() ||
          DEFAULT_BOOLEAN_LITERAL_MAP.true,
        customization.booleanLiteralMap.false?.trim() ||
          DEFAULT_BOOLEAN_LITERAL_MAP.false,
      ];
    default:
      return [];
  }
}

export function getCategoryLexemeExample(
  categoryKey: (typeof PREVIEW_CATEGORIES)[number]["key"],
  lexeme: string,
  customization: LanguageCustomization,
): string | null {
  return getLanguageLexemeExample(
    categoryKey as LexemeExampleCategory,
    lexeme,
    customization,
  );
}
