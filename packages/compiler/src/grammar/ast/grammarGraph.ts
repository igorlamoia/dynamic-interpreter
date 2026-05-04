export type GrammarModeName =
  | "semicolonMode"
  | "blockMode"
  | "typingMode"
  | "arrayMode";

export type GrammarGraphNodeKind =
  | "nonterminal"
  | "terminal"
  | "option"
  | "mode";

export type GrammarGraphEdgeLabel = "expands" | "contains" | "uses" | "mode";

export type GrammarGraphRepeat = "*" | "+";

export type GrammarGraphModeGuard = Partial<Record<GrammarModeName, string>>;

export type GrammarGraphProductionSymbol = {
  id: string;
  optional?: boolean;
  repeat?: GrammarGraphRepeat;
  modes?: GrammarGraphModeGuard;
};

export type GrammarGraphProduction = {
  id: string;
  label?: string;
  symbols: readonly GrammarGraphProductionSymbol[];
  modes?: GrammarGraphModeGuard;
};

export type GrammarGraphNode = {
  id: string;
  label: string;
  kind: GrammarGraphNodeKind;
  group: string;
  description?: string;
  source?: string;
  productions?: readonly GrammarGraphProduction[];
};

export type GrammarGraphEdge = {
  id: string;
  from: string;
  to: string;
  label: GrammarGraphEdgeLabel;
  production?: string;
  optional?: boolean;
  repeat?: GrammarGraphRepeat;
  modes?: GrammarGraphModeGuard;
};

export type GrammarGraphSection = {
  id: string;
  label: string;
  nodes: readonly string[];
};

export type GrammarGraphOption = {
  id: string;
  label: string;
  values?: readonly string[];
  default?: string;
  description: string;
};

export type GrammarGraph = {
  version: number;
  start: string;
  options: {
    grammar: readonly GrammarGraphOption[];
    lexer: readonly GrammarGraphOption[];
  };
  sections: readonly GrammarGraphSection[];
  nodes: readonly GrammarGraphNode[];
  edges: readonly GrammarGraphEdge[];
};

const grammarOptions = [
  {
    id: "semicolonMode",
    label: "Semicolon mode",
    values: ["optional-eol", "required"],
    default: "optional-eol",
    description:
      "Controls whether statements require explicit terminators or can end at line/block boundaries.",
  },
  {
    id: "blockMode",
    label: "Block mode",
    values: ["delimited", "indentation"],
    default: "delimited",
    description:
      "Selects brace/word-delimited blocks or colon/newline/indentation blocks.",
  },
  {
    id: "typingMode",
    label: "Typing mode",
    values: ["typed", "untyped"],
    default: "typed",
    description:
      "Selects typed declarations/functions or dynamic funcao/variavel syntax.",
  },
  {
    id: "arrayMode",
    label: "Array mode",
    values: ["fixed", "dynamic"],
    default: "fixed",
    description:
      "Selects sized array dimensions or empty dynamic array dimensions.",
  },
] as const satisfies readonly GrammarGraphOption[];

const lexerOptions = [
  {
    id: "blockDelimiters",
    label: "Block delimiters",
    description:
      "Maps configured words such as begin/end to left_brace/right_brace tokens.",
  },
  {
    id: "indentationBlock",
    label: "Indentation block",
    description:
      "Emits NEWLINE, INDENT, and DEDENT tokens for indentation grammar mode.",
  },
  {
    id: "statementTerminatorLexeme",
    label: "Statement terminator lexeme",
    description: "Maps a custom lexeme to the semicolon token.",
  },
  {
    id: "operatorWordMap",
    label: "Operator word map",
    description: "Maps configured words to logical and relational operators.",
  },
  {
    id: "booleanLiteralMap",
    label: "Boolean literal map",
    description: "Maps configured words to true and false tokens.",
  },
] as const satisfies readonly GrammarGraphOption[];

