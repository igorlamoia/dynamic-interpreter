import { TArithmetics } from "../../interpreter/constants";
import { Token } from "../../token";
import { TokenIterator } from "../../token/TokenIterator";
import { TOKENS } from "../../token/constants";
import { assertTypedAssignableIdentifier } from "./typedIdentifier";

export function isUpdateOperator(token: Token): boolean {
  return (
    (token.type === TOKENS.ARITHMETICS.plus && token.lexeme === "++") ||
    (token.type === TOKENS.ARITHMETICS.minus && token.lexeme === "--")
  );
}

export function updateOperatorToArithmetic(operatorToken: Token): TArithmetics {
  return operatorToken.lexeme === "--" ? "-" : "+";
}

export function emitUpdate(
  iterator: TokenIterator,
  identifier: Token,
  operatorToken: Token,
): string {
  assertTypedAssignableIdentifier(iterator, identifier);
  const updated = iterator.emitter.newTemp();
  const operator = updateOperatorToArithmetic(operatorToken);
  iterator.emitter.emitFromToken(
    operator,
    updated,
    identifier.lexeme,
    "1",
    operatorToken,
  );
  const type = iterator.resolveSymbol(identifier.lexeme);
  iterator.registerTemp(updated, type);
  iterator.emitter.emitFromToken(
    "=",
    identifier.lexeme,
    updated,
    null,
    identifier,
  );
  return updated;
}
