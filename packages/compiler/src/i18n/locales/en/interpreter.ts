const interpreter = {
  label_defined_multiple_times: "Label '{labelName}' defined more than once!",
  no_main_function: "No 'main' function found!",
  arithmetic_requires_numeric:
    "Arithmetic operation '{op}' requires numeric operands. between '{val1}' and '{val2}'",
  unary_arithmetic_requires_numeric:
    "Unary arithmetic operation '{op}' requires a numeric operand. Received '{val1}'",
  invalid_unary_operator: "Invalid unary arithmetic operator '{op}'",
  unary_operation_requires_numeric:
    "Unary operation '{op}' requires numeric operand. Received '{val1}'",
  if_requires_labels:
    "IF requires label names as operand1/operand2. Received '{labelTrue}' and '{labelFalse}'",
  scan_requires_string_variable:
    "SCAN requires a string variable name as operand1. Received '{operand2}'",
  declare_requires_string:
    "DECLARE requires a string variable name as result. Received '{result}'",
  unknown_operation:
    "Unknown operation '{op}' at Instruction Pointer = {instructionPointer}",
  label_not_found:
    "Label '{label}' not found! Available labels: {availableLabels}",
  variable_not_found:
    "Variable '{name}' not found. Available variables: {availableVariables}",
  unknown_arithmetic_operator: "Unknown arithmetic operator '{op}'",
  unknown_relational_operator: "Unknown relational operator '{op}'",
  invalid_operand_type: "Invalid operand type: {operand}",
  variable_not_defined: "Variable '{operand}' has not been defined yet!",
  incompatible_assignment:
    "Cannot assign a value of type {sourceType} to {targetType} variable '{variableName}'.",
  array_read_out_of_bounds: "Array read out of bounds at index '{index}'",
  array_write_out_of_bounds: "Array write out of bounds at index '{index}'",
  array_missing_value: "Dynamic array read found no value at index '{index}'",
};

export default interpreter;
