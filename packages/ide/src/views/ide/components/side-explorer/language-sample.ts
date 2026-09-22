import type { StoredKeywordCustomization } from "@/contexts/keyword/types";
import type { LanguageSampleIntl } from "@/i18n/types/language-sample";

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

function endStatement(statement: string, terminator: string): string {
  return `${statement}${terminator}`;
}

function getLessEqualOperator(
  customization: StoredKeywordCustomization,
): string {
  return customization.operatorWordMap.less_equal?.trim() || "<=";
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
  const nameIdentifier = intl.nameIdentifier;
  const counterIdentifier = intl.counterIdentifier;
  const countToThreeFunction = intl.countToThreeFunction;

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
