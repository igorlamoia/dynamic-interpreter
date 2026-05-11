# Grammar AST Reference

This file documents the grammar currently parsed by `src/grammar/syntax`.
It is also the source reference for the AST JSON config that the frontend can
use to render a grammar graph.

## Runtime Options

The parser receives grammar options through `TokenIterator`.

| Option | Values | Default | Effect |
| --- | --- | --- | --- |
| `semicolonMode` | `optional-eol`, `required` | `optional-eol` | In optional mode, a statement may end with a semicolon, configured terminator, newline, `}`, or `DEDENT`. In required mode, statement terminators are mandatory. |
| `blockMode` | `delimited`, `indentation` | `delimited` | Delimited mode parses `{ ... }`. Indentation mode parses `: NEWLINE INDENT ... DEDENT`. |
| `typingMode` | `typed`, `untyped` | `typed` | Typed mode uses typed function signatures and declarations. Untyped mode uses `funcao` and `variavel`, and values are `dynamic`. |
| `arrayMode` | `fixed`, `dynamic` | `fixed` when arrays are parsed | Fixed arrays require integer sizes in declarations. Dynamic arrays use empty brackets. |

The lexer can also change the token surface before parsing.

| Lexer option | Effect on grammar |
| --- | --- |
| `blockDelimiters: { open, close }` | Maps configured words like `begin` and `end` to `left_brace` and `right_brace`, so all `{ ... }` productions also accept those tokens. |
| `indentationBlock: true` | Emits `NEWLINE`, `INDENT`, and `DEDENT` tokens for `blockMode: "indentation"`. Cannot be combined with configured block delimiters. |
| `statementTerminatorLexeme` | Maps a configured lexeme to the semicolon token. Parser errors mention the configured lexeme when required. |
| `operatorWordMap` | Maps configured words to logical and relational operators. |
| `booleanLiteralMap` | Maps configured words to `true` and `false` tokens. |

## Top Level

```ebnf
<program> -> <functionDecl>*

<functionDecl> ->
    <typedFunctionDecl>
  | <untypedFunctionDecl>

<typedFunctionDecl> ->
  <typeWithVoid> IDENT '(' <paramList> ')' <block>

<untypedFunctionDecl> ->
  'funcao' IDENT '(' <untypedParamList> ')' <block>

<typeWithVoid> -> <type> | 'void'
<type> -> 'int' | 'float' | 'bool' | 'string'
```

`<typedFunctionDecl>` is selected when `typingMode` is `typed`.
`<untypedFunctionDecl>` is selected when `typingMode` is `untyped`.

## Blocks And Statement Lists

```ebnf
<block> ->
    '{' <stmtList> '}'
  | ':' NEWLINE? INDENT <stmtList> DEDENT

<stmtList> -> <stmt> <stmtList> | &
```

The delimited form is used when `blockMode` is `delimited`. The indentation
form is used when `blockMode` is `indentation`.

## Statements

```ebnf
<stmt> ->
    <forStmt>
  | <printStmt>
  | <scanStmt>
  | <whileStmt>
  | <assignment> <stmtTerminator>
  | <increment> <stmtTerminator>
  | <functionCallExpr> <stmtTerminator>
  | <ifStmt>
  | <switchStmt>
  | <block>
  | <declaration>
  | <returnStmt>
  | 'break' <stmtTerminator>
  | 'continue' <stmtTerminator>
  | <stmtTerminator>
  | NEWLINE

<stmtTerminator> ->
    ';'
  | <configuredTerminator>
  | <endOfLineAllowedByOptionalMode>
```

`<endOfLineAllowedByOptionalMode>` is accepted only when `semicolonMode` is
`optional-eol`.

## Declarations

```ebnf
<declaration> ->
    <typedDeclaration>
  | <untypedDeclaration>

<typedDeclaration> ->
  <type> <declItem> (',' <declItem>)* <stmtTerminator>

<untypedDeclaration> ->
  'variavel' <declItem> (',' <declItem>)* <stmtTerminator>

<typedDeclarationWithoutTerminator> ->
  <type> <declItem> (',' <declItem>)*

<declItem> ->
  IDENT <arrayDecl>? ('=' (<expr> | <arrayLiteral>))?

<untypedArrayDeclarationStmt> ->
  IDENT <arrayDecl> '=' <arrayLiteral> <stmtTerminator>
```

`<typedDeclaration>` is used in typed mode. `<untypedDeclaration>` is used in
untyped mode. The standalone untyped array form supports declarations like
`lista[] = [];` in untyped dynamic array mode.

## Arrays

```ebnf
<arrayDecl> ->
    <fixedArrayDecl>
  | <dynamicArrayDecl>

<fixedArrayDecl> ->
  ('[' INTEGER_LITERAL ']')+

<dynamicArrayDecl> ->
  ('[' ']')+

<arrayLiteral> ->
  '[' (<arrayLiteralItem> (',' <arrayLiteralItem>)*)? ']'

<arrayLiteralItem> ->
    <expr>
  | <arrayLiteral>

<arrayAccess> ->
  IDENT ('[' <expr> ']')+
```

Fixed array mode requires integer sizes in every dimension. Dynamic array mode
requires empty dimensions in declarations. Fixed array access must provide
exactly the declared dimensions; dynamic array access can provide the declared
number of dimensions or more.

## Control Flow

