import type { StoredKeywordCustomization } from "@/contexts/keyword/types";
import { ORIGINAL_KEYWORDS } from "@/contexts/keyword";
import type { LanguageSampleIntl } from "@/i18n/types/language-sample";
import {
  DEFAULT_BOOLEAN_LITERAL_MAP,
  DEFAULT_OPERATOR_WORD_MAP,
} from "@/lib/keyword-map";
import { OPERATOR_WORD_FIELDS } from "@/lib/operator-word-map";

export const DEFAULT_LANGUAGE_SAMPLE_INTL: LanguageSampleIntl = {
  namePrompt: "What is your name?",
  helloWorldPrefix: "hello world, ",
  nameIdentifier: "name",
  counterIdentifier: "count",
  countToThreeFunction: "countToThree",
};

type KeywordName =
  | "bool"
  | "break"
  | "case"
  | "continue"
  | "default"
  | "else"
  | "float"
  | "for"
  | "if"
  | "int"
  | "string"
  | "switch"
  | "void"
  | "function"
  | "variable"
  | "while"
  | "return"
  | "print"
  | "scan";

type OperatorName = keyof typeof DEFAULT_OPERATOR_WORD_MAP;
const OPERATOR_SYMBOLS = Object.fromEntries(
  OPERATOR_WORD_FIELDS.map((field) => [field.key, field.symbol]),
) as Record<OperatorName, string>;
export type LexemeExampleCategory =
  | "tipos"
  | "entrada"
  | "lacos"
  | "fluxo"
  | "operadores"
  | "estrutura";

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
  if (!terminator) return statement;

  const separator = terminator === ";" ? "" : " ";
  return `${statement}${separator}${terminator}`;
}

function getLessEqualOperator(
  customization: StoredKeywordCustomization,
): string {
  return customization.operatorWordMap.less_equal?.trim() || "<=";
}

function getOperator(
  customization: StoredKeywordCustomization,
  key: OperatorName,
): string {
  return customization.operatorWordMap[key]?.trim() || OPERATOR_SYMBOLS[key];
}

function buildNotExpression(operator: string, expression: string): string {
  return operator === "!" ? `${operator}${expression}` : `${operator} ${expression}`;
}

