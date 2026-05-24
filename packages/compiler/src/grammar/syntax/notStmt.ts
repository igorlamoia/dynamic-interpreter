import { ExprResult, TokenIterator } from "../../token/TokenIterator";
import { TOKENS } from "../../token/constants";
import { relationalStmt } from "./relationalStmt";

/**
 * Parses a logical NOT or relational expression.
 *
 * @derivation `<not> -> ! <not> | <rel>`
 */
export function notStmt(iterator: TokenIterator): ExprResult {
  const { logical_not } = TOKENS.LOGICALS;

  if (iterator.match(logical_not)) {
    const token = iterator.consume(logical_not);

    const inner = notStmt(iterator); // chamada recursiva
    const temp = iterator.emitter.newTemp();

    iterator.emitter.emitFromToken("!", temp, inner.place, null, token);
    iterator.registerTemp(temp, "bool");
    return iterator.createExprResult(temp, "bool", token);
  }

  return relationalStmt(iterator); // fallback: expressão relacional
}

// Example: !a
// { op: "!", result: "__temp0", operand1: "a", operand2: null }
// Example recursão aninhada: !!x
// { op: "!", result: "__temp0", operand1: "x", operand2: null }
// { op: "!", result: "__temp1", operand1: "__temp0", operand2: null }
