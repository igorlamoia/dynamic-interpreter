const token: Record<string, string> = {
  // Aritméticos
  plus: "suma (+)",
  minus: "resta (-)",
  star: "multiplicación (*)",
  slash: "división (/)",
  modulo: "módulo (%)",

  // Lógicos
  logical_or: "O lógico (||)",
  logical_and: "Y lógico (&&)",
  logical_not: "negación lógica (!)",

  // Relacionales
  equal_equal: "igualdad (==)",
  not_equal: "desigualdad (!=)",
  greater: "mayor que (>)",
  greater_equal: "mayor o igual (>=)",
  less: "menor que (<)",
  less_equal: "menor o igual (<=)",

  // Asignaciones
  equal: "asignación (=)",
  plus_equal: "suma con asignación (+=)",
  minus_equal: "resta con asignación (-=)",
  star_equal: "multiplicación con asignación (*=)",
  slash_equal: "división con asignación (/=)",
  modulo_equal: "módulo con asignación (%=)",

  // Palabras reservadas
  int: "palabra reservada int",
  float: "palabra reservada float",
  string: "palabra reservada string",
  void: "palabra reservada void",
  for: "palabra reservada for",
  while: "palabra reservada while",
  break: "palabra reservada break",
  continue: "palabra reservada continue",
  if: "palabra reservada if",
  else: "palabra reservada else",
  return: "palabra reservada return",
  print: "palabra reservada print",
  scan: "palabra reservada scan",
  switch: "palabra reservada switch",
  case: "palabra reservada case",
  default: "palabra reservada default",
  variable: "palabra reservada variable",
  function: "palabra reservada function",

  // Símbolos
  semicolon: "punto y coma (;)",
  comma: "coma (,)",
  left_brace: "abrir llaves ({)",
  right_brace: "cerrar llaves (})",
  left_paren: "abrir paréntesis (()",
  right_paren: "cerrar paréntesis ())",
  dot: "punto (.)",
  colon: "dos puntos (:)",
  newline: "nueva línea",
  indent: "indentación",
  dedent: "desindentación",

  // Literales
  identifier: "identificador",
  string_literal: "literal string",
  integer_literal: "literal entero",
  float_literal: "literal float",
  hex_literal: "literal hexadecimal",
  octal_literal: "literal octal",
};

export default token;