const grammarGraphNodes = [
  {
    id: "program",
    label: "<program>",
    kind: "nonterminal",
    group: "topLevel",
    source: "src/token/TokenIterator.ts",
    productions: [
      {
        id: "program-functions",
        symbols: [{ id: "functionDecl", repeat: "*" }],
      },
    ],
  },
  {
    id: "functionDecl",
    label: "<functionDecl>",
    kind: "nonterminal",
    group: "topLevel",
    productions: [
      {
        id: "functionDecl-typed",
        symbols: [{ id: "typedFunctionDecl" }],
        modes: { typingMode: "typed" },
      },
      {
        id: "functionDecl-untyped",
        symbols: [{ id: "untypedFunctionDecl" }],
        modes: { typingMode: "untyped" },
      },
    ],
  },
  {
    id: "typedFunctionDecl",
    label: "<typedFunctionDecl>",
    kind: "nonterminal",
    group: "topLevel",
    source: "src/grammar/syntax/function-call.ts",
    productions: [
      {
        id: "typedFunctionDecl-main",
        symbols: [
          { id: "typeWithVoid" },
          { id: "identifier" },
          { id: "leftParen" },
          { id: "paramList" },
          { id: "rightParen" },
          { id: "block" },
        ],
        modes: { typingMode: "typed" },
      },
    ],
  },
  {
    id: "untypedFunctionDecl",
    label: "<untypedFunctionDecl>",
    kind: "nonterminal",
    group: "topLevel",
    source: "src/grammar/syntax/function-call.ts",
    productions: [
      {
        id: "untypedFunctionDecl-main",
        symbols: [
          { id: "kwFuncao" },
          { id: "identifier" },
          { id: "leftParen" },
          { id: "untypedParamList" },
          { id: "rightParen" },
          { id: "block" },
        ],
        modes: { typingMode: "untyped" },
      },
    ],
  },
  {
    id: "typeWithVoid",
    label: "<typeWithVoid>",
    kind: "nonterminal",
    group: "topLevel",
    productions: [
      { id: "typeWithVoid-type", symbols: [{ id: "type" }] },
      { id: "typeWithVoid-void", symbols: [{ id: "kwVoid" }] },
    ],
  },
  {
    id: "type",
    label: "<type>",
    kind: "nonterminal",
    group: "topLevel",
    source: "src/grammar/syntax/typeStmt.ts",
    productions: [
      { id: "type-int", symbols: [{ id: "kwInt" }] },
      { id: "type-float", symbols: [{ id: "kwFloat" }] },
      { id: "type-bool", symbols: [{ id: "kwBool" }] },
      { id: "type-string", symbols: [{ id: "kwString" }] },
    ],
  },
  {
    id: "block",
    label: "<block>",
    kind: "nonterminal",
    group: "blocks",
    source: "src/grammar/syntax/blockStmt.ts",
    productions: [
      {
        id: "block-delimited",
        symbols: [
          { id: "leftBrace" },
          { id: "stmtList" },
          { id: "rightBrace" },
        ],
        modes: { blockMode: "delimited" },
      },
      {
        id: "block-indentation",
        symbols: [
          { id: "colon" },
          { id: "newline", optional: true },
          { id: "indent" },
          { id: "stmtList" },
          { id: "dedent" },
        ],
        modes: { blockMode: "indentation" },
      },
    ],
  },
  {
    id: "stmtList",
    label: "<stmtList>",
    kind: "nonterminal",
    group: "blocks",
    source: "src/grammar/syntax/listStmt.ts",
    productions: [
      {
        id: "stmtList-repeat",
        symbols: [{ id: "stmt", repeat: "*" }],
      },
    ],
  },
  {
    id: "stmt",
    label: "<stmt>",
    kind: "nonterminal",
    group: "statements",
    source: "src/grammar/syntax/stmt.ts",
    productions: [
      { id: "stmt-for", symbols: [{ id: "forStmt" }] },
      { id: "stmt-print", symbols: [{ id: "printStmt" }] },
      { id: "stmt-scan", symbols: [{ id: "scanStmt" }] },
      { id: "stmt-while", symbols: [{ id: "whileStmt" }] },
      {
        id: "stmt-assignment",
        symbols: [{ id: "assignment" }, { id: "stmtTerminator" }],
      },
      {
        id: "stmt-increment",
        symbols: [{ id: "increment" }, { id: "stmtTerminator" }],
      },
      {
        id: "stmt-call",
        symbols: [{ id: "functionCallExpr" }, { id: "stmtTerminator" }],
      },
      { id: "stmt-if", symbols: [{ id: "ifStmt" }] },
      { id: "stmt-switch", symbols: [{ id: "switchStmt" }] },
      { id: "stmt-block", symbols: [{ id: "block" }] },
      { id: "stmt-declaration", symbols: [{ id: "declaration" }] },
      { id: "stmt-return", symbols: [{ id: "returnStmt" }] },
      {
        id: "stmt-break",
        symbols: [{ id: "kwBreak" }, { id: "stmtTerminator" }],
      },
      {
        id: "stmt-continue",
        symbols: [{ id: "kwContinue" }, { id: "stmtTerminator" }],
      },
      { id: "stmt-empty", symbols: [{ id: "stmtTerminator" }] },
      { id: "stmt-newline", symbols: [{ id: "newline" }] },
    ],
  },
  {
    id: "stmtTerminator",
    label: "<stmtTerminator>",
    kind: "nonterminal",
    group: "statements",
    source: "src/grammar/syntax/statementTerminator.ts",
    productions: [
      { id: "stmtTerminator-semicolon", symbols: [{ id: "semicolon" }] },
      {
        id: "stmtTerminator-configured",
        symbols: [{ id: "configuredTerminator" }],
      },
      {
        id: "stmtTerminator-eol",
        symbols: [{ id: "endOfLine" }],
        modes: { semicolonMode: "optional-eol" },
      },
    ],
  },
  {
    id: "declaration",
    label: "<declaration>",
    kind: "nonterminal",
    group: "declarations",
    source: "src/grammar/syntax/declarationStmt.ts",
    productions: [
      {
        id: "declaration-typed",
        symbols: [{ id: "typedDeclaration" }],
        modes: { typingMode: "typed" },
      },
      {
        id: "declaration-untyped",
        symbols: [{ id: "untypedDeclaration" }],
        modes: { typingMode: "untyped" },
      },
      {
        id: "declaration-untyped-array",
        symbols: [{ id: "untypedArrayDeclarationStmt" }],
        modes: { typingMode: "untyped" },
      },
    ],
  },
  {
    id: "typedDeclaration",
    label: "<typedDeclaration>",
    kind: "nonterminal",
    group: "declarations",
    productions: [
      {
        id: "typedDeclaration-main",
        symbols: [
          { id: "type" },
          { id: "declItem" },
          { id: "declItem", repeat: "*", optional: true },
          { id: "stmtTerminator" },
        ],
        modes: { typingMode: "typed" },
      },
    ],
  },
  {
    id: "untypedDeclaration",
    label: "<untypedDeclaration>",
    kind: "nonterminal",
    group: "declarations",
    productions: [
      {
        id: "untypedDeclaration-main",
        symbols: [
          { id: "kwVariavel" },
          { id: "declItem" },
          { id: "declItem", repeat: "*", optional: true },
          { id: "stmtTerminator" },
        ],
        modes: { typingMode: "untyped" },
      },
    ],
  },
  {
    id: "typedDeclarationWithoutTerminator",
    label: "<typedDeclarationWithoutTerminator>",
    kind: "nonterminal",
    group: "declarations",
    productions: [
      {
        id: "typedDeclarationWithoutTerminator-main",
        symbols: [
          { id: "type" },
          { id: "declItem" },
          { id: "declItem", repeat: "*", optional: true },
        ],
        modes: { typingMode: "typed" },
      },
    ],
  },
  {
    id: "declItem",
    label: "<declItem>",
    kind: "nonterminal",
    group: "declarations",
    productions: [
      {
        id: "declItem-main",
        symbols: [
          { id: "identifier" },
          { id: "arrayDecl", optional: true },
          { id: "assignmentInitializer", optional: true },
        ],
      },
    ],
  },
  {
    id: "assignmentInitializer",
    label: "<assignmentInitializer>",
    kind: "nonterminal",
    group: "declarations",
    productions: [
      {
        id: "assignmentInitializer-expr",
        symbols: [{ id: "equal" }, { id: "expr" }],
      },
      {
        id: "assignmentInitializer-array",
        symbols: [{ id: "equal" }, { id: "arrayLiteral" }],
      },
    ],
  },
  {
    id: "untypedArrayDeclarationStmt",
    label: "<untypedArrayDeclarationStmt>",
    kind: "nonterminal",
    group: "declarations",
    productions: [
      {
        id: "untypedArrayDeclarationStmt-main",
        symbols: [
          { id: "identifier" },
          { id: "arrayDecl" },
          { id: "equal" },
          { id: "arrayLiteral" },
          { id: "stmtTerminator" },
        ],
        modes: { typingMode: "untyped" },
      },
    ],
  },
  {
    id: "arrayDecl",
    label: "<arrayDecl>",
    kind: "nonterminal",
    group: "arrays",
    source: "src/grammar/syntax/declarationStmt.ts",
    productions: [
      {
        id: "arrayDecl-fixed",
        symbols: [{ id: "fixedArrayDecl" }],
        modes: { arrayMode: "fixed" },
      },
      {
        id: "arrayDecl-dynamic",
        symbols: [{ id: "dynamicArrayDecl" }],
        modes: { arrayMode: "dynamic" },
      },
    ],
  },
  {
    id: "fixedArrayDecl",
    label: "<fixedArrayDecl>",
    kind: "nonterminal",
    group: "arrays",
    productions: [
      {
        id: "fixedArrayDecl-dimensions",
        symbols: [
          { id: "leftBracket" },
          { id: "integerLiteral" },
          { id: "rightBracket" },
        ],
        modes: { arrayMode: "fixed" },
      },
    ],
  },
  {
    id: "dynamicArrayDecl",
    label: "<dynamicArrayDecl>",
    kind: "nonterminal",
    group: "arrays",
    productions: [
      {
        id: "dynamicArrayDecl-dimensions",
        symbols: [{ id: "leftBracket" }, { id: "rightBracket" }],
        modes: { arrayMode: "dynamic" },
      },
    ],
  },
  {
    id: "arrayLiteral",
    label: "<arrayLiteral>",
    kind: "nonterminal",
    group: "arrays",
    productions: [
      {
        id: "arrayLiteral-main",
        symbols: [
          { id: "leftBracket" },
          { id: "arrayLiteralItem", repeat: "*", optional: true },
          { id: "rightBracket" },
        ],
      },
    ],
  },
  {
    id: "arrayLiteralItem",
    label: "<arrayLiteralItem>",
    kind: "nonterminal",
    group: "arrays",
    productions: [
      { id: "arrayLiteralItem-expr", symbols: [{ id: "expr" }] },
      {
        id: "arrayLiteralItem-array",
        symbols: [{ id: "arrayLiteral" }],
      },
    ],
  },
  {
    id: "arrayAccess",
    label: "<arrayAccess>",
    kind: "nonterminal",
    group: "arrays",
    source: "src/grammar/syntax/factorStmt.ts",
    productions: [
      {
        id: "arrayAccess-indexes",
        symbols: [
          { id: "identifier" },
          { id: "leftBracket" },
          { id: "expr" },
          { id: "rightBracket" },
        ],
      },
    ],
  },
  {
    id: "forStmt",
    label: "<forStmt>",
    kind: "nonterminal",
    group: "controlFlow",
    source: "src/grammar/syntax/forStmt.ts",
    productions: [
      {
        id: "forStmt-main",
        symbols: [
          { id: "kwFor" },
          { id: "leftParen" },
          { id: "optForInit" },
          { id: "semicolon" },
          { id: "optExpr" },
          { id: "semicolon" },
          { id: "optAssignment" },
          { id: "rightParen" },
          { id: "stmt" },
        ],
      },
    ],
  },
  {
    id: "optForInit",
    label: "<optForInit>",
    kind: "nonterminal",
    group: "controlFlow",
    productions: [
      { id: "optForInit-assignment", symbols: [{ id: "assignment" }] },
      {
        id: "optForInit-declaration",
        symbols: [{ id: "typedDeclarationWithoutTerminator" }],
        modes: { typingMode: "typed" },
      },
      { id: "optForInit-empty", symbols: [] },
    ],
  },
  {
    id: "optExpr",
    label: "<optExpr>",
    kind: "nonterminal",
    group: "controlFlow",
    source: "src/grammar/syntax/optExprStmt.ts",
    productions: [
      { id: "optExpr-expr", symbols: [{ id: "expr" }] },
      { id: "optExpr-empty", symbols: [] },
    ],
  },
  {
    id: "optAssignment",
    label: "<optAssignment>",
    kind: "nonterminal",
    group: "controlFlow",
    source: "src/grammar/syntax/optAttributeStmt.ts",
    productions: [
      { id: "optAssignment-assignment", symbols: [{ id: "assignment" }] },
      { id: "optAssignment-empty", symbols: [] },
    ],
  },
  {
    id: "whileStmt",
    label: "<whileStmt>",
    kind: "nonterminal",
    group: "controlFlow",
    source: "src/grammar/syntax/whileStmt.ts",
    productions: [
      {
        id: "whileStmt-main",
        symbols: [
          { id: "kwWhile" },
          { id: "leftParen" },
          { id: "expr" },
          { id: "rightParen" },
          { id: "stmt" },
        ],
      },
    ],
  },
  {
    id: "ifStmt",
    label: "<ifStmt>",
    kind: "nonterminal",
    group: "controlFlow",
    source: "src/grammar/syntax/ifStmt.ts",
    productions: [
      {
        id: "ifStmt-main",
        symbols: [
          { id: "kwIf" },
          { id: "leftParen" },
          { id: "expr" },
          { id: "rightParen" },
          { id: "stmt" },
          { id: "elsePart" },
        ],
      },
    ],
  },
  {
    id: "elsePart",
    label: "<elsePart>",
    kind: "nonterminal",
    group: "controlFlow",
    source: "src/grammar/syntax/elsePartStmt.ts",
    productions: [
      {
        id: "elsePart-else",
        symbols: [{ id: "kwElse" }, { id: "stmt" }],
      },
      { id: "elsePart-empty", symbols: [] },
    ],
  },
  {
    id: "switchStmt",
    label: "<switchStmt>",
    kind: "nonterminal",
    group: "controlFlow",
    source: "src/grammar/syntax/switchStmt.ts",
    productions: [
      {
        id: "switchStmt-main",
        symbols: [
          { id: "kwSwitch" },
          { id: "leftParen" },
          { id: "expr" },
          { id: "rightParen" },
          { id: "switchBlock" },
        ],
      },
    ],
  },
  {
    id: "switchBlock",
    label: "<switchBlock>",
    kind: "nonterminal",
    group: "controlFlow",
    productions: [
      {
        id: "switchBlock-delimited",
        symbols: [
          { id: "leftBrace" },
          { id: "caseList" },
          { id: "defaultOpt" },
          { id: "rightBrace" },
        ],
        modes: { blockMode: "delimited" },
      },
      {
        id: "switchBlock-indentation",
        symbols: [
          { id: "colon" },
          { id: "newline", optional: true },
          { id: "indent" },
          { id: "caseList" },
          { id: "defaultOpt" },
          { id: "dedent" },
        ],
        modes: { blockMode: "indentation" },
      },
    ],
  },
  {
    id: "caseList",
    label: "<caseList>",
    kind: "nonterminal",
    group: "controlFlow",
    productions: [
      {
        id: "caseList-repeat",
        symbols: [{ id: "caseClause", repeat: "*" }],
      },
    ],
  },
  {
    id: "caseClause",
    label: "<caseClause>",
    kind: "nonterminal",
    group: "controlFlow",
    productions: [
      {
        id: "caseClause-main",
        symbols: [
          { id: "kwCase" },
          { id: "caseLiteral" },
          { id: "colon" },
          { id: "stmtList" },
        ],
      },
    ],
  },
  {
    id: "caseLiteral",
    label: "<caseLiteral>",
    kind: "nonterminal",
    group: "controlFlow",
    productions: [
      { id: "caseLiteral-integer", symbols: [{ id: "integerLiteral" }] },
      { id: "caseLiteral-octal", symbols: [{ id: "octalLiteral" }] },
      { id: "caseLiteral-hex", symbols: [{ id: "hexLiteral" }] },
      { id: "caseLiteral-string", symbols: [{ id: "stringLiteral" }] },
    ],
  },
  {
    id: "defaultOpt",
    label: "<defaultOpt>",
    kind: "nonterminal",
    group: "controlFlow",
    productions: [
      {
        id: "defaultOpt-default",
        symbols: [{ id: "kwDefault" }, { id: "colon" }, { id: "stmtList" }],
      },
      { id: "defaultOpt-empty", symbols: [] },
    ],
  },
  {
    id: "printStmt",
    label: "<printStmt>",
    kind: "nonterminal",
    group: "io",
    source: "src/grammar/syntax/ioStmt.ts",
    productions: [
      {
        id: "printStmt-main",
        symbols: [
          { id: "kwPrint" },
          { id: "leftParen" },
          { id: "argList" },
          { id: "rightParen" },
          { id: "stmtTerminator" },
        ],
      },
    ],
  },
  {
    id: "scanStmt",
    label: "<scanStmt>",
    kind: "nonterminal",
    group: "io",
    source: "src/grammar/syntax/ioStmt.ts",
    productions: [
      {
        id: "scanStmt-typed",
        symbols: [
          { id: "kwScan" },
          { id: "leftParen" },
          { id: "scanHint" },
          { id: "comma" },
          { id: "assignmentTarget" },
          { id: "rightParen" },
          { id: "stmtTerminator" },
        ],
        modes: { typingMode: "typed" },
      },
      {
        id: "scanStmt-untyped",
        symbols: [
          { id: "kwScan" },
          { id: "leftParen" },
          { id: "assignmentTarget" },
          { id: "rightParen" },
          { id: "stmtTerminator" },
        ],
        modes: { typingMode: "untyped" },
      },
    ],
  },
  {
    id: "scanHint",
    label: "<scanHint>",
    kind: "nonterminal",
    group: "io",
    productions: [
      { id: "scanHint-int", symbols: [{ id: "kwInt" }] },
      { id: "scanHint-float", symbols: [{ id: "kwFloat" }] },
      { id: "scanHint-percent-d", symbols: [{ id: "formatInt" }] },
      { id: "scanHint-percent-f", symbols: [{ id: "formatFloat" }] },
    ],
  },
  {
    id: "paramList",
    label: "<paramList>",
    kind: "nonterminal",
    group: "functions",
    source: "src/grammar/syntax/parameterListStmt.ts",
    productions: [
      {
        id: "paramList-typed",
        symbols: [{ id: "typedParam" }, { id: "typedParam", repeat: "*" }],
        modes: { typingMode: "typed" },
      },
      { id: "paramList-empty", symbols: [] },
    ],
  },
  {
    id: "typedParam",
    label: "<typedParam>",
    kind: "nonterminal",
    group: "functions",
    productions: [
      {
        id: "typedParam-main",
        symbols: [
          { id: "type" },
          { id: "identifier" },
          { id: "arrayDecl", optional: true },
        ],
        modes: { typingMode: "typed" },
      },
    ],
  },
  {
    id: "untypedParamList",
    label: "<untypedParamList>",
    kind: "nonterminal",
    group: "functions",
    source: "src/grammar/syntax/parameterListStmt.ts",
    productions: [
      {
        id: "untypedParamList-main",
        symbols: [{ id: "identifier" }, { id: "identifier", repeat: "*" }],
        modes: { typingMode: "untyped" },
      },
      { id: "untypedParamList-empty", symbols: [] },
    ],
  },
  {
    id: "functionCallExpr",
    label: "<functionCallExpr>",
    kind: "nonterminal",
    group: "functions",
    source: "src/grammar/syntax/functionCallExpr.ts",
    productions: [
      {
        id: "functionCallExpr-main",
        symbols: [
          { id: "identifier" },
          { id: "leftParen" },
          { id: "argList" },
          { id: "rightParen" },
        ],
      },
    ],
  },
  {
    id: "argList",
    label: "<argList>",
    kind: "nonterminal",
    group: "functions",
    source: "src/grammar/syntax/argumentListStmt.ts",
    productions: [
      {
        id: "argList-main",
        symbols: [{ id: "expr" }, { id: "expr", repeat: "*" }],
      },
      { id: "argList-empty", symbols: [] },
    ],
  },
  {
    id: "returnStmt",
    label: "<returnStmt>",
    kind: "nonterminal",
    group: "functions",
    source: "src/grammar/syntax/returnStmt.ts",
    productions: [
      {
        id: "returnStmt-main",
        symbols: [
          { id: "kwReturn" },
          { id: "optExpr" },
          { id: "stmtTerminator" },
        ],
      },
    ],
  },
  {
    id: "assignment",
    label: "<assignment>",
    kind: "nonterminal",
    group: "assignment",
    source: "src/grammar/syntax/attributeStmt.ts",
    productions: [
      {
        id: "assignment-main",
        symbols: [
          { id: "assignmentTarget" },
          { id: "assignmentOp" },
          { id: "expr" },
        ],
      },
    ],
  },
  {
    id: "assignmentTarget",
    label: "<assignmentTarget>",
    kind: "nonterminal",
    group: "assignment",
    productions: [
      { id: "assignmentTarget-identifier", symbols: [{ id: "identifier" }] },
      { id: "assignmentTarget-array", symbols: [{ id: "arrayAccess" }] },
    ],
  },
  {
    id: "assignmentOp",
    label: "<assignmentOp>",
    kind: "nonterminal",
    group: "assignment",
    productions: [
      { id: "assignmentOp-equal", symbols: [{ id: "equal" }] },
      { id: "assignmentOp-plus-equal", symbols: [{ id: "plusEqual" }] },
      { id: "assignmentOp-minus-equal", symbols: [{ id: "minusEqual" }] },
      { id: "assignmentOp-star-equal", symbols: [{ id: "starEqual" }] },
      { id: "assignmentOp-slash-equal", symbols: [{ id: "slashEqual" }] },
      { id: "assignmentOp-modulo-equal", symbols: [{ id: "moduloEqual" }] },
    ],
  },
  {
    id: "increment",
    label: "<increment>",
    kind: "nonterminal",
    group: "assignment",
    productions: [
      {
        id: "increment-prefix",
        symbols: [{ id: "incrementOp" }, { id: "identifier" }],
      },
      {
        id: "increment-postfix",
        symbols: [{ id: "identifier" }, { id: "incrementOp" }],
      },
    ],
  },
  {
    id: "expr",
    label: "<expr>",
    kind: "nonterminal",
    group: "expressions",
    source: "src/grammar/syntax/exprStmt.ts",
    productions: [{ id: "expr-or", symbols: [{ id: "orExpr" }] }],
  },
  {
    id: "orExpr",
    label: "<or>",
    kind: "nonterminal",
    group: "expressions",
    source: "src/grammar/syntax/orStmt.ts",
    productions: [
      {
        id: "orExpr-main",
        symbols: [{ id: "andExpr" }, { id: "restOr" }],
      },
    ],
  },
  {
    id: "restOr",
    label: "<restOr>",
    kind: "nonterminal",
    group: "expressions",
    source: "src/grammar/syntax/restOrStmt.ts",
    productions: [
      {
        id: "restOr-recursive",
        symbols: [{ id: "logicalOr" }, { id: "andExpr" }, { id: "restOr" }],
      },
      { id: "restOr-empty", symbols: [] },
    ],
  },
  {
    id: "andExpr",
    label: "<and>",
    kind: "nonterminal",
    group: "expressions",
    source: "src/grammar/syntax/andStmt.ts",
    productions: [
      {
        id: "andExpr-main",
        symbols: [{ id: "notExpr" }, { id: "restAnd" }],
      },
    ],
  },
  {
    id: "restAnd",
    label: "<restAnd>",
    kind: "nonterminal",
    group: "expressions",
    source: "src/grammar/syntax/restAndStmt.ts",
    productions: [
      {
        id: "restAnd-recursive",
        symbols: [{ id: "logicalAnd" }, { id: "notExpr" }, { id: "restAnd" }],
      },
      { id: "restAnd-empty", symbols: [] },
    ],
  },
  {
    id: "notExpr",
    label: "<not>",
    kind: "nonterminal",
    group: "expressions",
    source: "src/grammar/syntax/notStmt.ts",
    productions: [
      {
        id: "notExpr-prefix",
        symbols: [{ id: "logicalNot" }, { id: "notExpr" }],
      },
      { id: "notExpr-rel", symbols: [{ id: "relExpr" }] },
    ],
  },
  {
    id: "relExpr",
    label: "<rel>",
    kind: "nonterminal",
    group: "expressions",
    source: "src/grammar/syntax/relationalStmt.ts",
    productions: [
      {
        id: "relExpr-main",
        symbols: [{ id: "addExpr" }, { id: "restRel" }],
      },
    ],
  },
  {
    id: "restRel",
    label: "<restRel>",
    kind: "nonterminal",
    group: "expressions",
    source: "src/grammar/syntax/restRelationalStmt.ts",
    productions: [
      { id: "restRel-equal", symbols: [{ id: "equalEqual" }, { id: "addExpr" }] },
      { id: "restRel-not-equal", symbols: [{ id: "notEqual" }, { id: "addExpr" }] },
      { id: "restRel-less", symbols: [{ id: "less" }, { id: "addExpr" }] },
      { id: "restRel-less-equal", symbols: [{ id: "lessEqual" }, { id: "addExpr" }] },
      { id: "restRel-greater", symbols: [{ id: "greater" }, { id: "addExpr" }] },
      { id: "restRel-greater-equal", symbols: [{ id: "greaterEqual" }, { id: "addExpr" }] },
      { id: "restRel-empty", symbols: [] },
    ],
  },
  {
    id: "addExpr",
    label: "<add>",
    kind: "nonterminal",
    group: "expressions",
    source: "src/grammar/syntax/addStmt.ts",
    productions: [
      {
        id: "addExpr-main",
        symbols: [{ id: "multExpr" }, { id: "restAdd" }],
      },
    ],
  },
  {
    id: "restAdd",
    label: "<restAdd>",
    kind: "nonterminal",
    group: "expressions",
    source: "src/grammar/syntax/restAddStmt.ts",
    productions: [
      {
        id: "restAdd-plus",
        symbols: [{ id: "plus" }, { id: "multExpr" }, { id: "restAdd" }],
      },
      {
        id: "restAdd-minus",
        symbols: [{ id: "minus" }, { id: "multExpr" }, { id: "restAdd" }],
      },
      { id: "restAdd-empty", symbols: [] },
    ],
  },
  {
    id: "multExpr",
    label: "<mult>",
    kind: "nonterminal",
    group: "expressions",
    source: "src/grammar/syntax/multStmt.ts",
    productions: [
      {
        id: "multExpr-main",
        symbols: [{ id: "unaryExpr" }, { id: "restMult" }],
      },
    ],
  },
  {
    id: "restMult",
    label: "<restMult>",
    kind: "nonterminal",
    group: "expressions",
    source: "src/grammar/syntax/restMultStmt.ts",
    productions: [
      {
        id: "restMult-star",
        symbols: [{ id: "star" }, { id: "unaryExpr" }, { id: "restMult" }],
      },
      {
        id: "restMult-slash",
        symbols: [{ id: "slash" }, { id: "unaryExpr" }, { id: "restMult" }],
      },
      {
        id: "restMult-modulo",
        symbols: [{ id: "modulo" }, { id: "unaryExpr" }, { id: "restMult" }],
      },
      { id: "restMult-empty", symbols: [] },
    ],
  },
  {
    id: "unaryExpr",
    label: "<unary>",
    kind: "nonterminal",
    group: "expressions",
    source: "src/grammar/syntax/unitaryStmt.ts",
    productions: [
      { id: "unaryExpr-plus", symbols: [{ id: "plus" }, { id: "unaryExpr" }] },
      { id: "unaryExpr-minus", symbols: [{ id: "minus" }, { id: "unaryExpr" }] },
      { id: "unaryExpr-factor", symbols: [{ id: "factor" }] },
    ],
  },
  {
    id: "factor",
    label: "<factor>",
    kind: "nonterminal",
    group: "expressions",
    source: "src/grammar/syntax/factorStmt.ts",
    productions: [
      { id: "factor-integer", symbols: [{ id: "integerLiteral" }] },
      { id: "factor-float", symbols: [{ id: "floatLiteral" }] },
      { id: "factor-octal", symbols: [{ id: "octalLiteral" }] },
      { id: "factor-hex", symbols: [{ id: "hexLiteral" }] },
      { id: "factor-string", symbols: [{ id: "stringLiteral" }] },
      { id: "factor-true", symbols: [{ id: "kwTrue" }] },
      { id: "factor-false", symbols: [{ id: "kwFalse" }] },
      { id: "factor-identifier", symbols: [{ id: "identifier" }] },
      { id: "factor-array-access", symbols: [{ id: "arrayAccess" }] },
      { id: "factor-call", symbols: [{ id: "functionCallExpr" }] },
      {
        id: "factor-postfix-increment",
        symbols: [{ id: "identifier" }, { id: "incrementOp" }],
      },
      {
        id: "factor-parenthesized",
        symbols: [{ id: "leftParen" }, { id: "expr" }, { id: "rightParen" }],
      },
    ],
  },

  // Terminal tokens.
  { id: "identifier", label: "IDENT", kind: "terminal", group: "tokens" },
  { id: "integerLiteral", label: "INTEGER_LITERAL", kind: "terminal", group: "tokens" },
  { id: "floatLiteral", label: "FLOAT_LITERAL", kind: "terminal", group: "tokens" },
  { id: "octalLiteral", label: "OCTAL_LITERAL", kind: "terminal", group: "tokens" },
  { id: "hexLiteral", label: "HEX_LITERAL", kind: "terminal", group: "tokens" },
  { id: "stringLiteral", label: "STRING_LITERAL", kind: "terminal", group: "tokens" },
  { id: "formatInt", label: "\"%d\"", kind: "terminal", group: "tokens" },
  { id: "formatFloat", label: "\"%f\"", kind: "terminal", group: "tokens" },
  { id: "kwInt", label: "'int'", kind: "terminal", group: "tokens" },
  { id: "kwFloat", label: "'float'", kind: "terminal", group: "tokens" },
  { id: "kwBool", label: "'bool'", kind: "terminal", group: "tokens" },
  { id: "kwString", label: "'string'", kind: "terminal", group: "tokens" },
  { id: "kwVoid", label: "'void'", kind: "terminal", group: "tokens" },
  { id: "kwFuncao", label: "'funcao'", kind: "terminal", group: "tokens" },
  { id: "kwVariavel", label: "'variavel'", kind: "terminal", group: "tokens" },
  { id: "kwFor", label: "'for'", kind: "terminal", group: "tokens" },
  { id: "kwWhile", label: "'while'", kind: "terminal", group: "tokens" },
  { id: "kwBreak", label: "'break'", kind: "terminal", group: "tokens" },
  { id: "kwContinue", label: "'continue'", kind: "terminal", group: "tokens" },
  { id: "kwIf", label: "'if'", kind: "terminal", group: "tokens" },
  { id: "kwElse", label: "'else'", kind: "terminal", group: "tokens" },
  { id: "kwReturn", label: "'return'", kind: "terminal", group: "tokens" },
  { id: "kwPrint", label: "'print'", kind: "terminal", group: "tokens" },
  { id: "kwScan", label: "'scan'", kind: "terminal", group: "tokens" },
  { id: "kwSwitch", label: "'switch'", kind: "terminal", group: "tokens" },
  { id: "kwCase", label: "'case'", kind: "terminal", group: "tokens" },
  { id: "kwDefault", label: "'default'", kind: "terminal", group: "tokens" },
  { id: "kwTrue", label: "'true'", kind: "terminal", group: "tokens" },
  { id: "kwFalse", label: "'false'", kind: "terminal", group: "tokens" },
  { id: "leftBrace", label: "'{'", kind: "terminal", group: "tokens" },
  { id: "rightBrace", label: "'}'", kind: "terminal", group: "tokens" },
  { id: "leftParen", label: "'('", kind: "terminal", group: "tokens" },
  { id: "rightParen", label: "')'", kind: "terminal", group: "tokens" },
  { id: "leftBracket", label: "'['", kind: "terminal", group: "tokens" },
  { id: "rightBracket", label: "']'", kind: "terminal", group: "tokens" },
  { id: "semicolon", label: "';'", kind: "terminal", group: "tokens" },
  { id: "configuredTerminator", label: "<configuredTerminator>", kind: "terminal", group: "tokens" },
  { id: "endOfLine", label: "<endOfLine>", kind: "terminal", group: "tokens" },
  { id: "comma", label: "','", kind: "terminal", group: "tokens" },
  { id: "colon", label: "':'", kind: "terminal", group: "tokens" },
  { id: "newline", label: "NEWLINE", kind: "terminal", group: "tokens" },
  { id: "indent", label: "INDENT", kind: "terminal", group: "tokens" },
  { id: "dedent", label: "DEDENT", kind: "terminal", group: "tokens" },
  { id: "equal", label: "'='", kind: "terminal", group: "tokens" },
  { id: "plusEqual", label: "'+='", kind: "terminal", group: "tokens" },
  { id: "minusEqual", label: "'-='", kind: "terminal", group: "tokens" },
  { id: "starEqual", label: "'*='", kind: "terminal", group: "tokens" },
  { id: "slashEqual", label: "'/='", kind: "terminal", group: "tokens" },
  { id: "moduloEqual", label: "'%='", kind: "terminal", group: "tokens" },
  { id: "incrementOp", label: "'++'", kind: "terminal", group: "tokens" },
  { id: "logicalOr", label: "'||'", kind: "terminal", group: "tokens" },
  { id: "logicalAnd", label: "'&&'", kind: "terminal", group: "tokens" },
  { id: "logicalNot", label: "'!'", kind: "terminal", group: "tokens" },
  { id: "equalEqual", label: "'=='", kind: "terminal", group: "tokens" },
  { id: "notEqual", label: "'!='", kind: "terminal", group: "tokens" },
  { id: "less", label: "'<'", kind: "terminal", group: "tokens" },
  { id: "lessEqual", label: "'<='", kind: "terminal", group: "tokens" },
  { id: "greater", label: "'>'", kind: "terminal", group: "tokens" },
  { id: "greaterEqual", label: "'>='", kind: "terminal", group: "tokens" },
  { id: "plus", label: "'+'", kind: "terminal", group: "tokens" },
  { id: "minus", label: "'-'", kind: "terminal", group: "tokens" },
  { id: "star", label: "'*'", kind: "terminal", group: "tokens" },
  { id: "slash", label: "'/'", kind: "terminal", group: "tokens" },
  { id: "modulo", label: "'%'", kind: "terminal", group: "tokens" },
] as const satisfies readonly GrammarGraphNode[];

