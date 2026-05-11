import { PREVIEW_CATEGORIES } from "@/components/keyword-customizer/preview-panel/categories-list";
import { LanguageCustomization } from "./language-panel";

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
      return [
        getKeywordValue(customization, "int"),
        getKeywordValue(customization, "float"),
        getKeywordValue(customization, "bool"),
        getKeywordValue(customization, "string"),
        getKeywordValue(customization, "void"),
        getKeywordValue(customization, "variavel"),
        getKeywordValue(customization, "funcao"),
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
        customization.blockDelimiters.open?.trim() || "{",
        customization.blockDelimiters.close?.trim() || "}",
        customization.statementTerminatorLexeme?.trim() || ";",
      ];
    case "operadores":
      return [
        customization.operatorWordMap.logical_and?.trim() || "and",
        customization.operatorWordMap.logical_or?.trim() || "or",
        customization.operatorWordMap.logical_not?.trim() || "not",
        customization.operatorWordMap.less?.trim() || "less",
        customization.operatorWordMap.less_equal?.trim() || "less_equal",
        customization.operatorWordMap.greater?.trim() || "greater",
        customization.operatorWordMap.greater_equal?.trim() || "greater_equal",
        customization.operatorWordMap.equal_equal?.trim() || "equals",
        customization.operatorWordMap.not_equal?.trim() || "not_equal",
        customization.booleanLiteralMap.true?.trim() || "true",
        customization.booleanLiteralMap.false?.trim() || "false",
      ];
    default:
      return [];
  }
}
