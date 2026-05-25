import { describe, expect, it } from "vitest";
import { compileToIr } from "./helpers";

describe("Grammar Typing Mode", () => {
  it("accepts typed declarations/functions in typed mode", () => {
    const source = `
      int soma(int a, int b) { return a + b; }
      int main() { int x = 1; return soma(x, 2); }
    `;

    expect(() =>
      compileToIr(source, { grammar: { typingMode: "typed" } }),
    ).not.toThrow();
  });

  it("accepts untyped declarations/functions in untyped mode", () => {
    const source = `
      funcao soma(a, b) { return a + b; }
      funcao main() { variavel x = 1; return soma(x, 2); }
    `;

    expect(() =>
      compileToIr(source, { grammar: { typingMode: "untyped" } }),
    ).not.toThrow();
  });

  it("rejects typed function signature in untyped mode", () => {
    expect(() =>
      compileToIr(`int main(){ return 1; }`, {
        grammar: { typingMode: "untyped" },
      }),
    ).toThrow(/Unexpected|type|statement/i);
  });

  it("rejects typed variable declaration in untyped mode", () => {
    expect(() =>
      compileToIr(`funcao main(){ int x = 1; }`, {
        grammar: { typingMode: "untyped" },
      }),
    ).toThrow(/Unexpected|type|statement/i);
  });

  it("rejects typed parameters in untyped mode", () => {
    expect(() =>
      compileToIr(`funcao soma(int a){ return a; }`, {
        grammar: { typingMode: "untyped" },
      }),
    ).toThrow(/Unexpected|type|parameter/i);
  });

  it("accepts scan type-token syntax in typed mode", () => {
    expect(() =>
      compileToIr(
        `
          int main() {
            int x = 0;
            scan(int, x);
          }
        `,
        { grammar: { typingMode: "typed" } },
      ),
    ).not.toThrow();
  });

  it("accepts string and bool scan type-token syntax in typed mode", () => {
    const instructions = compileToIr(
      `
        int main() {
          string nome = "";
          bool active = false;
          scan(string, nome);
          scan(bool, active);
        }
      `,
      { grammar: { typingMode: "typed" } },
    );

    expect(instructions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          op: "CALL",
          result: "SCAN",
          operand1: "string",
          operand2: "nome",
        }),
        expect.objectContaining({
          op: "CALL",
          result: "SCAN",
          operand1: "bool",
          operand2: "active",
        }),
      ]),
    );
  });

  it("rejects void scan type-token syntax in typed mode", () => {
    expect(() =>
      compileToIr(
        `
          int main() {
            int x = 0;
            scan(void, x);
          }
        `,
        { grammar: { typingMode: "typed" } },
      ),
    ).toThrow();
  });

  it("accepts scan format syntax in typed mode", () => {
    expect(() =>
      compileToIr(
        `
          int main() {
            int x = 0;
            scan("%f", x);
          }
        `,
        { grammar: { typingMode: "typed" } },
      ),
    ).not.toThrow();
  });

  it("accepts typed scan syntax with indexed assignable targets", () => {
    expect(() =>
      compileToIr(
        `
          int main() {
            int vetor[3];
            int matriz[2][2];
            scan(int, vetor[1]);
            scan("%d", matriz[1][1]);
          }
        `,
        { grammar: { typingMode: "typed", arrayMode: "fixed" } },
      ),
    ).not.toThrow();
  });

  it("accepts bare scan syntax in untyped mode", () => {
    expect(() =>
      compileToIr(
        `
          funcao main() {
            variavel x = 0;
            scan(x);
          }
        `,
        { grammar: { typingMode: "untyped" } },
      ),
    ).not.toThrow();
  });

  it("accepts bare scan syntax with indexed assignable targets in untyped mode", () => {
    expect(() =>
      compileToIr(
        `
          funcao main() {
            lista[] = [];
            scan(lista[1][2]);
          }
        `,
        { grammar: { typingMode: "untyped", arrayMode: "dynamic" } },
      ),
    ).not.toThrow();
  });

  it("rejects typed scan syntax in untyped mode", () => {
    expect(() =>
      compileToIr(
        `
          funcao main() {
            variavel x = 0;
            scan(int, x);
          }
        `,
        { grammar: { typingMode: "untyped" } },
      ),
    ).toThrow();
  });

  it("accepts untyped dynamic array declaration syntax in dynamic mode", () => {
    expect(() =>
      compileToIr(
        `
          funcao main() {
            lista[] = [];
            return 0;
          }
        `,
        { grammar: { typingMode: "untyped", arrayMode: "dynamic" } },
      ),
    ).not.toThrow();
  });

  it("rejects untyped dynamic array declaration syntax in fixed mode", () => {
    expect(() =>
      compileToIr(
        `
          funcao main() {
            lista[] = [];
            return 0;
          }
        `,
        { grammar: { typingMode: "untyped", arrayMode: "fixed" } },
      ),
    ).toThrow();
  });

  it("rejects implicit declaration in typed mode for undeclared identifiers", () => {
    expect(() =>
      compileToIr(
        `
          int main() {
            x = 1;
            return 0;
          }
        `,
        { grammar: { typingMode: "typed", arrayMode: "fixed" } },
      ),
    ).toThrow();
  });

  it("accepts assignment in typed mode after prior declaration", () => {
    expect(() =>
      compileToIr(
        `
          int main() {
            int x;
            x = 1;
            return x;
          }
        `,
        { grammar: { typingMode: "typed", arrayMode: "fixed" } },
      ),
    ).not.toThrow();
  });

  it("rejects typed scan targets when the identifier is undeclared", () => {
    expect(() =>
      compileToIr(
        `
          int main() {
            scan(int, x);
            return 0;
          }
        `,
        { grammar: { typingMode: "typed", arrayMode: "fixed" } },
      ),
    ).toThrow();
  });

  it("rejects postfix increment expressions when the identifier is undeclared in typed mode", () => {
    expect(() =>
      compileToIr(
        `
          int main() {
            int y = x++;
            return y;
          }
        `,
        { grammar: { typingMode: "typed", arrayMode: "fixed" } },
      ),
    ).toThrow();
  });

  it("rejects postfix increment statements when the identifier is undeclared in typed mode", () => {
    expect(() =>
      compileToIr(
        `
          int main() {
            x++;
            return 0;
          }
        `,
        { grammar: { typingMode: "typed", arrayMode: "fixed" } },
      ),
    ).toThrow();
  });

  it("accepts postfix increment statements after declaration in typed mode", () => {
    expect(() =>
      compileToIr(
        `
          int main() {
            int x = 0;
            x++;
            return x;
          }
        `,
        { grammar: { typingMode: "typed", arrayMode: "fixed" } },
      ),
    ).not.toThrow();
  });

  it("accepts fixed matrix parameters with exact sizes in typed mode", () => {
    expect(() =>
      compileToIr(
        `
          void printaProPai(int vec[2][4]) {
            return;
          }

          int main() {
            int vec[2][4];
            printaProPai(vec);
            return 0;
          }
        `,
        { grammar: { typingMode: "typed", arrayMode: "fixed" } },
      ),
    ).not.toThrow();
  });

  it("rejects chained assignment when a later identifier is undeclared in typed mode", () => {
    expect(() =>
      compileToIr(
        `
          int main() {
            int a;
            a = b = 1;
            return a;
          }
        `,
        { grammar: { typingMode: "typed", arrayMode: "fixed" } },
      ),
    ).toThrow();
  });

  it("accepts fixed array initialization with an empty literal in untyped mode", () => {
    expect(() =>
      compileToIr(
        `
          funcao main() {
            lista[10] = [];
            return 0;
          }
        `,
        { grammar: { typingMode: "untyped", arrayMode: "fixed" } },
      ),
    ).not.toThrow();
  });

  it("rejects dynamic array syntax in untyped fixed mode", () => {
    expect(() =>
      compileToIr(
        `
          funcao main() {
            lista[] = [];
            return 0;
          }
        `,
        { grammar: { typingMode: "untyped", arrayMode: "fixed" } },
      ),
    ).toThrow();
  });
});
