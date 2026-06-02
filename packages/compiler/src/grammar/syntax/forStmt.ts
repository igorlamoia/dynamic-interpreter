import { TokenIterator } from "../../token/TokenIterator";
import { TOKENS } from "../../token/constants";
import { optAttributeStmt } from "./optAttributeStmt";
import { optExprStmt } from "./optExprStmt";
import { stmt } from "./stmt";
import { declarationStmtWithoutTerminator } from "./declarationStmt";

/**
 * Parses a `for` loop and emits control flow instructions.
 *
 * @derivation `<forStmt> -> for '(' <optAtrib> ';' <optExpr> ';' <optAtrib> ')' <stmt>`
 */
export function forStmt(iterator: TokenIterator): void {
  const { left_paren, right_paren, semicolon } = TOKENS.SYMBOLS;

  const forToken = iterator.consume(TOKENS.RESERVEDS.for);
  iterator.consume(left_paren);

  // (1) Init
  if (isTypedDeclarationStart(iterator)) {
    declarationStmtWithoutTerminator(iterator);
  } else {
    optAttributeStmt(iterator);
  }
  iterator.consume(semicolon, ";");

  const labelStart = iterator.emitter.newLabel();
  const labelBody = iterator.emitter.newLabel();
  const labelIncrement = iterator.emitter.newLabel();
  const labelEnd = iterator.emitter.newLabel();

  iterator.emitter.emitFromToken("LABEL", labelStart, null, null, forToken);

  // (2) Cond
  const conditionResult = optExprStmt(iterator);
  iterator.consume(semicolon, ";");

  if (conditionResult !== null) {
    iterator.emitter.emitFromToken(
      "IF",
      conditionResult.place,
      labelBody,
      labelEnd,
      forToken,
    );
  } else {
    iterator.emitter.emitFromToken("JUMP", labelBody, null, null, forToken);
  }

  // (3) Incremento — ANTES de consumir o ')'
  iterator.emitter.emitFromToken("LABEL", labelIncrement, null, null, forToken);
  optAttributeStmt(iterator);
  iterator.emitter.emitFromToken("JUMP", labelStart, null, null, forToken);

  iterator.consume(right_paren); // ✅ depois do incremento

  // (4) Corpo
  iterator.emitter.emitFromToken("LABEL", labelBody, null, null, forToken);

  // Push loop context for break/continue
  iterator.pushLoopContext(labelEnd, labelIncrement);

  stmt(iterator);

  // Pop loop context
  iterator.popLoopContext();

  iterator.emitter.emitFromToken("JUMP", labelIncrement, null, null, forToken);

  // (5) Fim
  iterator.emitter.emitFromToken("LABEL", labelEnd, null, null, forToken);
}

function isTypedDeclarationStart(iterator: TokenIterator): boolean {
  if (iterator.getTypingMode() !== "typed") {
    return false;
  }

  const tokenType = iterator.peek().type;
  return [
    TOKENS.RESERVEDS.int,
    TOKENS.RESERVEDS.float,
    TOKENS.RESERVEDS.bool,
    TOKENS.RESERVEDS.string,
  ].includes(tokenType);
}
