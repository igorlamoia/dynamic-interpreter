import { TokenIterator } from "../../token/TokenIterator";
import { TOKENS } from "../../token/constants";

type ConsumeStmtTerminatorOptions = {
  forceRequired?: boolean;
};

export function consumeStmtTerminator(
  iterator: TokenIterator,
  options?: ConsumeStmtTerminatorOptions,
): void {
  const configuredTerminator = iterator.getStatementTerminatorLexeme();
  const expectedLexeme = configuredTerminator || undefined;

  if (iterator.match(TOKENS.SYMBOLS.semicolon)) {
    iterator.consume(TOKENS.SYMBOLS.semicolon);
    return;
  }

  const isRequired =
    options?.forceRequired || iterator.getSemicolonMode() === "required";
  if (isRequired) {
    iterator.consume(TOKENS.SYMBOLS.semicolon, expectedLexeme);
    return;
  }

  if (!iterator.hasNext()) {
    return;
  }

  const next = iterator.peek();
  if (next.type === TOKENS.SYMBOLS.right_brace) {
    return;
  }

  if (
    next.type === TOKENS.SYMBOLS.dedent ||
    next.type === TOKENS.SYMBOLS.newline
  ) {
    return;
  }

  const previous = iterator.peekAt(-1);
  if (previous && next.line > previous.line) {
    return;
  }

  iterator.consume(TOKENS.SYMBOLS.semicolon, expectedLexeme);
}
