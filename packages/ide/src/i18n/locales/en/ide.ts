import type { IdeIntl } from "../../types/ide";

const ide: IdeIntl = {
  files: {
    main: `// MAIN FILE
//
// This is the entry point of your program.
//
// Use this file to write and test programs
// with the language you are building.
`,

    token: `// TOKENS AND LEXEMES
//
// A token is a category recognized by the language.
//
// Examples:
// NUMBER
// IDENTIFIER
// PLUS
// IF
//
// A lexeme is the exact text found in the source code.
//
// Example:
//
// age + 10
//
// "age" -> IDENTIFIER
// "+"   -> PLUS
// "10"  -> NUMBER
//
// Token  = category
// Lexeme = text found in the source code
`,

    lexer: `// LEXICAL ANALYZER
//
// The lexer reads source code and turns it
// into a sequence of tokens.
//
// Example:
//
// int age = 20;
//
// can produce:
//
// KEYWORD("int")
// IDENTIFIER("age")
// ASSIGN("=")
// NUMBER("20")
// SEMICOLON(";")
//
// Flow:
//
// Source code
//      |
//    Lexer
//      |
//    Tokens
`,

    expr: `// EXPRESSIONS
//
// An expression is a construct that can be evaluated
// and usually produces a value.
//
// Examples:
//
// 10
//
// age
//
// 10 + 5
//
// age >= 18
//
// sum(10, 20)
//
// An expression can contain other expressions.
//
// Example:
//
// 10 + 5
//
//      +
//     / \\
//   10   5
`,

    stmt: `// STATEMENTS
//
// A statement represents an action executed by the program.
//
// Examples:
//
// print("Hello")
//
// age = 20
//
// if age >= 18 {
//   print("Adult")
// }
//
// A simple distinction:
//
// EXPRESSION
//
// age >= 18
//      |
//    true
//
// STATEMENT
//
// print("Hello")
//      |
// performs an action
`,

    grammar: `// GRAMMAR
//
// The grammar defines how language elements
// can be combined.
//
// It determines which structures are valid code.
//
// Simplified example:
//
// expression :=
//     number
//   | identifier
//   | expression operator expression
//
// ifStatement :=
//   "if" expression block
//
// The lexer identifies tokens.
// The grammar defines how those tokens can be organized.
`,

    parser: `// PARSER
//
// The parser receives the tokens produced by the lexer
// and checks whether they follow the grammar rules.
//
// Flow:
//
// Code
//   |
// Lexer
//   |
// Tokens
//   |
// Parser
//   |
// AST
//
// Example:
//
// 10 + 5
//
// Tokens:
//
// NUMBER PLUS NUMBER
//
// Result:
//
// BinaryExpression
`,

    ast: `// ABSTRACT SYNTAX TREE - AST
//
// The AST represents the structure of the program
// as a tree.
//
// Code:
//
// x = 10 + 5
//
// Representation:
//
// Assignment
// |-- Identifier: x
// \`-- BinaryExpression
//     |-- Number: 10
//     |-- Operator: +
//     \`-- Number: 5
//
// The AST keeps the structure needed
// to understand and execute the program.
`,

    types: `// TYPES
//
// Types represent different categories of values.
//
// Examples:
//
// integer
// decimal
// text
// boolean
//
// The type system also decides which operations
// can be performed between values.
`,

    scope: `// SCOPE
//
// Scope determines where variables, functions,
// and other identifiers can be used.
//
// Example:
//
// {
//   int age = 20
// }
//
// Depending on the language rules,
// "age" may not exist outside this block.
//
// Scopes are important for:
//
// - variables
// - functions
// - parameters
// - blocks
`,

    semantic: `// SEMANTIC ANALYSIS
//
// Code can be syntactically correct
// and still have an invalid meaning.
//
// Example:
//
// 10 + "Hello"
//
// The structure may be accepted by the grammar,
// but the language may forbid adding
// a number and text.
//
// Semantic analysis can check:
//
// - type compatibility
// - whether variables exist
// - scope rules
// - function calls
// - language-specific rules
`,

    emitter: `// INTERMEDIATE REPRESENTATION - IR
//
// The emitter transforms the analyzed program structure
// into an intermediate representation.
//
// Flow:
//
// AST
//  |
// Emitter
//  |
// IR
//  |
// Interpreter
//
// The IR can make program execution simpler.

export {};
`,

    interpreter: `// INTERPRETER
//
// The interpreter executes the program.
//
// It can be responsible for:
//
// - evaluating expressions
// - executing statements
// - storing variables
// - controlling scopes
// - running conditions
// - running loops
// - calling functions
//
// Flow:
//
// IR / AST
//    |
// Interpreter
//    |
// Result

export {};
`,

    lexerSpec: `// LEXER TESTS
//
// Use this file to test whether the lexical analyzer
// recognizes the language tokens correctly.
//
// Example:
//
// input:
//
// age + 10
//
// expected:
//
// IDENTIFIER
// PLUS
// NUMBER

export {};
`,

    readme: `# Dynamic Interpreter

This project represents a language created in Dynamic Interpreter.

## How a program is interpreted

\`\`\`text
Source code
     |
Lexer
     |
Tokens
     |
Parser
     |
AST
     |
Semantic Analysis
     |
IR
     |
Interpreter
     |
Result
\`\`\`

## Project structure

### grammar

Contains the elements responsible for the syntactic rules of the language.

### parser

Transforms tokens into a structure that represents the program.

### semantics

Handles types, scopes, and semantic validations.

### ir

Represents the stages closest to execution.

## Important concepts

### Token

A category recognized by the lexer.

### Lexeme

The real text found in the source code.

### Expression

A construct that usually produces a value.

### Statement

An instruction executed by the program.

### AST

A structural representation of the program.

### Semantic analysis

Checks whether the code has valid meaning according to the language rules.
`,
  },
};

export default ide;
