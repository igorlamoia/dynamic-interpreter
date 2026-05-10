import type {
  IDEBooleanLiteralMap,
  IDEOperatorWordMap,
} from "@/entities/compiler-config";
import type { BlockDelimiters, KeywordMapping } from "@/contexts/keyword/types";
import ui from "@/i18n/locales/pt-BR/ui";

export const OPERATOR_ALIAS_REGEX = /^[A-Za-z_][A-Za-z0-9_]*$/;

export const OPERATOR_WORD_FIELDS: Array<{
  key: keyof IDEOperatorWordMap;
  label: string;
  symbol: string;
}> = [
  { key: "logical_or", label: "Logical OR", symbol: "||" },
  { key: "logical_and", label: "Logical AND", symbol: "&&" },
  { key: "logical_not", label: "Logical NOT", symbol: "!" },
  { key: "less", label: "Less than", symbol: "<" },
  { key: "less_equal", label: "Less or equal", symbol: "<=" },
  { key: "greater", label: "Greater than", symbol: ">" },
  { key: "greater_equal", label: "Greater or equal", symbol: ">=" },
  { key: "equal_equal", label: "Equal", symbol: "==" },
  { key: "not_equal", label: "Not equal", symbol: "!=" },
];

export function validateOperatorWordMap(
  operatorWordMap: IDEOperatorWordMap,
  mappings: KeywordMapping[],
  blockDelimiters: BlockDelimiters,
  booleanLiteralMap: IDEBooleanLiteralMap = {},
): string | null {
  const seenAliases = new Map<string, keyof IDEOperatorWordMap>();
  const keywordSet = new Set(
    mappings.map((mapping) => mapping.custom.trim()).filter(Boolean),
  );
  const booleanLiteralSet = new Set(
    Object.values(booleanLiteralMap)
      .map((alias) => alias?.trim())
      .filter((alias): alias is string => Boolean(alias)),
  );
  const openDelimiter = blockDelimiters.open.trim();
  const closeDelimiter = blockDelimiters.close.trim();

  for (const field of OPERATOR_WORD_FIELDS) {
    const rawAlias = operatorWordMap[field.key];
    const alias = typeof rawAlias === "string" ? rawAlias.trim() : "";

    if (!alias) {
      continue;
    }

    if (!OPERATOR_ALIAS_REGEX.test(alias)) {
      return ui.validation_operator_invalid_format;
    }

    if (seenAliases.has(alias)) {
      return ui.validation_operator_already_used.replace("{value}", alias);
    }
    seenAliases.set(alias, field.key);

    if (keywordSet.has(alias)) {
      return ui.validation_conflicts_keyword_customization.replace(
        "{value}",
        alias,
      );
    }

    if (booleanLiteralSet.has(alias)) {
      return ui.validation_conflicts_boolean_literal_alias.replace(
        "{value}",
        alias,
      );
    }

    if (alias === openDelimiter || alias === closeDelimiter) {
      return ui.validation_conflicts_block_delimiters.replace("{value}", alias);
    }
  }

  return null;
}
