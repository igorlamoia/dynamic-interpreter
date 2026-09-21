import { describe, expect, it } from "vitest";
import { Lexer } from "../../lexer";
import { TOKENS } from "../../token/constants";

describe("statement terminator config", () => {
  it("accepts a symbolic statement terminator lexeme", () => {
    expect(
      () =>
        new Lexer("int main() { print(1); }", {
          statementTerminatorLexeme: "@@",
          locale: "en",
        }),
    ).not.toThrow();
  });

  it("rejects empty or whitespace terminators", () => {
    expect(
      () =>
        new Lexer("int main() {}", {
          statementTerminatorLexeme: "   ",
          locale: "en",
        }),
    ).toThrow(/statement terminator/i);
  });

  it("rejects semicolon as a custom terminator", () => {
    expect(
      () =>
        new Lexer("int main() {}", {
          statementTerminatorLexeme: ";",
          locale: "en",
        }),
    ).toThrow(/statement terminator/i);
  });

  it("rejects terminators that reuse fixed operator or symbol characters", () => {
    expect(
      () =>
        new Lexer("int main() {}", {
          statementTerminatorLexeme: "!!",
          locale: "en",
        }),
    ).toThrow(/statement terminator/i);
  });

  it("tokenizes the configured terminator as semicolon token for normal statements", () => {
    const lexer = new Lexer("int main() { print(1) @@ }", {
      statementTerminatorLexeme: "@@",
      locale: "en",
    });

    const semicolonTokens = lexer
      .scanTokens()
      .filter((token) => token.type === TOKENS.SYMBOLS.semicolon);

    expect(semicolonTokens).toHaveLength(1);
    expect(semicolonTokens[0]?.lexeme).toBe("@@");
  });

  it("tokenizes an identifier-like terminator as semicolon token", () => {
    const lexer = new Lexer("int main() { print(1) uai }", {
      statementTerminatorLexeme: "uai",
      locale: "en",
    });

    const semicolonTokens = lexer
      .scanTokens()
      .filter((token) => token.type === TOKENS.SYMBOLS.semicolon);

    expect(semicolonTokens).toHaveLength(1);
    expect(semicolonTokens[0]?.lexeme).toBe("uai");
  });

  it("tokenizes an underscore-prefixed terminator as semicolon token", () => {
    const lexer = new Lexer("int main() { print(1) _uai }", {
      statementTerminatorLexeme: "_uai",
      locale: "en",
    });

    const semicolonTokens = lexer
      .scanTokens()
      .filter((token) => token.type === TOKENS.SYMBOLS.semicolon);

    expect(semicolonTokens).toHaveLength(1);
    expect(semicolonTokens[0]?.lexeme).toBe("_uai");
  });

  it("does not match an identifier-like terminator inside a larger identifier", () => {
    const lexer = new Lexer("int main() { int uai123 = 1; }", {
      statementTerminatorLexeme: "uai",
      locale: "en",
    });

    const identifierLexemes = lexer
      .scanTokens()
      .filter((token) => token.type === TOKENS.LITERALS.identifier)
      .map((token) => token.lexeme);

    expect(identifierLexemes).toContain("uai123");
  });

  it("rejects terminators that collide with reserved keywords", () => {
    expect(
      () =>
        new Lexer("int main() {}", {
          statementTerminatorLexeme: "if",
          locale: "en",
        }),
    ).toThrow(/statement terminator/i);
  });

  it("rejects terminators that collide with custom keywords", () => {
    expect(
      () =>
        new Lexer("int main() {}", {
          customKeywords: { uai: 999 },
          statementTerminatorLexeme: "uai",
          locale: "en",
        }),
    ).toThrow(/statement terminator/i);
  });

  it("rejects terminators that collide with operator aliases", () => {
    expect(
      () =>
        new Lexer("int main() {}", {
          statementTerminatorLexeme: "uai",
          operatorWordMap: { logical_and: "uai" },
          locale: "en",
        }),
    ).toThrow(/statement terminator/i);
  });

  it("rejects terminators that collide with boolean literal aliases", () => {
    expect(
      () =>
        new Lexer("int main() {}", {
          statementTerminatorLexeme: "uai",
          booleanLiteralMap: { true: "uai", false: "nao" },
          locale: "en",
        }),
    ).toThrow(/statement terminator/i);
  });

  it("rejects terminators that collide with block delimiters", () => {
    expect(
      () =>
        new Lexer("int main() {}", {
          statementTerminatorLexeme: "uai",
          blockDelimiters: { open: "uai", close: "fim" },
          locale: "en",
        }),
    ).toThrow(/statement terminator/i);
  });

  it("accepts symbolic block delimiters", () => {
    expect(
      () =>
        new Lexer("int main() { print(1); }", {
          blockDelimiters: { open: "{", close: "}" },
          locale: "en",
        }),
    ).not.toThrow();
  });

  it("rejects block delimiters with whitespace", () => {
    expect(
      () =>
        new Lexer("int main() { print(1); }", {
          blockDelimiters: { open: "begin block", close: "end" },
          locale: "en",
        }),
    ).toThrow(/block delimiters/i);
  });
});
