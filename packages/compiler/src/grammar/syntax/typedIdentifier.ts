import { Token } from "../../token";
import { TokenIterator } from "../../token/TokenIterator";

export function assertTypedAssignableIdentifier(
  iterator: TokenIterator,
  token: Token,
): void {
  assertTypedDeclaredIdentifier(iterator, token);
}

export function assertTypedReadableIdentifier(
  iterator: TokenIterator,
  token: Token,
): void {
  assertTypedDeclaredIdentifier(iterator, token);
}

function assertTypedDeclaredIdentifier(
  iterator: TokenIterator,
  token: Token,
): void {
  if (iterator.getTypingMode() !== "typed") {
    return;
  }

  const descriptor = iterator.resolveSymbolDescriptor(token.lexeme);
  if (descriptor.kind === "scalar" && descriptor.type === "unknown") {
    iterator.throwError(
      "grammar.unexpected_statement",
      token.line,
      token.column,
      { lexeme: token.lexeme },
    );
  }
}
