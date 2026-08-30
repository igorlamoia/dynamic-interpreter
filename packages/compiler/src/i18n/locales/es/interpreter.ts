const interpreter = {
  label_defined_multiple_times:
    "¡Etiqueta '{labelName}' definida más de una vez!",
  no_main_function: "¡No se encontró la función 'main'!",
  arithmetic_requires_numeric:
    "La operación aritmética '{op}' requiere operandos numéricos. Entre '{val1}' y '{val2}'",
  unary_arithmetic_requires_numeric:
    "La operación aritmética unaria '{op}' requiere un operando numérico. Recibido '{val1}'",
  invalid_unary_operator: "Operador aritmético unario inválido '{op}'",
  unary_operation_requires_numeric:
    "La operación unaria '{op}' requiere un operando numérico. Recibido '{val1}'",
  if_requires_labels:
    "IF requiere nombres de etiqueta como operand1/operand2. Recibido '{labelTrue}' y '{labelFalse}'",
  scan_requires_string_variable:
    "SCAN requiere un nombre de variable de cadena como operand1. Recibido '{operand2}'",
  declare_requires_string:
    "DECLARE requiere un nombre de variable de cadena como result. Recibido '{result}'",
  unknown_operation:
    "Operación desconocida '{op}' en el Puntero de Instrucción = {instructionPointer}",
  label_not_found:
    "¡Etiqueta '{label}' no encontrada! Etiquetas disponibles: {availableLabels}",
  variable_not_found:
    "Variable '{name}' no encontrada. Variables disponibles: {availableVariables}",
  unknown_arithmetic_operator: "Operador aritmético desconocido '{op}'",
  unknown_relational_operator: "Operador relacional desconocido '{op}'",
  invalid_operand_type: "Tipo de operando inválido: {operand}",
  variable_not_defined: "¡Variable '{operand}' no ha sido definida aún!",
  array_read_out_of_bounds:
    "Lectura de array fuera de límites en el índice '{index}'",
  array_write_out_of_bounds:
    "Escritura en array fuera de límites en el índice '{index}'",
  array_missing_value:
    "La lectura del array dinámico no encontró valor en el índice '{index}'",
  incompatible_assignment:
    "No se puede asignar un valor {sourceType} a la variable {targetType} '{variableName}'.",
};

export default interpreter;
