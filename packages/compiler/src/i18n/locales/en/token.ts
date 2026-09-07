const token: Record<string, string> = {
  // Arithmetics
  plus: "addition (+)",
  minus: "subtraction (-)",
  star: "multiplication (*)",
  slash: "division (/)",
  modulo: "modulo (%)",

  // Logicals
  logical_or: "logical OR (||)",
  logical_and: "logical AND (&&)",
  logical_not: "logical NOT (!)",

  // Relationals
  equal_equal: "equality (==)",
  not_equal: "inequality (!=)",
  greater: "greater than (>)",
  greater_equal: "greater or equal (>=)",
  less: "less than (<)",
  less_equal: "less or equal (<=)",

  // Assignments
  equal: "assignment (=)",
  plus_equal: "addition assignment (+=)",
  minus_equal: "subtraction assignment (-=)",
  star_equal: "multiplication assignment (*=)",
  slash_equal: "division assignment (/=)",
  modulo_equal: "modulo assignment (%=)",

  // Reserved words
  int: "keyword int",
  float: "keyword float",
  string: "keyword string",
  void: "keyword void",
  for: "keyword for",
  while: "keyword while",
  break: "keyword break",
  continue: "keyword continue",
  if: "keyword if",
  else: "keyword else",
  return: "keyword return",
  print: "keyword print",
  scan: "keyword scan",
  switch: "keyword switch",
  case: "keyword case",
  default: "keyword default",
  variable: "keyword variable",
  function: "keyword function",

  // Symbols
  semicolon: "semicolon (;)",
  comma: "comma (,)",
  left_brace: "opening brace ({)",
  right_brace: "closing brace (})",
  left_paren: "opening parenthesis (()",
  right_paren: "closing parenthesis ())",
  dot: "dot (.)",
  colon: "colon (:)",
  newline: "newline",
  indent: "indentation",
  dedent: "dedentation",

  // Literals
  identifier: "identifier",
  string_literal: "string literal",
  integer_literal: "integer literal",
  float_literal: "float literal",
  hex_literal: "hexadecimal literal",
  octal_literal: "octal literal",
};

export default token;
