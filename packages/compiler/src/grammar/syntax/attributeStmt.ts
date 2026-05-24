import { TOKENS } from "../../token/constants";
import { Token } from "../../token";
import { TokenIterator, ValueType } from "../../token/TokenIterator";
import { exprStmt } from "./exprStmt";
import { assertTypedAssignableIdentifier } from "./typedIdentifier";

export type AssignmentTarget =
  | {
      kind: "scalar";
      name: string;
      type: ValueType;
      token: Token;
    }
  | {
      kind: "array";
      name: string;
      type: ValueType;
      token: Token;
      indexes: string[];
    };
/**
 * Processes an attribute statement by first parsing an identifier token,
 *  and then call the expression statement.
 *
 * @derivation `<atrib> -> 'IDENT' '=' <expr> | 'IDENT' '+=' <expr> | 'IDENT' '-=' <expr> | 'IDENT' '\*=' <expr> | 'IDENT' '/=' <expr> | 'IDENT' '%=' <expr>`
 */
export function attributeStmt(iterator: TokenIterator): void {
  const { plus } = TOKENS.ARITHMETICS;

  // Prefix increment statement: ++identifier
  if (iterator.peek().type === plus && iterator.peek().lexeme === "++") {
    iterator.consume(plus, "++");
    const identifier = iterator.consume(TOKENS.LITERALS.identifier);
    assertTypedAssignableIdentifier(iterator, identifier);
    const incremented = iterator.emitter.newTemp();
    iterator.emitter.emit("+", incremented, identifier.lexeme, "1");
    iterator.registerTemp(incremented, iterator.resolveSymbol(identifier.lexeme));
    iterator.emitter.emitFromToken(
      "=",
      identifier.lexeme,
      incremented,
      null,
      identifier,
    );
    return;
  }

  const target = parseAssignmentTarget(iterator);

  // Postfix increment statement: identifier++
  if (iterator.peek().type === plus && iterator.peek().lexeme === "++") {
    if (target.kind !== "scalar") {
      iterator.throwError(
        "grammar.invalid_assignment_operator",
        target.token.line,
        target.token.column,
        { lexeme: target.name, line: target.token.line, column: target.token.column },
      );
    }
    iterator.consume(plus, "++");
    const incremented = iterator.emitter.newTemp();
    iterator.emitter.emit("+", incremented, target.name, "1");
    iterator.registerTemp(incremented, iterator.resolveSymbol(target.name));
    iterator.emitter.emitFromToken(
      "=",
      target.name,
      incremented,
      null,
      target.token,
    );
    return;
  }

  if (!Object.values(TOKENS.ASSIGNMENTS).includes(iterator.peek().type))
    iterator.throwError(
      "grammar.invalid_assignment_operator",
      target.token.line,
      target.token.column,
      { lexeme: target.name, line: target.token.line, column: target.token.column },
    );
  const assignmentType = iterator.peek().type;
  iterator.consume(assignmentType);
  emitAssignment(iterator, target, assignmentType);
}

export function emitAssignmentChain(
  iterator: TokenIterator,
  firstTarget: string,
  firstTargetToken?: Token,
  firstAssignmentType: number = TOKENS.ASSIGNMENTS.equal,
): void {
  const { equal } = TOKENS.ASSIGNMENTS;
  const targets: Array<{ name: string; token?: Token }> = [
    { name: firstTarget, token: firstTargetToken },
  ];

  // Right-associative chain: a = b = c = expr
  // After the first '=', keep consuming IDENT '=' pairs.
  if (firstAssignmentType === equal) {
    while (iterator.peek().type === TOKENS.LITERALS.identifier) {
      const nextToken = iterator.peekAt(1);
      if (!nextToken || nextToken.type !== equal) break;
      const nextTarget = iterator.consume(TOKENS.LITERALS.identifier);
      iterator.consume(equal);
      targets.push({ name: nextTarget.lexeme, token: nextTarget });
    }
  }

  const value = exprStmt(iterator);
  let currentValue = value;

  for (let i = targets.length - 1; i >= 0; i--) {
    const targetDescriptor = iterator.resolveSymbolDescriptor(targets[i].name);
    if (iterator.getTypingMode() === "typed" && targetDescriptor.kind === "scalar" && targetDescriptor.type === "unknown") {
      const targetToken = targets[i].token ?? value.token;
      iterator.throwError(
        "grammar.unexpected_statement",
        targetToken.line,
        targetToken.column,
        { lexeme: targets[i].name },
      );
    }

    const targetType = iterator.resolveSymbol(targets[i].name);
    iterator.warnIfLossyIntConversion(
      targetType,
      currentValue.type,
      currentValue.token,
    );
    iterator.emitter.emitFromToken(
      "=",
      targets[i].name,
      currentValue.place,
      null,
      targets[i].token,
    );
    currentValue = iterator.createExprResult(
      targets[i].name,
      targetType,
      currentValue.token,
    );
  }
}

