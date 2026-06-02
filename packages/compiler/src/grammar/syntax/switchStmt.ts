import { TOKENS } from "../../token/constants";
import { TokenIterator } from "../../token/TokenIterator";
import { exprStmt } from "./exprStmt";
import { stmt } from "./stmt";

type CaseEntry = {
  literal: string;
  label: string;
  caseToken: { line: number; column: number };
  literalToken: { line: number; column: number };
};

/**
 * Parses a switch statement with C-style fallthrough semantics.
 * Handles both brace-delimited and indentation-based blocks.
 *
 * @derivation `<switchStmt> -> 'switch' '(' <expr> ')' ('{' { 'case' <caseLiteral> ':' <stmtList> } [ 'default' ':' <stmtList> ] '}' | ':' NEWLINE INDENT { 'case' <caseLiteral> ':' <stmtList> } [ 'default' ':' <stmtList> ] DEDENT)`
 */
export function switchStmt(iterator: TokenIterator): void {
  const { RESERVEDS, SYMBOLS, LITERALS } = TOKENS;
  const blockMode = iterator.getBlockMode();

  const switchToken = iterator.consume(RESERVEDS.switch);
  iterator.consume(SYMBOLS.left_paren);
  const switchValue = exprStmt(iterator);
  iterator.consume(SYMBOLS.right_paren);

  // Handle block start based on mode
  if (blockMode === "indentation") {
    iterator.consume(SYMBOLS.colon);
    if (iterator.peek().type === SYMBOLS.newline) {
      iterator.consume(SYMBOLS.newline);
    }
    iterator.consume(SYMBOLS.indent);
  } else {
    iterator.consume(SYMBOLS.left_brace);
  }

  const dispatchLabel = iterator.emitter.newLabel();
  const switchEndLabel = iterator.emitter.newLabel();
  const afterSwitchLabel = iterator.emitter.newLabel();

  const seenCaseLiterals = new Set<string>();
  const cases: CaseEntry[] = [];
  let defaultLabel: string | null = null;

  // Skip case bodies first; dispatch will jump back to matching labels.
  iterator.emitter.emitFromToken("JUMP", dispatchLabel, null, null, switchToken);
  iterator.pushSwitchContext(switchEndLabel);

  // Check for block end based on mode
  const isBlockEnd = () =>
    blockMode === "indentation"
      ? iterator.match(SYMBOLS.dedent)
      : iterator.match(SYMBOLS.right_brace);

  while (!isBlockEnd()) {
    if (iterator.match(RESERVEDS.case)) {
      const caseToken = iterator.consume(RESERVEDS.case);
      const token = iterator.peek();
      if (
        token.type !== LITERALS.integer_literal &&
        token.type !== LITERALS.hex_literal &&
        token.type !== LITERALS.octal_literal &&
        token.type !== LITERALS.string_literal
      ) {
        iterator.throwError(
          "grammar.invalid_case_literal",
          token.line,
          token.column,
          {
            lexeme: token.lexeme,
          },
        );
      }

      const literalToken = iterator.consume(token.type);
      const normalizedLiteral = normalizeCaseLiteral(literalToken);
      if (seenCaseLiterals.has(normalizedLiteral)) {
        iterator.throwError(
          "grammar.duplicate_case_label",
          literalToken.line,
          literalToken.column,
          {
            lexeme: literalToken.lexeme,
          },
        );
      }
      seenCaseLiterals.add(normalizedLiteral);

      iterator.consume(SYMBOLS.colon);

      // In indentation mode, handle the indented block
      if (blockMode === "indentation") {
        if (iterator.peek().type === SYMBOLS.newline) {
          iterator.consume(SYMBOLS.newline);
        }
        // Check if there's an INDENT (case has a body)
        if (iterator.peek().type === SYMBOLS.indent) {
          iterator.consume(SYMBOLS.indent);
          const caseLabel = iterator.emitter.newLabel();
          cases.push({
            literal: literalToken.lexeme,
            label: caseLabel,
            caseToken,
            literalToken,
          });
          iterator.emitter.emitFromToken(
            "LABEL",
            caseLabel,
            null,
            null,
            caseToken,
          );
          parseSwitchSectionBody(iterator);
          iterator.consume(SYMBOLS.dedent);
        } else {
          // Empty case (fallthrough), just add the label
          const caseLabel = iterator.emitter.newLabel();
          cases.push({
            literal: literalToken.lexeme,
            label: caseLabel,
            caseToken,
            literalToken,
          });
          iterator.emitter.emitFromToken(
            "LABEL",
            caseLabel,
            null,
            null,
            caseToken,
          );
        }
      } else {
        const caseLabel = iterator.emitter.newLabel();
        cases.push({
          literal: literalToken.lexeme,
          label: caseLabel,
          caseToken,
          literalToken,
        });
        iterator.emitter.emitFromToken(
          "LABEL",
          caseLabel,
          null,
          null,
          caseToken,
        );
        parseSwitchSectionBody(iterator);
      }
      continue;
    }

    if (iterator.match(RESERVEDS.default)) {
      const defaultToken = iterator.consume(RESERVEDS.default);
      if (defaultLabel) {
        iterator.throwError(
          "grammar.duplicate_case_label",
          defaultToken.line,
          defaultToken.column,
          {
            lexeme: defaultToken.lexeme,
          },
        );
      }

      iterator.consume(SYMBOLS.colon);

      // In indentation mode, handle the indented block
      if (blockMode === "indentation") {
        if (iterator.peek().type === SYMBOLS.newline) {
          iterator.consume(SYMBOLS.newline);
        }
        // Check if there's an INDENT (default has a body)
        if (iterator.peek().type === SYMBOLS.indent) {
          iterator.consume(SYMBOLS.indent);
          defaultLabel = iterator.emitter.newLabel();
          iterator.emitter.emitFromToken(
            "LABEL",
            defaultLabel,
            null,
            null,
            defaultToken,
          );
          parseSwitchSectionBody(iterator);
          iterator.consume(SYMBOLS.dedent);
        } else {
          // Empty default (shouldn't happen, but handle it)
          defaultLabel = iterator.emitter.newLabel();
          iterator.emitter.emitFromToken(
            "LABEL",
            defaultLabel,
            null,
            null,
            defaultToken,
          );
        }
      } else {
        defaultLabel = iterator.emitter.newLabel();
        iterator.emitter.emitFromToken(
          "LABEL",
          defaultLabel,
          null,
          null,
          defaultToken,
        );
        parseSwitchSectionBody(iterator);
      }
      continue;
    }

    const token = iterator.peek();
    iterator.throwError("grammar.unexpected_token", token.line, token.column, {
      lexeme: token.lexeme,
      line: token.line,
      column: token.column,
    });
  }

  // Handle block end based on mode
  if (blockMode === "indentation") {
    iterator.consume(SYMBOLS.dedent);
  } else {
    iterator.consume(SYMBOLS.right_brace);
  }

  iterator.popSwitchContext();

  iterator.emitter.emitFromToken("LABEL", switchEndLabel, null, null, switchToken);
  iterator.emitter.emitFromToken("JUMP", afterSwitchLabel, null, null, switchToken);

  iterator.emitter.emitFromToken("LABEL", dispatchLabel, null, null, switchToken);
  emitSwitchDispatch(
    iterator,
    switchValue.place,
    cases,
    defaultLabel,
    switchEndLabel,
    switchToken,
  );
  iterator.emitter.emitFromToken("LABEL", afterSwitchLabel, null, null, switchToken);
}

