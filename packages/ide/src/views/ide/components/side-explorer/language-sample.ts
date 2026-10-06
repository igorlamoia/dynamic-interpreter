import type { StoredKeywordCustomization } from "@/contexts/keyword/types";
import { ORIGINAL_KEYWORDS } from "@/contexts/keyword";
import type { LanguageSampleIntl } from "@/i18n/types/language-sample";
import {
  DEFAULT_BOOLEAN_LITERAL_MAP,
  DEFAULT_OPERATOR_WORD_MAP,
} from "@/lib/keyword-map";

export const DEFAULT_LANGUAGE_SAMPLE_INTL: LanguageSampleIntl = {
  namePrompt: "What is your name?",
  helloWorldPrefix: "hello world, ",
  nameIdentifier: "name",
  counterIdentifier: "count",
  countToThreeFunction: "countToThree",
};

type KeywordName =
  | "int"
  | "string"
  | "void"
  | "function"
  | "variable"
  | "while"
  | "return"
  | "print"
  | "scan";

function getKeyword(
  customization: StoredKeywordCustomization,
  original: KeywordName,
): string {
  return (
    customization.mappings.find((item) => item.original === original)?.custom ||
    original
  );
}

function getStatementTerminator(
  customization: StoredKeywordCustomization,
): string {
  if (customization.modes.semicolon !== "required") return "";
  return customization.statementTerminatorLexeme.trim() || ";";
}

function isWordLikeTerminator(terminator: string): boolean {
  return /^[\p{L}_][\p{L}\p{N}_]*$/u.test(terminator);
}

function endStatement(statement: string, terminator: string): string {
  if (!terminator) return statement;

  const separator = isWordLikeTerminator(terminator) ? " " : "";
  return `${statement}${separator}${terminator}`;
}

function getLessEqualOperator(
  customization: StoredKeywordCustomization,
): string {
  return customization.operatorWordMap.less_equal?.trim() || "<=";
}

function getReservedSampleWords(
  customization: StoredKeywordCustomization,
): Set<string> {
  return new Set(
    [
      ...ORIGINAL_KEYWORDS,
      ...customization.mappings.map((mapping) => mapping.custom.trim()),
      ...Object.values(DEFAULT_BOOLEAN_LITERAL_MAP),
      ...Object.values(customization.booleanLiteralMap),
      ...Object.values(DEFAULT_OPERATOR_WORD_MAP),
      ...Object.values(customization.operatorWordMap),
      customization.blockDelimiters.open.trim(),
      customization.blockDelimiters.close.trim(),
      customization.statementTerminatorLexeme.trim(),
    ].filter((word): word is string => Boolean(word)),
  );
}

function normalizeIdentifier(value: string, fallback: string): string {
  const normalized = value
    .trim()
    .replace(/[^A-Za-z0-9_]/g, "_")
    .replace(/^[^A-Za-z_]+/, "");

  return normalized || fallback;
}

function resolveSampleIdentifier(
  preferred: string,
  fallback: string,
  suffix: string,
  reservedWords: Set<string>,
  usedIdentifiers: Set<string>,
): string {
  const base = normalizeIdentifier(preferred, fallback);
  let candidate = base;
  let index = 2;

  while (reservedWords.has(candidate) || usedIdentifiers.has(candidate)) {
    candidate = `${base}${index === 2 ? suffix : `${suffix}${index}`}`;
    index += 1;
  }

  usedIdentifiers.add(candidate);
  return candidate;
}

function indent(lines: string[]): string[] {
  return lines.map((line) => (line.length > 0 ? `  ${line}` : line));
}

function buildBlock(
  customization: StoredKeywordCustomization,
  header: string,
  body: string[],
): string[] {
  if (customization.modes.block === "indentation") {
    return [`${header}:`, ...indent(body)];
  }

  const open = customization.blockDelimiters.open.trim() || "{";
  const close = customization.blockDelimiters.close.trim() || "}";

  return [`${header} ${open}`, ...indent(body), close];
}

export function buildHelloWorldSample(
  customization: StoredKeywordCustomization,
  intl: LanguageSampleIntl = DEFAULT_LANGUAGE_SAMPLE_INTL,
): string {
  const terminator = getStatementTerminator(customization);
  const print = getKeyword(customization, "print");
  const scan = getKeyword(customization, "scan");
  const returnKeyword = getKeyword(customization, "return");
  const whileKeyword = getKeyword(customization, "while");
  const lessEqual = getLessEqualOperator(customization);
  const isUntyped = customization.modes.typing === "untyped";
  const reservedWords = getReservedSampleWords(customization);
  const usedIdentifiers = new Set<string>();
  const nameIdentifier = resolveSampleIdentifier(
    intl.nameIdentifier,
    DEFAULT_LANGUAGE_SAMPLE_INTL.nameIdentifier,
    "Value",
    reservedWords,
    usedIdentifiers,
  );
  const counterIdentifier = resolveSampleIdentifier(
    intl.counterIdentifier,
    DEFAULT_LANGUAGE_SAMPLE_INTL.counterIdentifier,
    "Value",
    reservedWords,
    usedIdentifiers,
  );
  const countToThreeFunction = resolveSampleIdentifier(
    intl.countToThreeFunction,
    DEFAULT_LANGUAGE_SAMPLE_INTL.countToThreeFunction,
    "Function",
    reservedWords,
    usedIdentifiers,
  );

  const mainHeader = isUntyped
    ? `${getKeyword(customization, "function")} main()`
    : `${getKeyword(customization, "int")} main()`;
  const counterHeader = isUntyped
    ? `${getKeyword(customization, "function")} ${countToThreeFunction}()`
    : `${getKeyword(customization, "void")} ${countToThreeFunction}()`;
  const nameDeclaration = isUntyped
    ? endStatement(
        `${getKeyword(customization, "variable")} ${nameIdentifier} = ""`,
        terminator,
      )
    : endStatement(
        `${getKeyword(customization, "string")} ${nameIdentifier} = ""`,
        terminator,
      );
  const countDeclaration = isUntyped
    ? endStatement(
        `${getKeyword(customization, "variable")} ${counterIdentifier} = 1`,
        terminator,
      )
    : endStatement(
        `${getKeyword(customization, "int")} ${counterIdentifier} = 1`,
        terminator,
      );
  const scanLine = isUntyped
    ? endStatement(`${scan}(${nameIdentifier})`, terminator)
    : endStatement(
        `${scan}(${getKeyword(customization, "string")}, ${nameIdentifier})`,
        terminator,
      );

  const loopBody = [
    endStatement(`${print}(${counterIdentifier})`, terminator),
    endStatement(
      `${counterIdentifier} = ${counterIdentifier} + 1`,
      terminator,
    ),
  ];
  const counterBody = [
    countDeclaration,
    ...buildBlock(
      customization,
      `${whileKeyword} (${counterIdentifier} ${lessEqual} 3)`,
      loopBody,
    ),
  ];

  if (!isUntyped) {
    counterBody.push(endStatement(returnKeyword, terminator));
  }

  const mainBody = [
    nameDeclaration,
    endStatement(`${print}("${intl.namePrompt}")`, terminator),
    scanLine,
    endStatement(
      `${print}("${intl.helloWorldPrefix}", ${nameIdentifier}, "!")`,
      terminator,
    ),
    endStatement(`${countToThreeFunction}()`, terminator),
    endStatement(`${returnKeyword} 0`, terminator),
  ];

  return [
    ...buildBlock(customization, mainHeader, mainBody),
    "",
    ...buildBlock(customization, counterHeader, counterBody),
  ].join("\n");
}
