const token: Record<string, string> = {
  // Aritméticos
  plus: "adição (+)",
  minus: "subtração (-)",
  star: "multiplicação (*)",
  slash: "divisão (/)",
  modulo: "módulo (%)",

  // Lógicos
  logical_or: "OU lógico (||)",
  logical_and: "E lógico (&&)",
  logical_not: "negação lógica (!)",

  // Relacionais
  equal_equal: "igualdade (==)",
  not_equal: "diferença (!=)",
  greater: "maior que (>)",
  greater_equal: "maior ou igual (>=)",
  less: "menor que (<)",
  less_equal: "menor ou igual (<=)",

  // Atribuições
  equal: "atribuição (=)",
  plus_equal: "adição com atribuição (+=)",
  minus_equal: "subtração com atribuição (-=)",
  star_equal: "multiplicação com atribuição (*=)",
  slash_equal: "divisão com atribuição (/=)",
  modulo_equal: "módulo com atribuição (%=)",

  // Palavras reservadas
  int: "palavra reservada int",
  float: "palavra reservada float",
  string: "palavra reservada string",
  void: "palavra reservada void",
  for: "palavra reservada for",
  while: "palavra reservada while",
  break: "palavra reservada break",
  continue: "palavra reservada continue",
  if: "palavra reservada if",
  else: "palavra reservada else",
  return: "palavra reservada return",
  print: "palavra reservada print",
  scan: "palavra reservada scan",
  switch: "palavra reservada switch",
  case: "palavra reservada case",
  default: "palavra reservada default",
  variable: "palavra reservada variable",
  function: "palavra reservada function",

  // Símbolos
  semicolon: "final de instrução",
  comma: "vírgula",
  left_brace: "abre chaves",
  right_brace: "fecha chaves",
  left_paren: "abre parênteses",
  right_paren: "fecha parênteses",
  dot: "ponto",
  colon: "dois pontos",
  newline: "nova linha",
  indent: "indentação",
  dedent: "desindentação",

  // Literais
  identifier: "identificador",
  string_literal: "literal string",
  integer_literal: "literal inteiro",
  float_literal: "literal float",
  hex_literal: "literal hexadecimal",
  octal_literal: "literal octal",
};

export default token;
