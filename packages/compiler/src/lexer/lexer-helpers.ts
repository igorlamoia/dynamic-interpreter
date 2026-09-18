export function isDigit(c: string): boolean {
  return c >= "0" && c <= "9";
}

export function isHexDigit(c: string): boolean {
  return isDigit(c) || (c >= "A" && c <= "F");
}

export function isOctalDigit(c: string): boolean {
  return c >= "0" && c <= "7";
}

export function isAlpha(c: string): boolean {
  return (
    (c >= "a" && c <= "z") ||
    (c >= "A" && c <= "Z") ||
    c === "ç" ||
    c === "Ç"
  );
}

export function isIdentifierStart(c: string): boolean {
  return isAlpha(c) || c === "_";
}

export function isIdentifierPart(c: string): boolean {
  return isIdentifierStart(c) || isDigit(c);
}

export function isAlphaNumeric(c: string): boolean {
  return isIdentifierStart(c) || isDigit(c);
}

export function isWhitespace(c: string): boolean {
  return c === " " || c === "\r" || c === "\t";
}

export function isIndentationWhitespace(c: string): boolean {
  return c === " " || c === "\t";
}
