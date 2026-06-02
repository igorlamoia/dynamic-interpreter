import { TOKENS } from "../../token/constants";
import { ExprResult, TokenIterator } from "../../token/TokenIterator";
import { addStmt } from "./addStmt";

/**
 * Parses the rest of the relational statement by calling addStmt
 * or does nothing.
 *
 * @derivation `<restoRel> -> '==' <add> | '!=' <add> | '<' <add> | '<=' <add> | '>' <add> | '>=' <add> | &`
 */
export function restRelationalStmt(
  iterator: TokenIterator,
  inherited: ExprResult,
): ExprResult {
  const token = iterator.peek();
  const operator = TOKENS.RELATIONAL_SYMBOLS[token.type] ?? null;
  if (operator) {
    iterator.consume(token.type);
    const right = addStmt(iterator);
    const temp = iterator.emitter.newTemp();
    iterator.emitter.emitFromToken(
      operator,
      temp,
      inherited.place,
      right.place,
      token,
    );
    iterator.registerTemp(temp, "bool");
    return iterator.createExprResult(temp, "bool", token);
  }
  return inherited;
}
