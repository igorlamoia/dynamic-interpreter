import { ExprResult, TokenIterator } from "../../token/TokenIterator";
import { TOKENS } from "../../token/constants";
import { andStmt } from "./andStmt";
/**
 * Parses the rest of a logical OR expression.
 * @returns The final result identifier or temp
 *
 * @derivation `<restoOr> -> '||' <and> <restoOr> | &`
 */
export function restOrStmt(
  iterator: TokenIterator,
  inherited: ExprResult,
): ExprResult {
  while (iterator.match(TOKENS.LOGICALS.logical_or)) {
    const token = iterator.consume(TOKENS.LOGICALS.logical_or);
    const right = andStmt(iterator);
    const temp = iterator.emitter.newTemp();

    iterator.emitter.emitFromToken(
      "||",
      temp,
      inherited.place,
      right.place,
      token,
    );
    iterator.registerTemp(temp, "bool");
    inherited = iterator.createExprResult(temp, "bool", token);
  }

  return inherited;
}

// Example: a || b || c
// Results:
// { op: "||", result: "__temp0", operand1: "a", operand2: "b" }
// { op: "||", result: "__temp1", operand1: "__temp0", operand2: "c" }
