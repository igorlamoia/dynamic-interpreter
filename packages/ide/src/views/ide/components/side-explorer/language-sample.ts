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
  identifiers: {
    score: "score",
    height: "height",
    ready: "ready",
    index: "i",
    missionFunction: "missionLog",
    revengeFunction: "claimFreedom",
    hero: "hero",
    attackDistance: "attackDistance",
    rumblingEnabled: "rumblingEnabled",
    titanCount: "titanCount",
    status: "status",
    discount: "discount",
    day: "day",
    total: "total",
    sales: "sales",
    queue: "queue",
    served: "served",
    orderIndex: "index",
    totalOrders: "totalOrders",
    canceledOrder: "canceledOrder",
    stock: "stock",
    shipped: "shipped",
    balance: "balance",
    points: "points",
    purchases: "purchases",
    activeRegistration: "activeRegistration",
    blockedCustomer: "blockedCustomer",
    enoughBalance: "enoughBalance",
    hasPoints: "hasPoints",
    firstPurchase: "firstPurchase",
    vipCustomer: "vipCustomer",
    hasBenefit: "hasBenefit",
    canBuy: "canBuy",
    remainingBalance: "remainingBalance",
    extraPoints: "extraPoints",
    halfBalance: "halfBalance",
    discountReleased: "discountReleased",
    value: "value",
  },
  stringLiterals: {
    heroName: "Eren Yeager",
    antiHeroName: "Eren Yeager",
    secondaryHeroName: "Mikasa Ackerman",
    rivalName: "Zeke Yeager",
    vipStatus: "vip",
    standardStatus: "standard",
    hello: "hello",
    sampleInputName: "Naruto",
    sampleOutputName: "Naturo",
  },
  printMessages: {
    welcomePrefix: "Welcome, ",
    antiHero: "Eren is the anti-hero",
    respect: "Press f to pay respect?",
    secondaryHero: "Mikasa is a hero",
    planned: "Lelouch vi Britannia has a plan",
    switchHero: "Roy Mustang is a hero",
    switchDefault: "Maes Hughes always dies",
    missionComplete: "mission complete",
    entryFirst: "Eren and Mikasa",
    entrySecond: "Lelouch vi Britannia",
    structureFirst: "You become responsible forever for what you have tamed.",
    structureSecond: "Nothing that happens is forgotten, even if you do not remember.",
    structureThird: "People understand each other when they feel the same pain",
    helloWorld: "hello world",
    ok: "ok",
  },
  comments: {
    relationalOperators: "Relational operators",
    logicalOperators: "Logical operators",
    arithmeticOperators: "Arithmetic operators",
    finalCheck: "Final check",
  },
  reviewSections: {
    io: "Input and output",
    types: "Types",
    structure: "Structure",
    operators: "Operators",
    flow: "Flow",
  },
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
  const sampleIds = intl.identifiers;
  const sampleStrings = intl.stringLiterals;
  const samplePrints = intl.printMessages;
  const nameIdentifier = resolveSampleIdentifier(
    intl.nameIdentifier,
    DEFAULT_LANGUAGE_SAMPLE_INTL.nameIdentifier,
    "Value",
    reservedWords,
    usedIdentifiers,
  );
  const scoreIdentifier = resolveSampleIdentifier(
    sampleIds.score,
    DEFAULT_LANGUAGE_SAMPLE_INTL.identifiers.score,
    "Value",
    reservedWords,
    usedIdentifiers,
  );
  const heightIdentifier = resolveSampleIdentifier(
    sampleIds.height,
    DEFAULT_LANGUAGE_SAMPLE_INTL.identifiers.height,
    "Value",
    reservedWords,
    usedIdentifiers,
  );
  const readyIdentifier = resolveSampleIdentifier(
    sampleIds.ready,
    DEFAULT_LANGUAGE_SAMPLE_INTL.identifiers.ready,
    "Value",
    reservedWords,
    usedIdentifiers,
  );
  const indexIdentifier = resolveSampleIdentifier(
    sampleIds.index,
    DEFAULT_LANGUAGE_SAMPLE_INTL.identifiers.index,
    "Value",
    reservedWords,
    usedIdentifiers,
  );
  const missionFunction = resolveSampleIdentifier(
    sampleIds.missionFunction,
    DEFAULT_LANGUAGE_SAMPLE_INTL.identifiers.missionFunction,
    "Function",
    reservedWords,
    usedIdentifiers,
  );
  const revengeFunction = resolveSampleIdentifier(
    sampleIds.revengeFunction,
    DEFAULT_LANGUAGE_SAMPLE_INTL.identifiers.revengeFunction,
    "Function",
    reservedWords,
    usedIdentifiers,
  );
  const heroIdentifier = resolveSampleIdentifier(
    sampleIds.hero,
    DEFAULT_LANGUAGE_SAMPLE_INTL.identifiers.hero,
    "Value",
    reservedWords,
    usedIdentifiers,
  );
  const attackDistanceIdentifier = resolveSampleIdentifier(
    sampleIds.attackDistance,
    DEFAULT_LANGUAGE_SAMPLE_INTL.identifiers.attackDistance,
    "Value",
    reservedWords,
    usedIdentifiers,
  );
  const rumblingEnabledIdentifier = resolveSampleIdentifier(
    sampleIds.rumblingEnabled,
    DEFAULT_LANGUAGE_SAMPLE_INTL.identifiers.rumblingEnabled,
    "Value",
    reservedWords,
    usedIdentifiers,
  );
  const titanCountIdentifier = resolveSampleIdentifier(
    sampleIds.titanCount,
    DEFAULT_LANGUAGE_SAMPLE_INTL.identifiers.titanCount,
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
  const sampleIdentifier = (key: keyof LanguageSampleIntl["identifiers"]) =>
    resolveSampleIdentifier(
      sampleIds[key],
      DEFAULT_LANGUAGE_SAMPLE_INTL.identifiers[key],
      "Value",
      reservedWords,
      usedIdentifiers,
    );
  const statusIdentifier = sampleIdentifier("status");
  const discountIdentifier = sampleIdentifier("discount");
  const dayIdentifier = sampleIdentifier("day");
  const totalIdentifier = sampleIdentifier("total");
  const salesIdentifier = sampleIdentifier("sales");
  const queueIdentifier = sampleIdentifier("queue");
  const servedIdentifier = sampleIdentifier("served");
  const orderIndexIdentifier = sampleIdentifier("orderIndex");
  const totalOrdersIdentifier = sampleIdentifier("totalOrders");
  const canceledOrderIdentifier = sampleIdentifier("canceledOrder");
  const stockIdentifier = sampleIdentifier("stock");
  const shippedIdentifier = sampleIdentifier("shipped");
  const balanceIdentifier = sampleIdentifier("balance");
  const pointsIdentifier = sampleIdentifier("points");
  const purchasesIdentifier = sampleIdentifier("purchases");
  const activeRegistrationIdentifier = sampleIdentifier("activeRegistration");
  const blockedCustomerIdentifier = sampleIdentifier("blockedCustomer");
  const enoughBalanceIdentifier = sampleIdentifier("enoughBalance");
  const hasPointsIdentifier = sampleIdentifier("hasPoints");
  const firstPurchaseIdentifier = sampleIdentifier("firstPurchase");
  const vipCustomerIdentifier = sampleIdentifier("vipCustomer");
  const hasBenefitIdentifier = sampleIdentifier("hasBenefit");
  const canBuyIdentifier = sampleIdentifier("canBuy");
  const remainingBalanceIdentifier = sampleIdentifier("remainingBalance");
  const extraPointsIdentifier = sampleIdentifier("extraPoints");
  const halfBalanceIdentifier = sampleIdentifier("halfBalance");
  const discountReleasedIdentifier = sampleIdentifier("discountReleased");
  const valueIdentifier = sampleIdentifier("value");

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
  )} "${sampleStrings.antiHeroName}"`;
  const elseIfCondition = `${nameIdentifier} ${operator(
    "equal_equal",
  )} "${sampleStrings.secondaryHeroName}"`;
  const ifElseLines = buildIfElseBlock(
    customization,
    firstCondition,
    [
      printLine(samplePrints.antiHero),
      printLine(samplePrints.respect),
    ],
    elseIfCondition,
    [printLine(samplePrints.secondaryHero)],
    [printLine(samplePrints.planned)],
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
        )} "${sampleStrings.rivalName}" ${operator("logical_or")} ${not(bool("false"))})`,
        [endStatement(keyword("break"), terminator)],
      ),
    ],
  );
  const switchLines = buildSwitchBlock(
    customization,
    scoreIdentifier,
    [
      printLine(samplePrints.switchHero),
      endStatement(keyword("break"), terminator),
    ],
    [
      printLine(samplePrints.switchDefault),
      printLine(samplePrints.respect),
    ],
  );
  const flowExampleStatement = (statement: string) =>
    endStatement(statement, terminator);
  const flowSwitchLines =
    customization.modes.block === "indentation"
      ? [
          `${keyword("switch")} (${statusIdentifier}):`,
          `  ${keyword("case")} "${sampleStrings.vipStatus}":`,
          `    ${flowExampleStatement(`${discountIdentifier} = 15`)}`,
          `  ${keyword("case")} "${sampleStrings.standardStatus}":`,
          `    ${flowExampleStatement(`${discountIdentifier} = 5`)}`,
          `  ${keyword("default")}:`,
          `    ${flowExampleStatement(`${discountIdentifier} = 0`)}`,
        ]
      : [
          `${keyword("switch")} (${statusIdentifier}) ${blockOpen}`,
          `  ${keyword("case")} "${sampleStrings.vipStatus}":`,
          `    ${flowExampleStatement(`${discountIdentifier} = 15`)}`,
          `  ${keyword("case")} "${sampleStrings.standardStatus}":`,
          `    ${flowExampleStatement(`${discountIdentifier} = 5`)}`,
          `  ${keyword("default")}:`,
          `    ${flowExampleStatement(`${discountIdentifier} = 0`)}`,
          blockClose,
        ];
  const flowConditionalLines = [
    ...buildBlock(
      customization,
      `${keyword("if")} (${balanceIdentifier} ${operator("greater_equal")} 100)`,
      [
        flowExampleStatement(
          `${statusIdentifier} = "${sampleStrings.vipStatus}"`,
        ),
      ],
    ),
    ...buildBlock(customization, `${keyword("else")}`, [
      flowExampleStatement(
        `${statusIdentifier} = "${sampleStrings.standardStatus}"`,
      ),
    ]),
    "",
    ...flowSwitchLines,
  ];
  const flowLoopLines = [
    ...buildBlock(
      customization,
      `${keyword("for")} (${dayIdentifier} = 1; ${dayIdentifier} ${operator(
        "less_equal",
      )} 7; ${dayIdentifier} = ${dayIdentifier} + 1)`,
      [
        flowExampleStatement(
          `${totalIdentifier} = ${totalIdentifier} + ${salesIdentifier}[${dayIdentifier}]`,
        ),
      ],
    ),
    "",
    ...buildBlock(
      customization,
      `${keyword("while")} (${queueIdentifier} ${operator("greater")} 0)`,
      [
        flowExampleStatement(`${servedIdentifier} = ${servedIdentifier} + 1`),
        flowExampleStatement(`${queueIdentifier} = ${queueIdentifier} - 1`),
      ],
    ),
  ];
  const flowControlLines = [
    ...buildBlock(
      customization,
      `${keyword("while")} (${orderIndexIdentifier} ${operator("less")} ${totalOrdersIdentifier})`,
      [
        flowExampleStatement(
          `${orderIndexIdentifier} = ${orderIndexIdentifier} + 1`,
        ),
        ...buildBlock(
          customization,
          `${keyword("if")} (${canceledOrderIdentifier})`,
          [flowExampleStatement(keyword("continue"))],
        ),
        ...buildBlock(
          customization,
          `${keyword("if")} (${stockIdentifier} ${operator("equal_equal")} 0)`,
          [flowExampleStatement(keyword("break"))],
        ),
        flowExampleStatement(`${shippedIdentifier} = ${shippedIdentifier} + 1`),
      ],
    ),
    "",
    flowExampleStatement(`${keyword("return")} ${shippedIdentifier}`),
  ];
  const missionHeader = isUntyped
    ? `${keyword("function")} ${missionFunction}()`
    : `${keyword("void")} ${missionFunction}()`;
  const missionLines = buildBlock(customization, missionHeader, [
    printLine(samplePrints.missionComplete),
    ...(isUntyped ? [] : [endStatement(keyword("return"), terminator)]),
  ]);
  const revengeHeader = isUntyped
    ? `${keyword("function")} ${revengeFunction}()`
    : `${keyword("void")} ${revengeFunction}()`;
  const typeCategoryLines = buildBlock(customization, revengeHeader, [
    isUntyped
      ? declare("variable", heroIdentifier, `"${sampleStrings.heroName}"`)
      : declare("string", heroIdentifier, `"${sampleStrings.heroName}"`),
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
  const operatorDeclaration = (
    type: "int" | "bool",
    name: string,
    value: string,
  ) =>
    endStatement(
      `${isUntyped ? keyword("variable") : keyword(type)} ${name} = ${value}`,
      terminator,
    );
  const currentRulesOperatorExampleLines = [
    operatorDeclaration("bool", activeRegistrationIdentifier, bool("true")),
    operatorDeclaration("bool", blockedCustomerIdentifier, bool("false")),
    "",
    `// ${intl.comments.relationalOperators}`,
    operatorDeclaration(
      "bool",
      enoughBalanceIdentifier,
      `${balanceIdentifier} ${operator("greater_equal")} 100`,
    ),
    operatorDeclaration(
      "bool",
      hasPointsIdentifier,
      `${pointsIdentifier} ${operator("greater")} 50`,
    ),
    operatorDeclaration(
      "bool",
      firstPurchaseIdentifier,
      `${purchasesIdentifier} ${operator("equal_equal")} 0`,
    ),
    "",
    `// ${intl.comments.logicalOperators}`,
    operatorDeclaration(
      "bool",
      vipCustomerIdentifier,
      `${enoughBalanceIdentifier} ${operator("logical_and")} ${activeRegistrationIdentifier}`,
    ),
    operatorDeclaration(
      "bool",
      hasBenefitIdentifier,
      `${vipCustomerIdentifier} ${operator("logical_or")} ${hasPointsIdentifier}`,
    ),
    operatorDeclaration("bool", canBuyIdentifier, not(blockedCustomerIdentifier)),
    "",
    `// ${intl.comments.arithmeticOperators}`,
    operatorDeclaration("int", discountIdentifier, "5 + 10"),
    operatorDeclaration(
      "int",
      remainingBalanceIdentifier,
      `${balanceIdentifier} - ${discountIdentifier}`,
    ),
    operatorDeclaration(
      "int",
      extraPointsIdentifier,
      `${purchasesIdentifier} * 2`,
    ),
    operatorDeclaration(
      "int",
      halfBalanceIdentifier,
      `${balanceIdentifier} / 2`,
    ),
    "",
    `// ${intl.comments.finalCheck}`,
    operatorDeclaration(
      "bool",
      discountReleasedIdentifier,
      `${hasBenefitIdentifier} ${operator("logical_and")} ${canBuyIdentifier}`,
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
    ...(isUntyped
      ? [
          endStatement(
            `${keyword("variable")} ${indexIdentifier} = 0`,
            terminator,
          ),
        ]
      : []),
    printLine(intl.namePrompt),
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
      printLine(samplePrints.entryFirst),
      scanLine,
      printLine(samplePrints.entrySecond),
    ].join("\n"),
  );
  categoryExamples.set("tipos", typeCategoryLines.join("\n"));
  categoryExamples.set(
    "estrutura",
    buildBlock(
      customization,
      isUntyped ? `${keyword("function")} main()` : `${keyword("void")} main()`,
      [
        printLine(samplePrints.structureFirst),
        printLine(samplePrints.structureSecond),
        printLine(samplePrints.structureThird),
      ],
    ).join("\n"),
  );
  categoryExamples.set(
    "operadores",
    currentRulesOperatorExampleLines.join("\n"),
  );
  categoryExamples.set(
    "fluxo",
    [...flowConditionalLines, "", ...flowLoopLines, "", ...flowControlLines].join(
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
    declare("variable", valueIdentifier, `"${sampleStrings.hello}"`),
  );
  setExample(
    examples,
    "tipos",
    keyword("function"),
    `${keyword("function")} main()`,
  );
  setExample(examples, "lacos", keyword("for"), forLines.join("\n"));
  setExample(examples, "lacos", keyword("while"), whileLines.join("\n"));
  setExample(examples, "fluxo", keyword("if"), ifElseLines.join("\n"));
  setExample(examples, "fluxo", keyword("else"), ifElseLines.join("\n"));
  setExample(examples, "fluxo", keyword("switch"), switchLines.join("\n"));
  setExample(examples, "fluxo", keyword("case"), `${keyword("case")} 1:`);
  setExample(examples, "fluxo", keyword("default"), `${keyword("default")}:`);
  setExample(
    examples,
    "fluxo",
    keyword("break"),
    endStatement(keyword("break"), terminator),
  );
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
  setExample(
    examples,
    "estrutura",
    blockOpen,
    `${keyword("if")} (${bool("true")}) ${blockOpen}`,
  );
  setExample(examples, "estrutura", blockClose, blockClose);
  setExample(
    examples,
    "estrutura",
    visibleTerminator,
    endStatement(`${keyword("print")}("${samplePrints.ok}")`, visibleTerminator),
  );

  const operatorExamples: Record<OperatorName, string> = {
    logical_or: `${bool("true")} ${operator("logical_or")} ${bool("false")}`,
    logical_and: `${bool("true")} ${operator("logical_and")} ${bool("false")}`,
    logical_not: not(bool("true")),
    less: `${scoreIdentifier} ${operator("less")} 3`,
    less_equal: `${scoreIdentifier} ${operator("less_equal")} 3`,
    greater: `${scoreIdentifier} ${operator("greater")} 0`,
    greater_equal: `${scoreIdentifier} ${operator("greater_equal")} 1`,
    equal_equal: `${nameIdentifier} ${operator("equal_equal")} "${sampleStrings.antiHeroName}"`,
    not_equal: `${nameIdentifier} ${operator("not_equal")} "${sampleStrings.rivalName}"`,
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

export function buildReviewLanguageSample(
  customization: StoredKeywordCustomization,
  intl: LanguageSampleIntl = DEFAULT_LANGUAGE_SAMPLE_INTL,
): string {
  const terminator = getStatementTerminator(customization);
  const isUntyped = customization.modes.typing === "untyped";
  const reservedWords = getReservedSampleWords(customization);
  const usedIdentifiers = new Set<string>();
  const keyword = (original: KeywordName) => getKeyword(customization, original);
  const operator = (key: OperatorName) => getOperator(customization, key);
  const bool = (key: "true" | "false") => getBooleanLiteral(customization, key);
  const not = (expression: string) =>
    buildNotExpression(operator("logical_not"), expression);
  const declare = (type: KeywordName, name: string, value: string) =>
    endStatement(
      `${isUntyped ? keyword("variable") : keyword(type)} ${name} = ${value}`,
      terminator,
    );
  const statement = (value: string) => endStatement(value, terminator);
  const printLine = (message: string) =>
    statement(`${keyword("print")}("${message}")`);
  const sampleIdentifier = (
    preferred: string,
    fallback: string,
    suffix = "Value",
  ) =>
    resolveSampleIdentifier(
      preferred,
      fallback,
      suffix,
      reservedWords,
      usedIdentifiers,
    );

  const nameIdentifier = sampleIdentifier(
    intl.nameIdentifier,
    DEFAULT_LANGUAGE_SAMPLE_INTL.nameIdentifier,
  );
  const scoreIdentifier = sampleIdentifier(
    intl.identifiers.score,
    DEFAULT_LANGUAGE_SAMPLE_INTL.identifiers.score,
  );
  const heightIdentifier = sampleIdentifier(
    intl.identifiers.height,
    DEFAULT_LANGUAGE_SAMPLE_INTL.identifiers.height,
  );
  const readyIdentifier = sampleIdentifier(
    intl.identifiers.ready,
    DEFAULT_LANGUAGE_SAMPLE_INTL.identifiers.ready,
  );
  const indexIdentifier = sampleIdentifier(
    intl.identifiers.index,
    DEFAULT_LANGUAGE_SAMPLE_INTL.identifiers.index,
  );
  const totalIdentifier = sampleIdentifier(
    intl.identifiers.total,
    DEFAULT_LANGUAGE_SAMPLE_INTL.identifiers.total,
  );
  const stockIdentifier = sampleIdentifier(
    intl.identifiers.stock,
    DEFAULT_LANGUAGE_SAMPLE_INTL.identifiers.stock,
  );
  const shippedIdentifier = sampleIdentifier(
    intl.identifiers.shipped,
    DEFAULT_LANGUAGE_SAMPLE_INTL.identifiers.shipped,
  );
  const orderIndexIdentifier = sampleIdentifier(
    intl.identifiers.orderIndex,
    DEFAULT_LANGUAGE_SAMPLE_INTL.identifiers.orderIndex,
  );
  const totalOrdersIdentifier = sampleIdentifier(
    intl.identifiers.totalOrders,
    DEFAULT_LANGUAGE_SAMPLE_INTL.identifiers.totalOrders,
  );
  const canceledOrderIdentifier = sampleIdentifier(
    intl.identifiers.canceledOrder,
    DEFAULT_LANGUAGE_SAMPLE_INTL.identifiers.canceledOrder,
  );
  const reviewFunction = sampleIdentifier(
    intl.identifiers.missionFunction,
    DEFAULT_LANGUAGE_SAMPLE_INTL.identifiers.missionFunction,
    "Function",
  );

  const scanLine = isUntyped
    ? statement(`${keyword("scan")}(${nameIdentifier})`)
    : statement(`${keyword("scan")}(${keyword("string")}, ${nameIdentifier})`);
  const mainHeader = isUntyped
    ? `${keyword("function")} main()`
    : `${keyword("int")} main()`;
  const reviewHeader = isUntyped
    ? `${keyword("function")} ${reviewFunction}()`
    : `${keyword("void")} ${reviewFunction}()`;
  const flowSwitchLines =
    customization.modes.block === "indentation"
      ? [
          `${keyword("switch")} (${shippedIdentifier}):`,
          `  ${keyword("case")} 1:`,
          `    ${statement(`${totalIdentifier} = ${totalIdentifier} / 1`)}`,
          `    ${statement(keyword("break"))}`,
          `  ${keyword("default")}:`,
          `    ${statement(`${totalIdentifier} = ${totalIdentifier} + 0`)}`,
        ]
      : [
          `${keyword("switch")} (${shippedIdentifier}) ${
            customization.blockDelimiters.open.trim() || "{"
          }`,
          `  ${keyword("case")} 1:`,
          `    ${statement(`${totalIdentifier} = ${totalIdentifier} / 1`)}`,
          `    ${statement(keyword("break"))}`,
          `  ${keyword("default")}:`,
          `    ${statement(`${totalIdentifier} = ${totalIdentifier} + 0`)}`,
          customization.blockDelimiters.close.trim() || "}",
        ];

  const mainLines = buildBlock(customization, mainHeader, [
    declare("string", nameIdentifier, '""'),
    declare("int", scoreIdentifier, "0"),
    declare("float", heightIdentifier, "1.8"),
    declare("bool", readyIdentifier, bool("true")),
    declare("int", indexIdentifier, "0"),
    declare("int", totalIdentifier, "0"),
    declare("int", stockIdentifier, "2"),
    declare("int", shippedIdentifier, "0"),
    declare("int", orderIndexIdentifier, "0"),
    declare("int", totalOrdersIdentifier, "3"),
    declare("bool", canceledOrderIdentifier, bool("false")),
    printLine(intl.namePrompt),
    scanLine,
    ...buildBlock(
      customization,
      `${keyword("if")} (${nameIdentifier} ${operator("not_equal")} "${
        intl.stringLiterals.hello
      }" ${operator("logical_and")} ${readyIdentifier} ${operator(
        "logical_and",
      )} ${scoreIdentifier} ${operator(
        "greater_equal",
      )} 0 ${operator("logical_and")} ${heightIdentifier} ${operator(
        "greater",
      )} 1.0)`,
      [statement(`${scoreIdentifier} = ${scoreIdentifier} + 1`)],
    ),
    ...buildBlock(customization, `${keyword("else")}`, [
      statement(`${scoreIdentifier} = ${scoreIdentifier} - 1`),
    ]),
    ...buildBlock(
      customization,
      `${keyword("for")} (${indexIdentifier} = 0; ${indexIdentifier} ${operator(
        "less",
      )} 3; ${indexIdentifier} = ${indexIdentifier} + 1)`,
      [
        ...buildBlock(
          customization,
          `${keyword("if")} (${indexIdentifier} ${operator("equal_equal")} 1)`,
          [statement(keyword("continue"))],
        ),
        statement(`${totalIdentifier} = ${totalIdentifier} + ${indexIdentifier}`),
        statement(`${totalIdentifier} = ${totalIdentifier} * 1`),
      ],
    ),
    ...buildBlock(
      customization,
      `${keyword("while")} (${orderIndexIdentifier} ${operator(
        "less_equal",
      )} ${totalOrdersIdentifier})`,
      [
        statement(`${orderIndexIdentifier} = ${orderIndexIdentifier} + 1`),
        ...buildBlock(
          customization,
          `${keyword("if")} (${canceledOrderIdentifier} ${operator(
            "logical_or",
          )} ${not(readyIdentifier)})`,
          [statement(keyword("continue"))],
        ),
        ...buildBlock(
          customization,
          `${keyword("if")} (${stockIdentifier} ${operator("less_equal")} 0)`,
          [statement(keyword("break"))],
        ),
        statement(`${shippedIdentifier} = ${shippedIdentifier} + 1`),
        statement(`${stockIdentifier} = ${stockIdentifier} - 1`),
      ],
    ),
    ...flowSwitchLines,
    statement(`${reviewFunction}()`),
    statement(`${keyword("return")} 0`),
  ]);

  const reviewLines = buildBlock(customization, reviewHeader, [
    printLine(intl.printMessages.ok),
    ...(isUntyped ? [] : [statement(keyword("return"))]),
  ]);

  return [...mainLines, "", ...reviewLines].join("\n");
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
