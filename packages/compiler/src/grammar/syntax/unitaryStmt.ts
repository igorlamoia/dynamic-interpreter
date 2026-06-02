import { ExprResult, TokenIterator } from "../../token/TokenIterator";
import { TOKENS } from "../../token/constants";
import { factorStmt } from "./factorStmt";
import { TUnaryArithmetics } from "../../interpreter/constants";
import { assertTypedAssignableIdentifier } from "./typedIdentifier";

/**
 * Parses a unary expression or factor.
 * Emits code when needed and returns the result.
 *
 * @returns A variable, literal or temporary name
 */
export function unitaryStmt(iterator: TokenIterator): ExprResult {
  const token = iterator.peek();
  const { minus, plus } = TOKENS.ARITHMETICS;

  // Prefix increment: ++identifier
  if (token.type === plus && token.lexeme === "++") {
    const operatorToken = iterator.consume(plus, "++");
    const identifier = iterator.consume(TOKENS.LITERALS.identifier);
    assertTypedAssignableIdentifier(iterator, identifier);
    const incremented = iterator.emitter.newTemp();
    iterator.emitter.emitFromToken(
      "+",
      incremented,
      identifier.lexeme,
      "1",
      operatorToken,
    );
    iterator.emitter.emitFromToken(
      "=",
      identifier.lexeme,
      incremented,
      null,
      identifier,
    );
    const type = iterator.resolveSymbol(identifier.lexeme);
    iterator.registerTemp(incremented, type);
    return iterator.createExprResult(incremented, type, identifier);
  }

  if (token.type === plus || token.type === minus) {
    if (token.lexeme === "++") {
      iterator.throwError(
        "grammar.invalid_unary_increment",
        token.line,
        token.column,
        { lexeme: token.lexeme, line: token.line, column: token.column },
      );
    }
    const operator = token.type === plus ? "unary+" : "unary-";
    iterator.consume(token.type);

    const value = unitaryStmt(iterator);
    const temp = iterator.emitter.newTemp();
    iterator.emitter.emitFromToken(
      operator as TUnaryArithmetics,
      temp,
      value.place,
      null,
      token,
    );
    iterator.registerTemp(temp, value.type);
    return iterator.createExprResult(temp, value.type, token);
  }

  return factorStmt(iterator); // no operador unário: delega ao fator
}

// Example: -x
// { op: "unary-", result: "__temp0", operand1: "x", operand2: null }
// Example: -(-a)
// { op: "unary-", result: "__temp0", operand1: "a", operand2: null }
// { op: "unary-", result: "__temp1", operand1: "__temp0", operand2: null }
