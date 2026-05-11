import { describe, expect, it } from "vitest";
import { Lexer } from "../../lexer";
import { TokenIterator } from "../../token/TokenIterator";
import { compileToIr } from "./helpers";

describe("Grammar Semicolon Mode Config", () => {
  it("should expose required semicolon mode when configured on iterator", () => {
    const lexer = new Lexer("int main(){ print(1); }", { locale: "en" });
    const iterator = new TokenIterator(lexer.scanTokens(), {
      locale: "en",
      grammar: { semicolonMode: "required" },
    });

    expect(iterator.getSemicolonMode()).toBe("required");
  });

  it("should fail missing semicolon when strict mode is requested through helper", () => {
    const source = `
      int main() {
        int a = 1
      }
    `;

    expect(() =>
      compileToIr(source, {
        grammar: { semicolonMode: "required" },
      }),
    ).toThrow(/Unexpected token/);
  });
});

describe("Grammar Optional Semicolons", () => {
  it("should accept newline-terminated statement without semicolon in optional mode", () => {
    const source = `
      int main() {
        int a = 1
        print(a);
      }
    `;

    expect(() => compileToIr(source)).not.toThrow();
  });

  it("should reject same-line consecutive statements without semicolon in optional mode", () => {
    const source = `
      int main() {
        int a = 1 print(a);
      }
    `;

    expect(() => compileToIr(source)).toThrow(/Unexpected token/);
  });

  it("should allow assignment statement without semicolon at end of line", () => {
    const source = `
      int main() {
        int a = 1;
        a = 2
      }
    `;

    expect(() => compileToIr(source)).not.toThrow();
  });

  it("should allow function call statement without semicolon at end of line", () => {
    const source = `
      void ping() {}
      int main() {
        ping()
      }
    `;

    expect(() => compileToIr(source)).not.toThrow();
  });

  it("should allow prefix increment statement without semicolon at end of line", () => {
    const source = `
      int main() {
        int a = 1;
        ++a
      }
    `;

    expect(() => compileToIr(source)).not.toThrow();
  });

  it("should allow postfix increment statement without semicolon at end of line", () => {
    const source = `
      int main() {
        int a = 1;
        a++
      }
    `;

    expect(() => compileToIr(source)).not.toThrow();
  });

  it("should allow print statement without semicolon at end of line", () => {
    const source = `
      int main() {
        print("ok")
      }
    `;

    expect(() => compileToIr(source)).not.toThrow();
  });

  it("should allow scan statement without semicolon at end of line", () => {
    const source = `
      int main() {
        int x = 0;
        scan(int, x)
      }
    `;

    expect(() => compileToIr(source)).not.toThrow();
  });

  it("should allow bare untyped scan without semicolon at end of line", () => {
    const source = `
      funcao main() {
        variavel x = 0;
        scan(x)
      }
    `;

    expect(() =>
      compileToIr(source, {
        grammar: { typingMode: "untyped" },
      }),
    ).not.toThrow();
  });

  it("should allow return statement without semicolon at end of line", () => {
    const source = `
      int main() {
        return 1
      }
    `;

    expect(() => compileToIr(source)).not.toThrow();
  });

  it("should allow break statement without semicolon at end of line", () => {
    const source = `
      int main() {
        while (1) {
          break
        }
      }
    `;

    expect(() => compileToIr(source)).not.toThrow();
  });

  it("should allow continue statement without semicolon at end of line", () => {
    const source = `
      int main() {
        while (1) {
          continue
        }
      }
    `;

    expect(() => compileToIr(source)).not.toThrow();
  });
});

describe("Grammar For Semicolons", () => {
  it("should allow for(;;)", () => {
    const source = `
      int main() {
        for (;;) {}
      }
    `;

    expect(() => compileToIr(source)).not.toThrow();
  });

  it("should reject for(;;;)", () => {
    const source = `
      int main() {
        for (;;;){}
      }
    `;

    expect(() => compileToIr(source)).toThrow(/Unexpected token/);
  });

  it("should reject missing for separators in both semicolon modes", () => {
    const source = `
      int main() {
        int i = 0;
        for (i = 0 i < 10; i++) {}
      }
    `;

    expect(() => compileToIr(source)).toThrow(/Unexpected token/);
    expect(() =>
      compileToIr(source, {
        grammar: { semicolonMode: "required" },
      }),
    ).toThrow(/Unexpected token/);
  });

  it("keeps literal semicolons inside for headers when custom terminator is active", () => {
    expect(() =>
      compileToIr("int main() { for (int i = 0; i < 3; i++) { print(i)@@ } }", {
        lexer: { statementTerminatorLexeme: "@@" },
      }),
    ).not.toThrow();
  });

  it("keeps literal semicolons inside for headers when a word terminator is active", () => {
    expect(() =>
      compileToIr("int main() { for (int i = 0; i < 3; i++) { print(i) uai } }", {
        lexer: { statementTerminatorLexeme: "uai" },
        grammar: { semicolonMode: "required" },
      }),
    ).not.toThrow();
  });

  it("rejects custom terminator inside for headers", () => {
    expect(() =>
      compileToIr("int main() { for (int i = 0 @@ i < 3 @@ i++) { print(i)@@ } }", {
        lexer: { statementTerminatorLexeme: "@@" },
      }),
    ).toThrow(/Unexpected token/);
  });
});

describe("Grammar Required Semicolons", () => {
  it("should require semicolon at end of line in strict mode", () => {
    const source = `
      int main() {
        int a = 1
        print(a);
      }
    `;

    expect(() =>
      compileToIr(source, {
        grammar: { semicolonMode: "required" },
      }),
    ).toThrow(/Unexpected token/);
  });

  it("should allow the same source in optional mode", () => {
    const source = `
      int main() {
        int a = 1
        print(a);
      }
    `;

    expect(() =>
      compileToIr(source, {
        grammar: { semicolonMode: "optional-eol" },
      }),
    ).not.toThrow();
  });

  it("accepts literal semicolon in normal statements when custom terminator is active", () => {
    expect(() =>
      compileToIr("int main() { print(1); }", {
        lexer: { statementTerminatorLexeme: "@@" },
      }),
    ).not.toThrow();
  });

  it("mentions the configured terminator in required-mode errors", () => {
    expect(() =>
      compileToIr("int main() { print(1) }", {
        lexer: { statementTerminatorLexeme: "@@" },
        grammar: { semicolonMode: "required" },
      }),
    ).toThrow(/@@/);
  });

  it("accepts configured terminator in required mode", () => {
    expect(() =>
      compileToIr("int main() { print(1)@@ }", {
        lexer: { statementTerminatorLexeme: "@@" },
        grammar: { semicolonMode: "required" },
      }),
    ).not.toThrow();
  });

  it("accepts a word-like configured terminator in required mode", () => {
    expect(() =>
      compileToIr("int main() { print(1) uai }", {
        lexer: { statementTerminatorLexeme: "uai" },
        grammar: { semicolonMode: "required" },
      }),
    ).not.toThrow();
  });

  it("accepts literal semicolon in normal statements when a word terminator is active", () => {
    expect(() =>
      compileToIr("int main() { print(1); }", {
        lexer: { statementTerminatorLexeme: "uai" },
        grammar: { semicolonMode: "required" },
      }),
    ).not.toThrow();
  });
});