function getBooleanLiteral(
  customization: StoredKeywordCustomization,
  key: "true" | "false",
): string {
  return (
    customization.booleanLiteralMap[key]?.trim() ||
    DEFAULT_BOOLEAN_LITERAL_MAP[key] ||
    key
  );
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

function buildIfElseBlock(
  customization: StoredKeywordCustomization,
  firstCondition: string,
  firstBody: string[],
  elseIfCondition: string,
  elseIfBody: string[],
  elseBody: string[],
): string[] {
  const ifKeyword = getKeyword(customization, "if");
  const elseKeyword = getKeyword(customization, "else");

  if (customization.modes.block === "indentation") {
    return [
      `${ifKeyword} (${firstCondition}):`,
      ...indent(firstBody),
      `${elseKeyword} ${ifKeyword} (${elseIfCondition}):`,
      ...indent(elseIfBody),
      `${elseKeyword}:`,
      ...indent(elseBody),
    ];
  }

  const open = customization.blockDelimiters.open.trim() || "{";
  const close = customization.blockDelimiters.close.trim() || "}";

  return [
    `${ifKeyword} (${firstCondition}) ${open}`,
    ...indent(firstBody),
    `${close} ${elseKeyword} ${ifKeyword} (${elseIfCondition}) ${open}`,
    ...indent(elseIfBody),
    `${close} ${elseKeyword} ${open}`,
    ...indent(elseBody),
    close,
  ];
}

function buildSwitchBlock(
  customization: StoredKeywordCustomization,
  expression: string,
  caseBody: string[],
  defaultBody: string[],
): string[] {
  const switchKeyword = getKeyword(customization, "switch");
  const caseKeyword = getKeyword(customization, "case");
  const defaultKeyword = getKeyword(customization, "default");

  if (customization.modes.block === "indentation") {
    return [
      `${switchKeyword} (${expression}):`,
      `  ${caseKeyword} 1:`,
      ...indent(indent(caseBody)),
      `  ${defaultKeyword}:`,
      ...indent(indent(defaultBody)),
    ];
  }

  const open = customization.blockDelimiters.open.trim() || "{";
  const close = customization.blockDelimiters.close.trim() || "}";

  return [
    `${switchKeyword} (${expression}) ${open}`,
    `  ${caseKeyword} 1:`,
    ...indent(indent(caseBody)),
    `  ${defaultKeyword}:`,
    ...indent(indent(defaultBody)),
    close,
  ];
}

type LanguageExampleModel = {
  completeCode: string;
  lexemeExamples: Map<string, string>;
  categoryExamples: Map<LexemeExampleCategory, string>;
};

function setExample(
  examples: Map<string, string>,
  category: LexemeExampleCategory,
  lexeme: string,
  example: string,
): void {
  examples.set(`${category}:${lexeme}`, example);
}

function buildLanguageExampleModel(
  customization: StoredKeywordCustomization,
  intl: LanguageSampleIntl = DEFAULT_LANGUAGE_SAMPLE_INTL,
): LanguageExampleModel {
  const terminator = getStatementTerminator(customization);
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
  const scoreIdentifier = resolveSampleIdentifier(
    "score",
    "score",
    "Value",
    reservedWords,
    usedIdentifiers,
  );
  const heightIdentifier = resolveSampleIdentifier(
    "height",
    "height",
    "Value",
    reservedWords,
    usedIdentifiers,
  );
  const readyIdentifier = resolveSampleIdentifier(
    "ready",
    "ready",
    "Value",
    reservedWords,
    usedIdentifiers,
  );
  const indexIdentifier = resolveSampleIdentifier(
    "i",
    "i",
    "Value",
    reservedWords,
    usedIdentifiers,
  );
  const missionFunction = resolveSampleIdentifier(
    "missionLog",
    "missionLog",
    "Function",
    reservedWords,
    usedIdentifiers,
  );
  const revengeFunction = resolveSampleIdentifier(
    "vingarEldianos",
    "vingarEldianos",
    "Function",
    reservedWords,
    usedIdentifiers,
  );
  const heroIdentifier = resolveSampleIdentifier(
    "heroi",
    "heroi",
    "Value",
    reservedWords,
    usedIdentifiers,
  );
  const attackDistanceIdentifier = resolveSampleIdentifier(
    "distanciaAtaque",
    "distanciaAtaque",
    "Value",
    reservedWords,
    usedIdentifiers,
  );
  const rumblingEnabledIdentifier = resolveSampleIdentifier(
    "estrondoAtivado",
    "estrondoAtivado",
    "Value",
    reservedWords,
    usedIdentifiers,
  );
  const titanCountIdentifier = resolveSampleIdentifier(
    "numeroTitans",
    "numeroTitans",
    "Value",
    reservedWords,
    usedIdentifiers,
  );
  const examples = new Map<string, string>();
  const categoryExamples = new Map<LexemeExampleCategory, string>();
  const keyword = (original: KeywordName) => getKeyword(customization, original);
  const operator = (key: OperatorName) => getOperator(customization, key);
  const not = (expression: string) =>
    buildNotExpression(operator("logical_not"), expression);
  const bool = (key: "true" | "false") => getBooleanLiteral(customization, key);
  const blockOpen = customization.blockDelimiters.open.trim() || "{";
  const blockClose = customization.blockDelimiters.close.trim() || "}";
  const visibleTerminator =
    customization.statementTerminatorLexeme.trim() || ";";
  const declare = (type: KeywordName, name: string, value: string) =>
    endStatement(`${keyword(type)} ${name} = ${value}`, terminator);
  const printLine = (message: string) =>
    endStatement(`${keyword("print")}("${message}")`, terminator);

  const nameDeclaration = isUntyped
    ? declare("variable", nameIdentifier, '""')
    : declare("string", nameIdentifier, '""');
  const scoreDeclaration = isUntyped
    ? declare("variable", scoreIdentifier, "1")
    : declare("int", scoreIdentifier, "1");
  const heightDeclaration = isUntyped
    ? declare("variable", heightIdentifier, "1.8")
    : declare("float", heightIdentifier, "1.8");
  const readyDeclaration = isUntyped
    ? declare("variable", readyIdentifier, bool("true"))
    : declare("bool", readyIdentifier, bool("true"));
  const scanLine = isUntyped
    ? endStatement(`${keyword("scan")}(${nameIdentifier})`, terminator)
    : endStatement(
        `${keyword("scan")}(${keyword("string")}, ${nameIdentifier})`,
        terminator,
      );
  const firstCondition = `${nameIdentifier} ${operator(
    "equal_equal",
  )} "Eren Yeager"`;
  const elseIfCondition = `${nameIdentifier} ${operator(
    "equal_equal",
  )} "Mikasa Ackerman"`;
  const ifElseLines = buildIfElseBlock(
    customization,
    firstCondition,
    [
      printLine("Eren is the anti-hero"),
      printLine("Press f to pay respect?"),
    ],
    elseIfCondition,
    [printLine("Mikasa is a hero")],
    [printLine("Lelouch vi Britannia has a plan")],
  );
  const forInitializer = isUntyped
    ? `${indexIdentifier} = 0`
    : `${keyword("int")} ${indexIdentifier} = 0`;
  const forLines = buildBlock(
    customization,
    `${keyword("for")} (${forInitializer}; ${indexIdentifier} ${operator(
      "less",
    )} 3; ${indexIdentifier}++)`,
    [
      ...buildBlock(
        customization,
        `${keyword("if")} (${indexIdentifier} ${operator("equal_equal")} 1)`,
        [endStatement(keyword("continue"), terminator)],
      ),
      endStatement(`${keyword("print")}(${indexIdentifier})`, terminator),
    ],
  );
  const whileLines = buildBlock(
    customization,
    `${keyword("while")} (${readyIdentifier} ${operator(
      "logical_and",
    )} ${scoreIdentifier} ${operator(
      "less_equal",
    )} 3 ${operator("logical_and")} ${heightIdentifier} ${operator(
      "greater_equal",
    )} 1.8)`,
    [
      endStatement(
        `${scoreIdentifier} = ${scoreIdentifier} + 1`,
        terminator,
      ),
      ...buildBlock(
        customization,
        `${keyword("if")} (${scoreIdentifier} ${operator(
          "greater",
        )} 2 ${operator("logical_or")} ${nameIdentifier} ${operator(
          "not_equal",
        )} "Zeke Yeager" ${operator("logical_or")} ${not(bool("false"))})`,
        [endStatement(keyword("break"), terminator)],
      ),
    ],
  );
  const switchLines = buildSwitchBlock(
    customization,
    scoreIdentifier,
    [
      printLine("Roy Mustang is a hero"),
      endStatement(keyword("break"), terminator),
    ],
    [
      printLine("Maes Hughes always dies"),
      printLine("Press f to pay respect?"),
    ],
  );
  const missionHeader = isUntyped
    ? `${keyword("function")} ${missionFunction}()`
    : `${keyword("void")} ${missionFunction}()`;
  const missionLines = buildBlock(customization, missionHeader, [
    printLine("mission complete"),
    ...(isUntyped ? [] : [endStatement(keyword("return"), terminator)]),
  ]);
  const revengeHeader = isUntyped
    ? `${keyword("function")} ${revengeFunction}()`
    : `${keyword("void")} ${revengeFunction}()`;
  const typeCategoryLines = buildBlock(customization, revengeHeader, [
    isUntyped
      ? declare("variable", heroIdentifier, '"Eren Yeager"')
      : declare("string", heroIdentifier, '"Eren Yeager"'),
    isUntyped
      ? declare("variable", attackDistanceIdentifier, "12756.28")
      : declare("float", attackDistanceIdentifier, "12756.28"),
    isUntyped
      ? declare("variable", rumblingEnabledIdentifier, bool("true"))
      : declare("bool", rumblingEnabledIdentifier, bool("true")),
    isUntyped
      ? declare("variable", titanCountIdentifier, "580000")
      : declare("int", titanCountIdentifier, "580000"),
  ]);
  const declareSameBoolValues = (
    names: string[],
    value: "true" | "false",
  ) => {
    const declarationKeyword = isUntyped ? keyword("variable") : keyword("bool");

    return endStatement(
      `${declarationKeyword} ${names.join(", ")} = ${bool(value)}`,
      terminator,
    );
  };
  const operatorExampleDeclarations = [
    declareSameBoolValues(
      ["narutoQuerConversar", "erenQuerDestruirTudo", "mikasaAmaEren"],
      "true",
    ),
    declareSameBoolValues(["erenQuerOuvir"], "false"),
  ];
  const operatorExampleBlocks = [
    ...buildBlock(
      customization,
      `${keyword("if")} (narutoQuerConversar ${operator(
        "logical_and",
      )} erenQuerOuvir)`,
      [printLine("Naruto venceu com o poder da amizade!")],
    ),
    ...buildBlock(
      customization,
      `${keyword("if")} (narutoQuerConversar ${operator(
        "logical_and",
      )} ${not("erenQuerOuvir")})`,
      [printLine("Naruto: Você já ouviu falar da minha infância?")],
    ),
    ...buildBlock(
      customization,
      `${keyword("if")} (pacienciaDoEren ${operator(
        "greater",
      )} 5 ${operator("logical_and")} narutoQuerConversar)`,
      [printLine("Eren começou a reconsiderar suas escolhas.")],
    ),
    ...buildBlock(
      customization,
      `${keyword("if")} (pacienciaDoEren ${operator(
        "less_equal",
      )} 5 ${operator("logical_and")} erenQuerDestruirTudo)`,
      [printLine("Eren: TATAKAE! TATAKAE!")],
    ),
    ...buildBlock(
      customization,
      `${keyword("if")} (mikasaAmaEren ${operator(
        "logical_and",
      )} pacienciaDaMikasa ${operator("greater")} 5)`,
      [printLine("Mikasa: Eren, por favor, pare!")],
    ),
    ...buildBlock(
      customization,
      `${keyword("if")} (pacienciaDaMikasa ${operator(
        "less",
      )} 5 ${operator("logical_or")} ${not("mikasaAmaEren")})`,
      [printLine("Mikasa pegou a espada. Acabou o diálogo!")],
    ),
  ];
  const mainHeader = isUntyped
    ? `${keyword("function")} main()`
    : `${keyword("int")} main()`;
  const mainLines = buildBlock(customization, mainHeader, [
    nameDeclaration,
    scoreDeclaration,
    heightDeclaration,
    readyDeclaration,
    ...(isUntyped ? [endStatement(`${keyword("variable")} ${indexIdentifier} = 0`, terminator)] : []),
    printLine("What is your name?"),
    scanLine,
    ...ifElseLines,
    ...forLines,
    ...whileLines,
    ...switchLines,
    endStatement(`${missionFunction}()`, terminator),
    endStatement(`${keyword("return")} 0`, terminator),
  ]);

  categoryExamples.set(
    "entrada",
    [
      printLine("Eren e Mikasa"),
      scanLine,
      printLine("Lelouch vi Britannia"),
    ].join("\n"),
  );
  categoryExamples.set("tipos", typeCategoryLines.join("\n"));
  categoryExamples.set(
    "estrutura",
    buildBlock(
      customization,
      isUntyped ? `${keyword("function")} main()` : `${keyword("void")} main()`,
      [
        printLine(
          "Tu te tornas eternamente responsável por aquilo que cativas.",
        ),
        printLine(
          "Nada do que acontece é esquecido, mesmo que você não se lembre.",
        ),
        printLine(
          "As pessoas só vão entender umas as outras quando sentirem a mesma dor",
        ),
      ],
    ).join("\n"),
  );
  categoryExamples.set(
    "operadores",
    [...operatorExampleDeclarations, ...operatorExampleBlocks].join("\n"),
  );
  categoryExamples.set(
    "fluxo",
    [...ifElseLines, ...switchLines, endStatement(`${keyword("return")} 0`, terminator)].join(
      "\n",
    ),
  );
  categoryExamples.set("lacos", [...forLines, ...whileLines].join("\n"));

  setExample(examples, "entrada", keyword("print"), printLine("hello world"));
  setExample(examples, "entrada", keyword("scan"), scanLine);
  setExample(examples, "tipos", keyword("int"), scoreDeclaration);
  setExample(examples, "tipos", keyword("float"), heightDeclaration);
  setExample(examples, "tipos", keyword("bool"), readyDeclaration);
  setExample(examples, "tipos", keyword("string"), nameDeclaration);
  setExample(examples, "tipos", keyword("void"), missionHeader);
  setExample(
    examples,
    "tipos",
    keyword("variable"),
    declare("variable", "value", '"hello"'),
  );
  setExample(examples, "tipos", keyword("function"), `${keyword("function")} main()`);
  setExample(examples, "lacos", keyword("for"), forLines.join("\n"));
  setExample(examples, "lacos", keyword("while"), whileLines.join("\n"));
  setExample(examples, "fluxo", keyword("if"), ifElseLines.join("\n"));
  setExample(examples, "fluxo", keyword("else"), ifElseLines.join("\n"));
  setExample(examples, "fluxo", keyword("switch"), switchLines.join("\n"));
  setExample(examples, "fluxo", keyword("case"), `${keyword("case")} 1:`);
  setExample(examples, "fluxo", keyword("default"), `${keyword("default")}:`);
  setExample(examples, "fluxo", keyword("break"), endStatement(keyword("break"), terminator));
  setExample(
    examples,
    "fluxo",
    keyword("continue"),
    endStatement(keyword("continue"), terminator),
  );
  setExample(
    examples,
    "fluxo",
    keyword("return"),
    endStatement(`${keyword("return")} 0`, terminator),
  );
  setExample(examples, "estrutura", blockOpen, `${keyword("if")} (${bool("true")}) ${blockOpen}`);
  setExample(examples, "estrutura", blockClose, blockClose);
  setExample(
    examples,
    "estrutura",
    visibleTerminator,
    endStatement(`${keyword("print")}("ok")`, visibleTerminator),
  );

  const operatorExamples: Record<OperatorName, string> = {
    logical_or: `${bool("true")} ${operator("logical_or")} ${bool("false")}`,
    logical_and: `${bool("true")} ${operator("logical_and")} ${bool("false")}`,
    logical_not: not(bool("true")),
    less: `${scoreIdentifier} ${operator("less")} 3`,
    less_equal: `${scoreIdentifier} ${operator("less_equal")} 3`,
    greater: `${scoreIdentifier} ${operator("greater")} 0`,
    greater_equal: `${scoreIdentifier} ${operator("greater_equal")} 1`,
    equal_equal: `${nameIdentifier} ${operator("equal_equal")} "Eren Yeager"`,
    not_equal: `${nameIdentifier} ${operator("not_equal")} "Zeke Yeager"`,
  };
  for (const key of Object.keys(operatorExamples) as OperatorName[]) {
    setExample(examples, "operadores", operator(key), operatorExamples[key]);
  }
  setExample(examples, "operadores", bool("true"), bool("true"));
  setExample(examples, "operadores", bool("false"), bool("false"));

  return {
    completeCode: [...mainLines, "", ...missionLines].join("\n"),
    lexemeExamples: examples,
    categoryExamples,
  };
}

export function buildCompleteLanguageSample(
  customization: StoredKeywordCustomization,
  intl: LanguageSampleIntl = DEFAULT_LANGUAGE_SAMPLE_INTL,
): string {
  return buildLanguageExampleModel(customization, intl).completeCode;
}

export function getLanguageLexemeExample(
  categoryKey: LexemeExampleCategory,
  lexeme: string,
  customization: StoredKeywordCustomization,
): string | null {
  return (
    buildLanguageExampleModel(customization).lexemeExamples.get(
      `${categoryKey}:${lexeme}`,
    ) ?? null
  );
}

export function buildLanguageCategorySample(
  categoryKey: LexemeExampleCategory,
  customization: StoredKeywordCustomization,
  intl: LanguageSampleIntl = DEFAULT_LANGUAGE_SAMPLE_INTL,
): string {
  return (
    buildLanguageExampleModel(customization, intl).categoryExamples.get(
      categoryKey,
    ) ?? buildCompleteLanguageSample(customization, intl)
  );
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
