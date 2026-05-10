import { z } from "zod";
import type {
  IDEBooleanLiteralMap,
  IDEKeywordCustomizationModes,
  IDEOperatorWordMap,
} from "@/entities/compiler-config";
import { DEFAULT_BOOLEAN_LITERAL_MAP } from "@/lib/keyword-map";
import type { KeywordMapping, BlockDelimiters } from "./types";
import { ORIGINAL_KEYWORDS } from ".";
import ui from "@/i18n/locales/pt-BR/ui";
export { validateOperatorWordMap as validateOperatorWordMap } from "@/lib/operator-word-map";

type StatementTerminatorValidationCustomization = {
  mappings: KeywordMapping[];
  operatorWordMap: IDEOperatorWordMap;
  booleanLiteralMap: IDEBooleanLiteralMap;
  statementTerminatorLexeme: string;
  blockDelimiters: BlockDelimiters;
  modes: IDEKeywordCustomizationModes;
};

export const WORD_REGEX = /^[A-Za-z_][A-Za-z0-9_]*$/;

export const RESERVED_STATEMENT_TERMINATOR_CHARS = new Set([
  ";",
  ",",
  "{",
  "}",
  "(",
  ")",
  "[",
  "]",
  ".",
  ":",
  "+",
  "-",
  "*",
  "/",
  "%",
  "=",
  ">",
  "<",
  "!",
  "|",
  "&",
]);

export function createKeywordSchema(
  mappingsToValidate: KeywordMapping[],
  booleanLiteralMap: IDEBooleanLiteralMap,
) {
  return z
    .object({
      original: z.string(),
      custom: z
        .string()
        .trim()
        .min(1, ui.validation_empty_word)
        .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, ui.validation_invalid_word_format),
    })
    .superRefine((value, ctx) => {
      const booleanLiteralWords = new Set(
        Object.values(booleanLiteralMap)
          .map((item) => item?.trim())
          .filter((item): item is string => Boolean(item)),
      );

      if (booleanLiteralWords.has(value.custom)) {
        ctx.addIssue({
          code: "custom",
          message: ui.validation_boolean_literal_conflict.replace(
            "{value}",
            value.custom,
          ),
        });
        return;
      }

      const conflict = mappingsToValidate.find(
        (m) => m.original !== value.original && m.custom === value.custom,
      );
      if (conflict) {
        ctx.addIssue({
          code: "custom",
          message: ui.validation_keyword_already_used
            .replace("{value}", value.custom)
            .replace("{original}", conflict.original),
        });
      }
    });
}

export function validateCustomKeyword(
  original: string,
  custom: string,
  mappingsToValidate: KeywordMapping[],
  booleanLiteralMap: IDEBooleanLiteralMap = DEFAULT_BOOLEAN_LITERAL_MAP,
): string | null {
  const parsed = createKeywordSchema(
    mappingsToValidate,
    booleanLiteralMap,
  ).safeParse({
    original,
    custom,
  });
  if (!parsed.success) {
    return parsed.error.issues[0]?.message ?? "Valor inválido.";
  }

  return null;
}

export function validateBlockDelimiters(value: BlockDelimiters): string | null {
  const open = value.open.trim();
  const close = value.close.trim();

  if (!open && !close) return null;
  if (!open || !close) {
    return ui.validation_fill_delimiters;
  }

  if (!WORD_REGEX.test(open) || !WORD_REGEX.test(close)) {
    return ui.validation_invalid_delimiter_format;
  }

  if (open === close) {
    return ui.validation_delimiters_must_differ;
  }

  if (ORIGINAL_KEYWORDS.includes(open) || ORIGINAL_KEYWORDS.includes(close)) {
    return ui.validation_delimiters_reserved;
  }

  return null;
}