const grammarGraphSections = [
  {
    id: "topLevel",
    label: "Top Level",
    nodes: [
      "program",
      "functionDecl",
      "typedFunctionDecl",
      "untypedFunctionDecl",
      "typeWithVoid",
      "type",
    ],
  },
  { id: "blocks", label: "Blocks", nodes: ["block", "stmtList"] },
  {
    id: "statements",
    label: "Statements",
    nodes: ["stmt", "stmtTerminator"],
  },
  {
    id: "declarations",
    label: "Declarations",
    nodes: [
      "declaration",
      "typedDeclaration",
      "untypedDeclaration",
      "typedDeclarationWithoutTerminator",
      "declItem",
      "assignmentInitializer",
      "untypedArrayDeclarationStmt",
    ],
  },
  {
    id: "arrays",
    label: "Arrays",
    nodes: [
      "arrayDecl",
      "fixedArrayDecl",
      "dynamicArrayDecl",
      "arrayLiteral",
      "arrayLiteralItem",
      "arrayAccess",
    ],
  },
  {
    id: "controlFlow",
    label: "Control Flow",
    nodes: [
      "forStmt",
      "optForInit",
      "optExpr",
      "optAssignment",
      "whileStmt",
      "ifStmt",
      "elsePart",
      "switchStmt",
      "switchBlock",
      "caseList",
      "caseClause",
      "caseLiteral",
      "defaultOpt",
    ],
  },
  { id: "io", label: "IO", nodes: ["printStmt", "scanStmt", "scanHint"] },
  {
    id: "functions",
    label: "Functions",
    nodes: [
      "paramList",
      "typedParam",
      "untypedParamList",
      "functionCallExpr",
      "argList",
      "returnStmt",
    ],
  },
  {
    id: "assignment",
    label: "Assignment",
    nodes: ["assignment", "assignmentTarget", "assignmentOp", "increment"],
  },
  {
    id: "expressions",
    label: "Expressions",
    nodes: [
      "expr",
      "orExpr",
      "restOr",
      "andExpr",
      "restAnd",
      "notExpr",
      "relExpr",
      "restRel",
      "addExpr",
      "restAdd",
      "multExpr",
      "restMult",
      "unaryExpr",
      "factor",
    ],
  },
] as const satisfies readonly GrammarGraphSection[];

