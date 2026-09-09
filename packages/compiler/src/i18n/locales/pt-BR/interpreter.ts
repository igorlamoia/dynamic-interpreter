const interpreter = {
  label_defined_multiple_times: "Label '{labelName}' definido mais de uma vez!",
  no_main_function: "Nenhuma função 'main' encontrada!",
  arithmetic_requires_numeric:
    "Operação aritmética '{op}' requer operandos numéricos. Entre '{val1}' e '{val2}'",
  unary_arithmetic_requires_numeric:
    "Operação aritmética unária '{op}' requer um operando numérico. Recebido '{val1}'",
  invalid_unary_operator: "Operador aritmético unário inválido '{op}'",
  unary_operation_requires_numeric:
    "Operação unária '{op}' requer operando numérico. Recebido '{val1}'",
  if_requires_labels:
    "IF requer nomes de label como operand1/operand2. Recebido '{labelTrue}' e '{labelFalse}'",
  scan_requires_string_variable:
    "SCAN requer um nome de variável string como operand1. Recebido '{operand2}'",
  declare_requires_string:
    "DECLARE requer um nome de variável string como result. Recebido '{result}'",
  unknown_operation:
    "Operação desconhecida '{op}' no Ponteiro de Instrução = {instructionPointer}",
  label_not_found:
    "Label '{label}' não encontrado! Labels disponíveis: {availableLabels}",
  variable_not_found:
    "Variável '{name}' não encontrada. Variáveis disponíveis: {availableVariables}",
  unknown_arithmetic_operator: "Operador aritmético desconhecido '{op}'",
  unknown_relational_operator: "Operador relacional desconhecido '{op}'",
  invalid_operand_type: "Tipo de operando inválido: {operand}",
  variable_not_defined: "Variável '{operand}' ainda não foi definida!",
  array_read_out_of_bounds: "Leitura de array fora dos limites no índice '{index}'",
  array_write_out_of_bounds:
    "Escrita em array fora dos limites no índice '{index}'",
  array_missing_value:
    "Leitura de array dinâmico sem valor no índice '{index}'",
  incompatible_assignment:
    "Nao e possivel atribuir um valor {sourceType} a variavel {targetType} '{variableName}'.",
  incompatible_return:
    "Nao e possivel retornar um valor {sourceType} de uma funcao declarada como {targetType}.",
};

export default interpreter;