```ebnf
<forStmt> ->
  'for' '(' <optForInit> ';' <optExpr> ';' <optAssignment> ')' <stmt>

<optForInit> ->
    <assignment>
  | <typedDeclarationWithoutTerminator>
  | &

<optExpr> -> <expr> | &
<optAssignment> -> <assignment> | &

<whileStmt> ->
  'while' '(' <expr> ')' <stmt>

<ifStmt> ->
  'if' '(' <expr> ')' <stmt> <elsePart>

<elsePart> ->
    'else' <stmt>
  | &

<switchStmt> ->
  'switch' '(' <expr> ')' <switchBlock>

<switchBlock> ->
    '{' <caseList> <defaultOpt> '}'
  | ':' NEWLINE? INDENT <caseList> <defaultOpt> DEDENT

<caseList> -> <caseClause> <caseList> | &
<caseClause> -> 'case' <caseLiteral> ':' <stmtList>
<caseLiteral> -> INTEGER_LITERAL | OCTAL_LITERAL | HEX_LITERAL | STRING_LITERAL
<defaultOpt> -> 'default' ':' <stmtList> | &
```

The semicolons inside the `for` header are literal separators. They are not
replaced by `statementTerminatorLexeme`.

## IO

```ebnf
<printStmt> ->
  'print' '(' <argList> ')' <stmtTerminator>

<scanStmt> ->
    'scan' '(' <scanHint> ',' <assignmentTarget> ')' <stmtTerminator>
  | 'scan' '(' <assignmentTarget> ')' <stmtTerminator>

<scanHint> ->
    'int'
  | 'float'
  | '"%d"'
  | '"%f"'
```

The typed scan form is used in typed mode. The bare scan form is used in
untyped mode. The assignment target may be a scalar identifier or an indexed
array element.

## Functions And Arguments

```ebnf
<paramList> ->
    <typedParam> (',' <typedParam>)*
  | &

<typedParam> ->
  <type> IDENT <arrayDecl>?

<untypedParamList> ->
    IDENT (',' IDENT)*
  | &

<functionCallExpr> ->
  IDENT '(' <argList> ')'

<argList> ->
    <expr> (',' <expr>)*
  | &

<returnStmt> ->
  'return' <optExpr> <stmtTerminator>
```

## Assignment And Increment

```ebnf
<assignment> ->
  <assignmentTarget> <assignmentOp> <expr>

<assignmentTarget> ->
    IDENT
  | <arrayAccess>

<assignmentOp> ->
    '='
  | '+='
  | '-='
  | '*='
  | '/='
  | '%='

<increment> ->
    '++' IDENT
  | IDENT '++'
```

Plain `=` also supports right-associative scalar chains such as
`a = b = c = expr`.

## Expressions

```ebnf
<expr> -> <or>

<or> -> <and> <restOr>
<restOr> -> '||' <and> <restOr> | &

<and> -> <not> <restAnd>
<restAnd> -> '&&' <not> <restAnd> | &

<not> -> '!' <not> | <rel>

<rel> -> <add> <restRel>
<restRel> ->
    '==' <add>
  | '!=' <add>
  | '<' <add>
  | '<=' <add>
  | '>' <add>
  | '>=' <add>
  | &

<add> -> <mult> <restAdd>
<restAdd> ->
    '+' <mult> <restAdd>
  | '-' <mult> <restAdd>
  | &

<mult> -> <unary> <restMult>
<restMult> ->
    '*' <unary> <restMult>
  | '/' <unary> <restMult>
  | '%' <unary> <restMult>
  | &

<unary> ->
    '+' <unary>
  | '-' <unary>
  | <factor>

<factor> ->
    INTEGER_LITERAL
  | FLOAT_LITERAL
  | OCTAL_LITERAL
  | HEX_LITERAL
  | STRING_LITERAL
  | 'true'
  | 'false'
  | IDENT
  | <arrayAccess>
  | <functionCallExpr>
  | IDENT '++'
  | '(' <expr> ')'
```

Word aliases from `operatorWordMap` and `booleanLiteralMap` produce the same
tokens as the symbolic operators and boolean literals above.

## AST Graph Config Target

The frontend graph can import `grammarGraph` from `grammarGraph.ts`. The data
is library-agnostic: graph libraries can use `nodes` and `edges`, while a
custom tree can use `sections` plus each node's `productions`.

```ts
import { grammarGraph, toGrammarGraphJson } from "./grammarGraph";

const { nodes, edges, sections, options } = grammarGraph;

// Use this if a consumer needs plain JSON instead of TypeScript data.
const json = toGrammarGraphJson();
```

Recommended node fields for graph rendering:

- `id`: stable camelCase grammar symbol, for example `functionDecl`.
- `kind`: `nonterminal`, `terminal`, `option`, or `mode`.
- `label`: display text for the graph.
- `productions`: alternatives as ordered symbol arrays.
- `source`: optional parser file path, for example `src/grammar/syntax/stmt.ts`.

Recommended edge fields:

- `from` and `to`: node ids.
- `label`: relationship such as `expands`, `contains`, `uses`, or `mode`.
- `production`: production id that created the edge.
- `optional`: marks epsilon or optional paths.
- `repeat`: marks repeated grammar parts such as `*` or `+`.
- `modes`: optional guards such as `{ "typingMode": "typed" }`.