function mergeModes(
  productionModes: GrammarGraphModeGuard | undefined,
  symbolModes: GrammarGraphModeGuard | undefined,
): GrammarGraphModeGuard | undefined {
  if (!productionModes && !symbolModes) return undefined;
  return { ...(productionModes ?? {}), ...(symbolModes ?? {}) };
}

function createGrammarGraphEdges(
  nodes: readonly GrammarGraphNode[],
): GrammarGraphEdge[] {
  const edges: GrammarGraphEdge[] = [];

  for (const node of nodes) {
    for (const production of node.productions ?? []) {
      production.symbols.forEach((symbol, index) => {
        const modes = mergeModes(production.modes, symbol.modes);
        const edge: GrammarGraphEdge = {
          id: `${node.id}:${production.id}:${index}:${symbol.id}`,
          from: node.id,
          to: symbol.id,
          label: "expands",
          production: production.id,
        };

        if (symbol.optional) edge.optional = true;
        if (symbol.repeat) edge.repeat = symbol.repeat;
        if (modes) edge.modes = modes;

        edges.push(edge);
      });
    }
  }

  return edges;
}

export const grammarGraph: GrammarGraph = {
  version: 1,
  start: "program",
  options: {
    grammar: grammarOptions,
    lexer: lexerOptions,
  },
  sections: grammarGraphSections,
  nodes: grammarGraphNodes,
  edges: createGrammarGraphEdges(grammarGraphNodes),
};

export function toGrammarGraphJson(): string {
  return JSON.stringify(grammarGraph, null, 2);
}
