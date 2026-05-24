import { ExprResult, TokenIterator } from "../../token/TokenIterator";
import { TOKENS } from "../../token/constants";
import { multStmt } from "./multStmt";

/**
 * Parses the rest of an addition/subtraction chain.
 * Emits code and returns the final result variable.
 *
 * @param iterator Token stream
 * @param emitter Code emitter
 * @param inherited The left-hand value
 */
export function restAddStmt(
  iterator: TokenIterator,
  inherited: ExprResult,
): ExprResult {
  const { plus, minus } = TOKENS.ARITHMETICS;

  while ([minus, plus].includes(iterator.peek().type)) {
    const token = iterator.peek();
    const op: "+" | "-" = token.type === plus ? "+" : "-";
    iterator.consume(token.type); // consume '+' or '-'
    const right = multStmt(iterator);
    const temp = iterator.emitter.newTemp();
    iterator.emitter.emitFromToken(op, temp, inherited.place, right.place, token);
    const type = iterator.mergeArithmeticTypes(inherited.type, right.type);
    iterator.registerTemp(temp, type);
    inherited = iterator.createExprResult(temp, type, token);
  }

  return inherited;
}

// Example: 2 + 3 - 4
// Results:
// { op: "+", result: "__temp0", operand1: "2", operand2: "3" }
// { op: "-", result: "__temp1", operand1: "__temp0", operand2: "4" }
