import { TokenIterator } from "../../token/TokenIterator";
import { TOKENS } from "../../token/constants";
import { consumeStmtTerminator } from "./statementTerminator";

/**
 * Parses a continue statement and emits a JUMP to the current loop's continue label.
 *
 * @derivation `continue ;`
 */
export function continueStmt(iterator: TokenIterator): void {
  const continueToken = iterator.consume(TOKENS.RESERVEDS.continue);
  consumeStmtTerminator(iterator);

  const continueLabel = iterator.getCurrentContinueLabel();
  if (!continueLabel) {
    iterator.throwError(
      "grammar.continue_outside_loop",
      continueToken.line,
      continueToken.column,
    );
  }

  iterator.emitter.emitFromToken("JUMP", continueLabel, null, null, continueToken);
}
