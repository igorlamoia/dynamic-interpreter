const grammar = {
  unexpected_statement: "Sentencia inesperada: {lexeme}",
  unexpected_type:
    'Tipo inesperado "{lexeme}" en la línea {line}, columna {column}.',
  unexpected_token:
    'Token inesperado "{lexeme}" en la línea {line}, columna {column}.',
  break_outside_loop: "Sentencia break fuera de un bucle o switch",
  continue_outside_loop: "Sentencia continue fuera de un bucle",
  invalid_assignment_operator:
    'Operador de asignación inválido "{lexeme}" en la línea {line}, columna {column}.',
  unexpected_output_token: "Token de salida inesperado: {lexeme}",
  invalid_unary_increment:
    'Uso inválido de incremento unario "{lexeme}" en la línea {line}, columna {column}.',
  case_outside_switch: "Sentencia case fuera de switch",
  default_outside_switch: "Sentencia default fuera de switch",
  duplicate_case_label: 'Etiqueta case duplicada "{lexeme}" en switch',
  invalid_case_literal:
    'Literal inválido en case "{lexeme}". Solo se permiten enteros y strings.',
  lossy_int_conversion:
    "Posible conversión con pérdida de datos de {sourceType} a {targetType}.",
  incompatible_type_conversion:
    "Conversion incompatible de {sourceType} a {targetType}.",
};

export default grammar;
