const grammar = {
  unexpected_statement: "Comando inesperado: {lexeme}",
  unexpected_type:
    'Tipo inesperado "{lexeme}" na linha {line}, coluna {column}.',
  unexpected_token:
    'Token inesperado "{lexeme}" na linha {line}, coluna {column}.',
  break_outside_loop: "Comando break fora de um loop ou switch",
  continue_outside_loop: "Comando continue fora de um loop",
  invalid_assignment_operator:
    'Operador de atribuição inválido "{lexeme}" na linha {line}, coluna {column}.',
  unexpected_output_token: "Token de saída inesperado: {lexeme}",
  invalid_unary_increment:
    'Uso inválido de incremento unário "{lexeme}" na linha {line}, coluna {column}.',
  case_outside_switch: "Comando case fora de um switch",
  default_outside_switch: "Comando default fora de um switch",
  duplicate_case_label: 'Rótulo de case duplicado "{lexeme}" no switch',
  invalid_case_literal:
    'Literal inválido em case "{lexeme}". Apenas inteiros e strings são permitidos.',
  lossy_int_conversion:
    "Possível conversão com perda de dados de {sourceType} para {targetType}.",
  incompatible_type_conversion:
    "Conversao incompativel de {sourceType} para {targetType}.",
};

export default grammar;