export function validateBooleanLiteralAliases(
  value: IDEBooleanLiteralMap,
  mappings: KeywordMapping[],
  operatorWordMap: IDEOperatorWordMap,
  blockDelimiters: BlockDelimiters,
): string | null {
  const seenAliases = new Set<string>();
  const keywordSet = new Set(
    mappings.map((mapping) => mapping.custom.trim()).filter(Boolean),
  );
  const operatorAliases = new Set(
    Object.values(operatorWordMap)
      .map((alias) => alias?.trim())
      .filter((alias): alias is string => Boolean(alias)),
  );
  const openDelimiter = blockDelimiters.open.trim();
  const closeDelimiter = blockDelimiters.close.trim();

  for (const field of ["true", "false"] as const) {
    const rawAlias = value[field];
    const alias = typeof rawAlias === "string" ? rawAlias.trim() : "";

    if (!alias) {
      return ui.validation_fill_boolean_literals;
    }

    if (!WORD_REGEX.test(alias)) {
      return ui.validation_invalid_boolean_literal_format;
    }

    if (seenAliases.has(alias)) {
      return ui.validation_boolean_literals_must_differ;
    }
    seenAliases.add(alias);

    if (keywordSet.has(alias)) {
      return ui.validation_conflicts_keyword_customization.replace(
        "{value}",
        alias,
      );
    }

    if (operatorAliases.has(alias)) {
      return ui.validation_conflicts_operator_alias.replace("{value}", alias);
    }

    if (alias === openDelimiter || alias === closeDelimiter) {
      return ui.validation_conflicts_block_delimiters.replace("{value}", alias);
    }
  }

  return null;
}

export function validateStatementTerminatorLexeme(
  value: string,
  customization: StatementTerminatorValidationCustomization,
): string | null {
  const mappingsToValidate = customization.mappings;
  const operatorWordMapToValidate = customization.operatorWordMap;
  const booleanLiteralMapToValidate = customization.booleanLiteralMap;
  const delimitersToValidate = customization.blockDelimiters;
  const normalized = value.trim();

  if (!normalized) {
    return ui.validation_fill_statement_terminator;
  }

  if (/\s/.test(normalized)) {
    return ui.validation_terminator_no_spaces;
  }

  if (normalized === ";") {
    return ui.validation_terminator_not_semicolon;
  }

  if (
    [...normalized].some((char) =>
      RESERVED_STATEMENT_TERMINATOR_CHARS.has(char),
    )
  ) {
    return ui.validation_terminator_reserved_chars;
  }

  const keywordSet = new Set(
    [
      ...ORIGINAL_KEYWORDS,
      ...Object.values(DEFAULT_BOOLEAN_LITERAL_MAP),
      ...mappingsToValidate.map((mapping) => mapping.custom.trim()),
    ].filter(Boolean),
  );
  const operatorAliases = new Set(
    Object.values(operatorWordMapToValidate)
      .map((alias) => alias?.trim())
      .filter((alias): alias is string => Boolean(alias)),
  );
  const booleanAliases = new Set(
    Object.values({
      ...DEFAULT_BOOLEAN_LITERAL_MAP,
      ...booleanLiteralMapToValidate,
    })
      .map((alias) => alias?.trim())
      .filter((alias): alias is string => Boolean(alias)),
  );
  const openDelimiter = delimitersToValidate.open.trim();
  const closeDelimiter = delimitersToValidate.close.trim();

  if (keywordSet.has(normalized)) {
    return ui.validation_conflicts_keyword_customization.replace(
      "{value}",
      normalized,
    );
  }

  if (operatorAliases.has(normalized)) {
    return ui.validation_conflicts_operator_alias.replace(
      "{value}",
      normalized,
    );
  }

  if (booleanAliases.has(normalized)) {
    return ui.validation_conflicts_boolean_literal_alias.replace(
      "{value}",
      normalized,
    );
  }

  if (normalized === openDelimiter || normalized === closeDelimiter) {
    return ui.validation_conflicts_block_delimiters.replace(
      "{value}",
      normalized,
    );
  }

  return null;
}
