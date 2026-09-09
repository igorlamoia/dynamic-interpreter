const grammar = {
  unexpected_statement: "Unexpected statement: {lexeme}",
  unexpected_type:
    'Unexpected type "{lexeme}" at line {line}, column {column}.',
  unexpected_token:
    'Unexpected token "{lexeme}" at line {line}, column {column}.',
  break_outside_loop: "break statement outside loop or switch",
  continue_outside_loop: "continue statement outside loop",
  invalid_assignment_operator:
    'Invalid assignment operator "{lexeme}" at line {line}, column {column}.',
  unexpected_output_token: "Unexpected output token: {lexeme}",
  invalid_unary_increment:
    'Invalid unary increment usage "{lexeme}" at line {line}, column {column}.',
  case_outside_switch: "case statement outside switch",
  default_outside_switch: "default statement outside switch",
  duplicate_case_label: 'Duplicate case label "{lexeme}" in switch',
  invalid_case_literal:
    'Invalid case literal "{lexeme}". Only int and string literals are allowed.',
  lossy_int_conversion:
    "Possible lossy conversion from {sourceType} to {targetType}.",
  incompatible_type_conversion:
    "Incompatible conversion from {sourceType} to {targetType}.",
};

export default grammar;
