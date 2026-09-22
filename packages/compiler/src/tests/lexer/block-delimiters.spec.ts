import { describe, expect, it } from "vitest";
import { Lexer } from "../../lexer";
import { TOKENS } from "../../token/constants";

describe("Lexer Block Delimiters", () => {
  it("should map configured open/close words to brace token ids", () => {
    const source = `int main() begin print("ok"); end`;
    const lexer = new Lexer(source, {
      blockDelimiters: { open: "begin", close: "end" },
    });

    const types = lexer.scanTokens().map((t) => t.type);

    expect(types).toContain(TOKENS.SYMBOLS.left_brace);
    expect(types).toContain(TOKENS.SYMBOLS.right_brace);
  });

  it("should reject equal open and close delimiters", () => {
    expect(
      () =>
        new Lexer("int main() {}", {
          blockDelimiters: { open: "begin", close: "begin" },
        }),
    ).toThrow();
  });

  it("should reject delimiters with whitespace", () => {
    expect(
      () =>
        new Lexer("int main() {}", {
          blockDelimiters: { open: "begin block", close: "end" },
        }),
    ).toThrow();
  });

  it("should reject conflicts with reserved words", () => {
    expect(
      () =>
        new Lexer("int main() {}", {
          blockDelimiters: { open: "if", close: "end" },
        }),
    ).toThrow();
  });

  it("should allow braces and configured delimiters in the same source", () => {
    const source = `int main() begin if (1 == 1) { print("a"); } end`;
    const lexer = new Lexer(source, {
      blockDelimiters: { open: "begin", close: "end" },
    });

    const types = lexer.scanTokens().map((token) => token.type);
    const leftBraceCount = types.filter(
      (type) => type === TOKENS.SYMBOLS.left_brace,
    ).length;
    const rightBraceCount = types.filter(
      (type) => type === TOKENS.SYMBOLS.right_brace,
    ).length;

    expect(leftBraceCount).toBe(2);
    expect(rightBraceCount).toBe(2);
  });

  it("should reject configured delimiters in indentation mode", () => {
    expect(() =>
      new Lexer("int main() begin print(\"ok\"); end", {
        indentationBlock: true,
        blockDelimiters: { open: "begin", close: "end" },
      }).scanTokens(),
    ).toThrow();
  });
});
