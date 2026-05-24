import { TokenIterator } from "../../token/TokenIterator";
import { TOKENS } from "../../token/constants";
import { exprStmt } from "./exprStmt";
import { stmt } from "./stmt";
import { elsePartStmt } from "./elsePartStmt";

/**
 * Parses an if-statement with optional else, and emits control flow instructions.
 *
 * @derivation `<ifStmt> → if '(' <expr> ')' <stmt> <elsePart>`
 */
export function ifStmt(iterator: TokenIterator): void {
  const ifToken = iterator.consume(TOKENS.RESERVEDS.if);
  iterator.consume(TOKENS.SYMBOLS.left_paren);

  const condResult = exprStmt(iterator); // resultado da condição

  iterator.consume(TOKENS.SYMBOLS.right_paren);

  const labelTrue = iterator.emitter.newLabel();
  const labelFalse = iterator.emitter.newLabel();
  const labelEnd = iterator.emitter.newLabel();

  // Gerar instrução condicional: IF condResult ? labelTrue : labelFalse
  iterator.emitter.emitFromToken(
    "IF",
    condResult.place,
    labelTrue,
    labelFalse,
    ifToken,
  );

  // Início do bloco "if"
  iterator.emitter.emitFromToken("LABEL", labelTrue, null, null, ifToken);
  stmt(iterator); // bloco do if

  // Pular o else após executar o if
  iterator.emitter.emitFromToken("JUMP", labelEnd, null, null, ifToken);

  // Início do bloco "else"
  iterator.emitter.emitFromToken("LABEL", labelFalse, null, null, ifToken);
  elsePartStmt(iterator); // bloco do else (se houver)

  // Label final
  iterator.emitter.emitFromToken("LABEL", labelEnd, null, null, ifToken);
}
