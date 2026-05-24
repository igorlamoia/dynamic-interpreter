import { ScanHint } from "../../interpreter/constants";
import { TOKENS } from "../../token/constants";
import { TokenIterator } from "../../token/TokenIterator";
import {
  emitAssignmentFromValue,
  parseAssignmentTarget,
} from "./attributeStmt";
import { argumentListStmt } from "./argumentListStmt";
import { consumeStmtTerminator } from "./statementTerminator";

const { RESERVEDS, SYMBOLS, LITERALS } = TOKENS;

/**
 * Parses a print statement: `print(<expr> { ',' <expr> });`
 *
 * @derivation `<printStmt> -> 'print' '(' <argList> ')' ';'`
 */
export function printStmt(iterator: TokenIterator): void {
  const printToken = iterator.consume(RESERVEDS.print);
  iterator.consume(SYMBOLS.left_paren);

  const values = argumentListStmt(iterator);

  for (const val of values) {
    // Heurística simples: se for aspas, é string; se número, também é literal
    if (val.place.startsWith('"') || !isNaN(Number(val.place))) {
      iterator.emitter.emitFromToken(
        "CALL",
        "PRINT",
        val.place,
        null,
        printToken,
      );
    } else {
      iterator.emitter.emitFromToken(
        "CALL",
        "PRINT",
        null,
        val.place,
        printToken,
      ); // identificador
    }
  }

  iterator.consume(SYMBOLS.right_paren);
  consumeStmtTerminator(iterator);
}

/**
 * Parses a scan statement:
 * - typed mode: `scan(<type-or-format>, <ident>);`
 * - untyped mode: `scan(<ident>);`
 *
 * @derivation `<scanStmt> -> 'scan' '(' (<type-or-format> ',' )? 'IDENT' ')' ';'`
 */
export function scanStmt(iterator: TokenIterator): void {
  const scanToken = iterator.consume(RESERVEDS.scan);
  iterator.consume(SYMBOLS.left_paren);

  const typingMode = iterator.getTypingMode();
  let hint: ScanHint = null;
  const target =
    typingMode === "untyped"
      ? parseAssignmentTarget(iterator)
      : (() => {
          hint = parseScanHint(iterator);
          iterator.consume(SYMBOLS.comma);
          return parseAssignmentTarget(iterator);
        })();

  if (hint === "float") {
    iterator.warnIfLossyIntConversion(target.type, "float", target.token);
  }

  iterator.consume(SYMBOLS.right_paren);
  consumeStmtTerminator(iterator);

  if (target.kind === "scalar") {
    iterator.emitter.emitFromToken("CALL", "SCAN", hint, target.name, scanToken);
    return;
  }

  const temp = iterator.emitter.newTemp();
  iterator.registerTemp(temp, target.type);
  iterator.emitter.emitFromToken("CALL", "SCAN", hint, temp, scanToken);
  emitAssignmentFromValue(
    iterator,
    target,
    temp,
    target.type,
    target.token,
    scanToken,
  );
}

function parseScanHint(iterator: TokenIterator): ScanHint {
  const token = iterator.peek();

  if (token.type === RESERVEDS.int || token.type === RESERVEDS.float) {
    iterator.consume(token.type);
    const semanticType = iterator.mapTokenTypeToSemanticType(token.type);
    if (semanticType === "int" || semanticType === "float") {
      return semanticType;
    }
  }

  if (token.type === LITERALS.string_literal) {
    const literal = iterator.consume(LITERALS.string_literal).lexeme;
    if (literal === '"%d"') return "int";
    if (literal === '"%f"') return "float";
  }

  iterator.throwError("grammar.unexpected_type", token.line, token.column, {
    lexeme: token.lexeme,
    line: token.line,
    column: token.column,
  });
}
