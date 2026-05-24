import { TokenIterator } from "../../token/TokenIterator";
import { TOKENS } from "../../token/constants";
import { exprStmt } from "./exprStmt";
import { stmt } from "./stmt";

/**
 * Parses a while-loop and emits control flow instructions.
 *
 * @derivation `<whileStmt> → while '(' <expr> ')' <stmt>`
 */
export function whileStmt(iterator: TokenIterator): void {
  const whileToken = iterator.consume(TOKENS.RESERVEDS.while);
  iterator.consume(TOKENS.SYMBOLS.left_paren);

  const labelStart = iterator.emitter.newLabel(); // Início do laço
  const labelBody = iterator.emitter.newLabel(); // Onde executa o corpo
  const labelEnd = iterator.emitter.newLabel(); // Fim do laço

  iterator.emitter.emitFromToken("LABEL", labelStart, null, null, whileToken);

  const conditionResult = exprStmt(iterator); // condicional

  iterator.emitter.emitFromToken(
    "IF",
    conditionResult.place,
    labelBody,
    labelEnd,
    whileToken,
  );
  iterator.emitter.emitFromToken("LABEL", labelBody, null, null, whileToken);

  iterator.consume(TOKENS.SYMBOLS.right_paren);

  // Push loop context for break/continue
  iterator.pushLoopContext(labelEnd, labelStart);

  stmt(iterator); // corpo do laço

  // Pop loop context
  iterator.popLoopContext();

  iterator.emitter.emitFromToken("JUMP", labelStart, null, null, whileToken);
  iterator.emitter.emitFromToken("LABEL", labelEnd, null, null, whileToken);
}