function parseSwitchSectionBody(iterator: TokenIterator): void {
  const { RESERVEDS, SYMBOLS } = TOKENS;
  while (iterator.hasNext()) {
    if (
      iterator.match(SYMBOLS.right_brace) ||
      iterator.match(SYMBOLS.dedent) ||
      iterator.match(RESERVEDS.case) ||
      iterator.match(RESERVEDS.default)
    ) {
      return;
    }
    stmt(iterator);
  }
}

function emitSwitchDispatch(
  iterator: TokenIterator,
  switchValue: string,
  cases: CaseEntry[],
  defaultLabel: string | null,
  switchEndLabel: string,
  switchToken: { line: number; column: number },
): void {
  if (cases.length === 0) {
    iterator.emitter.emitFromToken(
      "JUMP",
      defaultLabel ?? switchEndLabel,
      null,
      null,
      switchToken,
    );
    return;
  }

  for (let idx = 0; idx < cases.length; idx++) {
    const current = cases[idx];
    const isLast = idx === cases.length - 1;
    const falseLabel = isLast
      ? (defaultLabel ?? switchEndLabel)
      : iterator.emitter.newLabel();

    const equalsTemp = iterator.emitter.newTemp();
    iterator.emitter.emitFromToken(
      "==",
      equalsTemp,
      switchValue,
      current.literal,
      current.literalToken,
    );
    iterator.emitter.emitFromToken(
      "IF",
      equalsTemp,
      current.label,
      falseLabel,
      current.caseToken,
    );

    if (!isLast) {
      iterator.emitter.emitFromToken(
        "LABEL",
        falseLabel,
        null,
        null,
        current.caseToken,
      );
    }
  }
}

function normalizeCaseLiteral(token: { type: number; lexeme: string }): string {
  const { LITERALS } = TOKENS;
  if (token.type === LITERALS.string_literal) {
    return `str:${token.lexeme}`;
  }

  if (token.type === LITERALS.integer_literal) {
    return `num:${Number.parseInt(token.lexeme, 10)}`;
  }

  if (token.type === LITERALS.hex_literal) {
    return `num:${Number.parseInt(token.lexeme, 16)}`;
  }

  if (token.type === LITERALS.octal_literal) {
    return `num:${Number.parseInt(token.lexeme, 8)}`;
  }

  return token.lexeme;
}