export function parseAssignmentTarget(
  iterator: TokenIterator,
  firstToken?: Token,
): AssignmentTarget {
  const token = firstToken ?? iterator.consume(TOKENS.LITERALS.identifier);
  const descriptor = iterator.resolveSymbolDescriptor(token.lexeme);

  if (!iterator.match(TOKENS.SYMBOLS.left_bracket)) {
    assertTypedAssignableIdentifier(iterator, token);
    return {
      kind: "scalar",
      name: token.lexeme,
      type: iterator.resolveSymbol(token.lexeme),
      token,
    };
  }

  if (descriptor.kind !== "array") {
    iterator.throwError(
      "grammar.invalid_assignment_operator",
      token.line,
      token.column,
      { lexeme: token.lexeme, line: token.line, column: token.column },
    );
  }

  const indexes: string[] = [];
  while (iterator.match(TOKENS.SYMBOLS.left_bracket)) {
    iterator.consume(TOKENS.SYMBOLS.left_bracket);
    const indexExpr = exprStmt(iterator);
    if (!iterator.isIndexType(indexExpr.type)) {
      iterator.throwError(
        "grammar.unexpected_type",
        indexExpr.token.line,
        indexExpr.token.column,
        {
          lexeme: indexExpr.token.lexeme,
          line: indexExpr.token.line,
          column: indexExpr.token.column,
        },
      );
    }
    iterator.consume(TOKENS.SYMBOLS.right_bracket);
    indexes.push(indexExpr.place);
  }

  const hasValidDimensions =
    descriptor.arrayMode === "dynamic"
      ? indexes.length >= descriptor.dimensions
      : indexes.length === descriptor.dimensions;

  if (!hasValidDimensions) {
    iterator.throwError(
      "grammar.invalid_assignment_operator",
      token.line,
      token.column,
      { lexeme: token.lexeme, line: token.line, column: token.column },
    );
  }

  return {
    kind: "array",
    name: token.lexeme,
    type: descriptor.baseType,
    token,
    indexes,
  };
}

export function emitAssignment(
  iterator: TokenIterator,
  target: AssignmentTarget,
  firstAssignmentType: number = TOKENS.ASSIGNMENTS.equal,
): void {
  if (target.kind === "scalar") {
    emitAssignmentChain(iterator, target.name, target.token, firstAssignmentType);
    return;
  }

  const value = exprStmt(iterator);
  emitAssignmentFromValue(iterator, target, value.place, value.type, value.token);
}

export function emitAssignmentFromValue(
  iterator: TokenIterator,
  target: AssignmentTarget,
  valuePlace: string,
  valueType: ValueType,
  token: Token,
  sourceToken: Token = target.token,
): void {
  if (target.kind === "scalar") {
    iterator.warnIfLossyIntConversion(target.type, valueType, token);
    iterator.emitter.emitFromToken("=", target.name, valuePlace, null, sourceToken);
    return;
  }

  assertAssignable(iterator, target.type, valueType, token);
  iterator.warnIfLossyIntConversion(target.type, valueType, token);
  iterator.emitter.emitFromToken(
    "ARRAY_SET" as never,
    target.name,
    target.indexes,
    valuePlace,
    sourceToken,
  );
}

function assertAssignable(
  iterator: TokenIterator,
  targetType: ValueType,
  sourceType: ValueType,
  token: Token,
): void {
  if (targetType === "dynamic" || sourceType === "dynamic" || sourceType === "unknown") {
    return;
  }
  if (targetType === sourceType) {
    return;
  }
  if (targetType === "float" && sourceType === "int") {
    return;
  }
  if (targetType === "int" && sourceType === "float") {
    return;
  }

  iterator.throwError("grammar.unexpected_type", token.line, token.column, {
    lexeme: token.lexeme,
    line: token.line,
    column: token.column,
  });
}
