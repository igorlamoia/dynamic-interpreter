import { ExprResult, TokenIterator } from "../../token/TokenIterator";
import { TOKENS } from "../../token/constants";
import { unitaryStmt } from "./unitaryStmt";
import { TArithmetics } from "../../interpreter/constants";

/**
 * Parses the rest of a multiplication/division/modulo chain.
 * Emits intermediate code and returns the result.
 *
 * @param iterator The token iterator
 * @param emitter The instruction emitter
 * @param inherited The left-hand value to chain
 * @returns Final result as variable/literal/temp
 */
export function restMultStmt(
  iterator: TokenIterator,
  inherited: ExprResult,
): ExprResult {
  const { star, slash, modulo } = TOKENS.ARITHMETICS;

  while (true) {
    const token = iterator.peek();
    let op: TArithmetics | null = null;

    if (token.type === star) op = "*";
    else if (token.type === slash) op = "/";
    else if (token.type === modulo) op = "%";

    if (!op) break;

    iterator.consume(token.type); // consume '*', '/', '%'
    const right = unitaryStmt(iterator);
    const temp = iterator.emitter.newTemp();
    iterator.emitter.emitFromToken(op, temp, inherited.place, right.place, token);
    const type = iterator.mergeArithmeticTypes(inherited.type, right.type);
    iterator.registerTemp(temp, type);
    inherited = iterator.createExprResult(temp, type, token);
  }

  return inherited;
}

// Example: a * b / c % d
// Results:
// { op: "*", result: "__temp0", operand1: "a", operand2: "b" }
// { op: "/", result: "__temp1", operand1: "__temp0", operand2: "c" }
// { op: "%", result: "__temp2", operand1: "__temp1", operand2: "d" }
