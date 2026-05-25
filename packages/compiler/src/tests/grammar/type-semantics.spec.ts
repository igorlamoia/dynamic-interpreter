import { describe, expect, it } from "vitest";
import {
  compileProgram,
  compileToIr,
  createStdin,
  executeProgram,
} from "./helpers";
import { TokenIterator } from "../../token/TokenIterator";

describe("Type semantics warnings", () => {
  it("preserves array symbol metadata while resolving scalar element type", () => {
    const iterator = new TokenIterator([], {
      grammar: { typingMode: "typed", arrayMode: "fixed" },
    });

    iterator.declareSymbolDescriptor("matriz", {
      kind: "array",
      baseType: "int",
      dimensions: 2,
      arrayMode: "fixed",
      sizes: [3, 3],
    });

    expect(iterator.resolveSymbol("matriz")).toBe("int");
    expect(iterator.resolveSymbolDescriptor("matriz")).toEqual({
      kind: "array",
      baseType: "int",
      dimensions: 2,
      arrayMode: "fixed",
      sizes: [3, 3],
    });
  });

  it("accepts bool declarations and function signatures", () => {
    const result = compileProgram(`
      bool isReady(bool value) {
        return value;
      }

      int main() {
        bool flag = true;
        return 0;
      }
    `);

    expect(result.error).toBeNull();
    expect(result.warnings).toHaveLength(0);
    expect(result.instructions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          op: "DECLARE",
          result: "value",
          operand1: "bool",
        }),
        expect.objectContaining({
          op: "DECLARE",
          result: "flag",
          operand1: "bool",
        }),
        expect.objectContaining({
          op: "=",
          result: "flag",
          operand1: "true",
        }),
      ]),
    );
  });

  it("reports a warning when assigning a float literal to an int", () => {
    const result = compileProgram(`
      int main() {
        int x = 3.9;
        return x;
      }
    `);

    expect(result.error).toBeNull();
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]?.code).toMatch(/int|lossy|conversion/i);
  });

  it("warns when returning a float expression from an int function", () => {
    const result = compileProgram(`
      int main() {
        return 3.9;
      }
    `);

    expect(result.warnings).toHaveLength(1);
  });

  it("warns when passing a float expression to an int parameter", () => {
    const result = compileProgram(`
      int soma(int a) { return a; }
      int main() { return soma(4.2); }
    `);

    expect(result.warnings).toHaveLength(1);
  });

  it("warns for each lossy float-to-int write in the same program", () => {
    const result = compileProgram(`
      int soma(float a, float b) {
        return a + b;
      }

      int main() {
        int x = 0.5;
        int y = 1.2;
        return 0;
      }
    `);

    expect(result.warnings).toHaveLength(3);
  });

  it("warns when a float scan hint writes into an int variable", () => {
    const result = compileProgram(`
      int main() {
        int x = 0;
        scan(float, x);
        return 0;
      }
    `);

    expect(result.warnings).toHaveLength(1);
  });

  it("warns when a %f scan hint writes into an int variable", () => {
    const result = compileProgram(`
      int main() {
        int x = 0;
        scan("%f", x);
        return 0;
      }
    `);

    expect(result.warnings).toHaveLength(1);
  });

  it("warns when a float scan hint writes into an int array element", () => {
    const result = compileProgram(
      `
      int main() {
        int matriz[2][2];
        scan(float, matriz[1][1]);
        return 0;
      }
    `,
      {
        grammar: { typingMode: "typed", arrayMode: "fixed" },
      },
    );

    expect(result.warnings).toHaveLength(1);
  });

  it("does not warn when an int scan hint writes into a float variable", () => {
    const result = compileProgram(`
      int main() {
        float x = 0.0;
        scan(int, x);
        return 0;
      }
    `);

    expect(result.warnings).toHaveLength(0);
  });

  it("emits array write ir for indexed scan targets", () => {
    const instructions = compileToIr(
      `
      int main() {
        int matriz[2][2];
        scan(int, matriz[1][1]);
        return 0;
      }
    `,
      {
        grammar: { typingMode: "typed", arrayMode: "fixed" },
      },
    );

    expect(instructions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          op: "CALL",
          result: "SCAN",
          operand1: "int",
        }),
        expect.objectContaining({ op: "ARRAY_SET", result: "matriz" }),
      ]),
    );
  });

  it("accepts fixed array declarations in fixed array mode", () => {
    expect(() =>
      compileToIr(
        `
          int main() {
            int matriz[3][3];
            return 0;
          }
        `,
        { grammar: { typingMode: "typed", arrayMode: "fixed" } },
      ),
    ).not.toThrow();
  });

  it("emits dedicated ir for fixed array declarations", () => {
    const instructions = compileToIr(
      `
        int main() {
          int matriz[2][2];
          return 0;
        }
      `,
      { grammar: { typingMode: "typed", arrayMode: "fixed" } },
    );

    expect(instructions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          op: "DECLARE_ARRAY",
          result: "matriz",
          operand1: "int",
        }),
      ]),
    );
  });

  it("accepts fixed array initialization literals in typed mode", () => {
    expect(() =>
      compileToIr(
        `
          int main() {
            int vetor[2] = [0, 1];
            return 0;
          }
        `,
        { grammar: { typingMode: "typed", arrayMode: "fixed" } },
      ),
    ).not.toThrow();
  });

  it("accepts fixed matrix initialization literals in typed mode", () => {
    expect(() =>
      compileToIr(
        `
          int main() {
            int matriz[2][2] = [[0, 1], [2, 3]];
            return 0;
          }
        `,
        { grammar: { typingMode: "typed", arrayMode: "fixed" } },
      ),
    ).not.toThrow();
  });

  it("rejects fixed matrix parameters with mismatched sizes", () => {
    expect(() =>
      compileToIr(
        `
          void printaProPai(int vec[3][4]) {
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
    ).toThrow();
  });

  it("accepts dynamic matrix parameters when dimensions match", () => {
    expect(() =>
      compileToIr(
        `
          void printaProPai(int vec[][]) {
            return;
          }

          int main() {
            int vec[][] = [[1, 2], [3, 4]];
            printaProPai(vec);
            return 0;
          }
        `,
        { grammar: { typingMode: "typed", arrayMode: "dynamic" } },
      ),
    ).not.toThrow();
  });

  it("accepts declaration-time array initialization literals in untyped mode", () => {
    expect(() =>
      compileToIr(
        `
          funcao main() {
            vetor[] = [0, 1];
            return 0;
          }
        `,
        { grammar: { typingMode: "untyped", arrayMode: "dynamic" } },
      ),
    ).not.toThrow();
  });

  it("rejects array literals in plain assignments", () => {
    expect(() =>
      compileToIr(
        `
          int main() {
            int vetor[2];
            vetor = [0, 1];
            return 0;
          }
        `,
        { grammar: { typingMode: "typed", arrayMode: "fixed" } },
      ),
    ).toThrow();
  });

  it("rejects malformed array literal separators", () => {
    expect(() =>
      compileToIr(
        `
          int main() {
            int matriz[2][2] = [[0, 1] [2, 3]];
            return 0;
          }
        `,
        { grammar: { typingMode: "typed", arrayMode: "fixed" } },
      ),
    ).toThrow();
  });

  it("rejects fixed array initialization literals with wrong size", () => {
    expect(() =>
      compileToIr(
        `
          int main() {
            int vetor[2] = [0, 1, 2];
            return 0;
          }
        `,
        { grammar: { typingMode: "typed", arrayMode: "fixed" } },
      ),
    ).toThrow();
  });

  it("rejects fixed matrix initialization literals with wrong depth", () => {
    expect(() =>
      compileToIr(
        `
          int main() {
            int matriz[2][2] = [0, 1];
            return 0;
          }
        `,
        { grammar: { typingMode: "typed", arrayMode: "fixed" } },
      ),
    ).toThrow();
  });

  it("rejects incompatible typed array literal elements", () => {
    expect(() =>
      compileToIr(
        `
          int main() {
            int vetor[2] = [0, "x"];
            return 0;
          }
        `,
        { grammar: { typingMode: "typed", arrayMode: "fixed" } },
      ),
    ).toThrow();
  });

  it("emits array writes for declaration-time initializer literals", () => {
    const instructions = compileToIr(
      `
        int main() {
          int matriz[2][2] = [[0, 1], [2, 3]];
          return 0;
        }
      `,
      { grammar: { typingMode: "typed", arrayMode: "fixed" } },
    );

    expect(instructions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          op: "DECLARE_ARRAY",
          result: "matriz",
          operand1: "int",
        }),
        expect.objectContaining({
          op: "ARRAY_SET",
          result: "matriz",
          operand1: ["0", "0"],
          operand2: "0",
        }),
        expect.objectContaining({
          op: "ARRAY_SET",
          result: "matriz",
          operand1: ["0", "1"],
          operand2: "1",
        }),
        expect.objectContaining({
          op: "ARRAY_SET",
          result: "matriz",
          operand1: ["1", "0"],
          operand2: "2",
        }),
        expect.objectContaining({
          op: "ARRAY_SET",
          result: "matriz",
          operand1: ["1", "1"],
          operand2: "3",
        }),
      ]),
    );
  });

  it("rejects empty dimensions in fixed array mode", () => {
    expect(() =>
      compileToIr(
        `
          int main() {
            int lista[];
            return 0;
          }
        `,
        { grammar: { typingMode: "typed", arrayMode: "fixed" } },
      ),
    ).toThrow();
  });

  it("rejects mixed fixed and dynamic dimensions in fixed array mode", () => {
    expect(() =>
      compileToIr(
        `
          int main() {
            int tabela[3][];
            return 0;
          }
        `,
        { grammar: { typingMode: "typed", arrayMode: "fixed" } },
      ),
    ).toThrow();
  });

  it("accepts fixed array element reads in expressions", () => {
    expect(() =>
      compileToIr(
        `
          int main() {
            int matriz[2][2];
            print(matriz[1][1]);
            return matriz[0][0] + 1;
          }
        `,
        { grammar: { typingMode: "typed", arrayMode: "fixed" } },
      ),
    ).not.toThrow();
  });

  it("rejects partial fixed array access", () => {
    expect(() =>
      compileToIr(
        `
          int main() {
            int matriz[2][2];
            print(matriz[1]);
            return 0;
          }
        `,
        { grammar: { typingMode: "typed", arrayMode: "fixed" } },
      ),
    ).toThrow();
  });

  it("rejects partial indexed scan targets", () => {
    expect(() =>
      compileToIr(
        `
          int main() {
            int matriz[2][2];
            scan(int, matriz[1]);
          }
        `,
        { grammar: { typingMode: "typed", arrayMode: "fixed" } },
      ),
    ).toThrow();
  });

  it("rejects non-assignable scan targets", () => {
    expect(() =>
      compileToIr(
        `
          int main() {
            int x = 0;
            scan(int, x + 1);
          }
        `,
        { grammar: { typingMode: "typed", arrayMode: "fixed" } },
      ),
    ).toThrow();
  });

  it("accepts fixed array element writes", () => {
    expect(() =>
      compileToIr(
        `
          int main() {
            int matriz[2][3];
            matriz[1][2] = 7;
            return 0;
          }
        `,
        { grammar: { typingMode: "typed", arrayMode: "fixed" } },
      ),
    ).not.toThrow();
  });

  it("accepts dynamic typed array declarations in dynamic mode", () => {
    expect(() =>
      compileToIr(
        `
          int main() {
            int lista[];
            return 0;
          }
        `,
        { grammar: { typingMode: "typed", arrayMode: "dynamic" } },
      ),
    ).not.toThrow();
  });

  it("rejects explicit sizes in dynamic array mode", () => {
    expect(() =>
      compileToIr(
        `
          int main() {
            int matriz[3][3];
            return 0;
          }
        `,
        { grammar: { typingMode: "typed", arrayMode: "dynamic" } },
      ),
    ).toThrow();
  });

  it("rejects incompatible fixed array element writes", () => {
    expect(() =>
      compileToIr(
        `
          int main() {
            int matriz[2][2];
            matriz[1][1] = "x";
            return 0;
          }
        `,
        { grammar: { typingMode: "typed", arrayMode: "fixed" } },
      ),
    ).toThrow();
  });
});

describe("Type semantics runtime", () => {
  it("executes customized boolean literal aliases in declarations and conditions", async () => {
    const result = await executeProgram(
      `
        int main() {
          bool oi = mentira;
          if (oi) {
            print("nao deveria");
          }
          oi = vdd;
          if (oi) {
            print("ok");
          }
          return 0;
        }
      `,
      {
        lexer: {
          booleanLiteralMap: {
            true: "vdd",
            false: "mentira",
          },
        },
      },
    );

    expect(result.output).toBe("ok");
  });

  it("prints boolean declaration values", async () => {
    const result = await executeProgram(`
      int main() {
        bool flag = true;
        print(flag);
        return 0;
      }
    `);

    expect(result.output).toBe("true");
  });

  it("propagates array writes through parameter references", async () => {
    const result = await executeProgram(
      `
        void altera(int vec[2][2]) {
          vec[0][0] = 99;
        }

        int main() {
          int vec[2][2] = [[1, 2], [3, 4]];
          altera(vec);
          print(vec[0][0]);
          return 0;
        }
      `,
      { grammar: { typingMode: "typed", arrayMode: "fixed" } },
    );

    expect(result.output).toBe("99");
  });

  it("preserves boolean returns through function calls", async () => {
    const result = await executeProgram(`
      bool negate(bool value) {
        return !value;
      }

      int main() {
        print(negate(false));
        return 0;
      }
    `);

    expect(result.output).toBe("true");
  });

  it("truncates toward zero when storing float into int", async () => {
    const result = await executeProgram(`
      int main() {
        int x = 3.9;
        print(x);
        return 0;
      }
    `);

    expect(result.output).toBe("3");
  });

  it("truncates scanned float input when destination variable is int", async () => {
    const result = await executeProgram(
      `
        int main() {
          int x = 0;
          scan("%f", x);
          print(x);
          return 0;
        }
      `,
      { stdin: async () => "3.9" },
    );

    expect(result.output).toBe("3");
  });

  it("keeps declaration semantics when float variable uses int scan hint", async () => {
    const result = await executeProgram(
      `
        int main() {
          float x = 0.0;
          scan(int, x);
          print(x);
          return 0;
        }
      `,
      { stdin: async () => "3" },
    );

    expect(result.output).toBe("3");
  });

  it("uses the scan int hint before writing into a float variable", async () => {
    const result = await executeProgram(
      `
        int main() {
          float x = 0.0;
          scan(int, x);
          print(x);
          return 0;
        }
      `,
      { stdin: async () => "3.9" },
    );

    expect(result.output).toBe("3");
  });

  it("reads string and bool values with typed scan hints", async () => {
    const result = await executeProgram(
      `
        int main() {
          string nome = "";
          bool active = false;
          scan(string, nome);
          scan(bool, active);
          print(nome);
          print(active);
          return 0;
        }
      `,
      { stdin: createStdin(["Maria", "true"]) },
    );

    expect(result.output).toBe("Mariatrue");
  });

  it("truncates negative floats toward zero for int", async () => {
    const result = await executeProgram(`
      int main() {
        int x = -3.9;
        print(x);
        return 0;
      }
    `);

    expect(result.output).toBe("-3");
  });

  it("emits plain string instruction operands for typed conditions", () => {
    const result = compileProgram(`
      int main() {
        int x = 1;
        if (x < 2) {
          print(x);
        }
        return 0;
      }
    `);

    const ifInstruction = result.instructions.find(
      (instruction) => instruction.op === "IF",
    );

    expect(ifInstruction).toBeDefined();
    expect(typeof ifInstruction?.result).toBe("string");
    expect(ifInstruction?.result).not.toMatchObject({
      place: expect.anything(),
    });
  });

  it("initializes fixed arrays at runtime without crashing", async () => {
    const result = await executeProgram(
      `
        int main() {
          int matriz[2][2];
          print(1);
          return 0;
        }
      `,
      { grammar: { typingMode: "typed", arrayMode: "fixed" } },
    );

    expect(result.output).toBe("1");
  });

  it("writes and reads fixed array elements at runtime", async () => {
    const result = await executeProgram(
      `
        int main() {
          int matriz[2][3];
          matriz[1][2] = 7;
          print(matriz[1][2]);
        }
      `,
      { grammar: { typingMode: "typed", arrayMode: "fixed" } },
    );

    expect(result.output).toBe("7");
  });

  it("auto-grows dynamic arrays on write", async () => {
    const result = await executeProgram(
      `
        int main() {
          int lista[];
          lista[4] = 10;
          print(lista[4]);
          return lista[4];
        }
      `,
      { grammar: { typingMode: "typed", arrayMode: "dynamic" } },
    );

    expect(result.output).toBe("10");
  });

  it("raises runtime error on fixed array out-of-bounds read", async () => {
    await expect(
      executeProgram(
        `
          int main() {
            int matriz[2][2];
            print(matriz[3][0]);
            return 0;
          }
        `,
        { grammar: { typingMode: "typed", arrayMode: "fixed" } },
      ),
    ).rejects.toMatchObject({
      code: "interpreter.array_read_out_of_bounds",
    });
  });

  it("raises runtime error on dynamic array missing read", async () => {
    await expect(
      executeProgram(
        `
          int main() {
            int lista[];
            print(lista[2]);
            return 0;
          }
        `,
        { grammar: { typingMode: "typed", arrayMode: "dynamic" } },
      ),
    ).rejects.toMatchObject({
      code: "interpreter.array_missing_value",
    });
  });

  it("supports multidimensional dynamic writes then reads", async () => {
    const result = await executeProgram(
      `
        int main() {
          int matriz[][];
          matriz[1][2] = 9;
          print(matriz[1][2]);
          return matriz[1][2];
        }
      `,
      { grammar: { typingMode: "typed", arrayMode: "dynamic" } },
    );

    expect(result.output).toBe("9");
  });

  it("preserves bool and string array element value types", async () => {
    const result = await executeProgram(
      `
        int main() {
          bool flags[];
          string nomes[];
          flags[0] = true;
          nomes[0] = "ok";
          print(flags[0]);
          print(nomes[0]);
          return 0;
        }
      `,
      { grammar: { typingMode: "typed", arrayMode: "dynamic" } },
    );

    expect(result.output).toBe("trueok");
  });

  it("supports untyped dynamic array declaration syntax at runtime", async () => {
    const result = await executeProgram(
      `
        funcao main() {
          lista[] = [];
          lista[0] = 1;
          print(lista[0]);
          return 0;
        }
      `,
      { grammar: { typingMode: "untyped", arrayMode: "dynamic" } },
    );

    expect(result.output).toBe("1");
  });

  it("reads initialized fixed array values at runtime", async () => {
    const result = await executeProgram(
      `
        int main() {
          int vetor[2] = [0, 1];
          print(vetor[0]);
          print(vetor[1]);
          return 0;
        }
      `,
      { grammar: { typingMode: "typed", arrayMode: "fixed" } },
    );

    expect(result.output).toBe("01");
  });

  it("reads initialized fixed matrix values at runtime", async () => {
    const result = await executeProgram(
      `
        int main() {
          int matriz[2][2] = [[0, 1], [2, 3]];
          print(matriz[1][0]);
          print(matriz[1][1]);
          return 0;
        }
      `,
      { grammar: { typingMode: "typed", arrayMode: "fixed" } },
    );

    expect(result.output).toBe("23");
  });

  it("reads initialized untyped dynamic array values at runtime", async () => {
    const result = await executeProgram(
      `
        funcao main() {
          vetor[] = [0, 1];
          print(vetor[0]);
          print(vetor[1]);
          return 0;
        }
      `,
      { grammar: { typingMode: "untyped", arrayMode: "dynamic" } },
    );

    expect(result.output).toBe("01");
  });

  it("reads directly into fixed matrix elements at runtime", async () => {
    const result = await executeProgram(
      `
        int main() {
          int matriz[2][2];
          scan(int, matriz[0][0]);
          scan(int, matriz[0][1]);
          print(matriz[0][0]);
          print(matriz[0][1]);
        }
      `,
      {
        grammar: { typingMode: "typed", arrayMode: "fixed" },
        stdin: createStdin(["4", "7"]),
      },
    );

    expect(result.output).toBe("47");
  });

  it("reads directly into dynamic matrix elements at runtime in untyped mode", async () => {
    const result = await executeProgram(
      `
        funcao main() {
          lista[] = [];
          scan(lista[1][2]);
          print(lista[1][2]);
        }
      `,
      {
        grammar: { typingMode: "untyped", arrayMode: "dynamic" },
        stdin: createStdin(["9"]),
      },
    );

    expect(result.output).toBe("9");
  });

  it("raises runtime error on fixed array out-of-bounds write", async () => {
    await expect(
      executeProgram(
        `
          int main() {
            int matriz[2][2];
            matriz[3][0] = 1;
            return 0;
          }
        `,
        { grammar: { typingMode: "typed", arrayMode: "fixed" } },
      ),
    ).rejects.toMatchObject({
      code: "interpreter.array_write_out_of_bounds",
    });
  });
  it("supports multidimensional fixed arrays", async () => {
    const result = await executeProgram(
      `int main() {
        int matriz[3][3];
        int i, j;

        for(i=0;i<3;i++) {
          for(j=0;j<3;j++)
          {
            matriz[i][j] = i;
          }
        }

        for(i=0;i<3;i++){
          for(j=0;j<3;j++)
          {
            print(matriz[i][j]);
          }
        }
      }
      `,
      {
        grammar: { typingMode: "typed", arrayMode: "fixed" },
      },
    );

    expect(result.output).toBe("000111222");
  });

  it("supports multidimensional fixed array with scan", async () => {
    const result = await executeProgram(
      `int main() {
          int matriz[3][3];
          int i, j,aux;

          for ( i=0; i<3; i++ ) {
            for ( j=0; j<3; j++ )
            {
              scan("%d", aux);
              matriz[i][j] = aux;
            }
          }

          for( i=0; i<3; i++ ){
            for( j=0; j<3; j++ )
            {
              print(matriz[i][j]);
            }
          }
        }
        `,
      {
        grammar: { typingMode: "typed", arrayMode: "fixed" },
        stdin: createStdin(["1", "2", "3", "4", "5", "6", "7", "8", "9"]),
      },
    );
    expect(result.output).toBe("123456789");
  });

  it("accepts typed declaration in for initializer", async () => {
    const result = await executeProgram(
      `
        int main() {
          for (int i = 0; i < 4; i++) {
            print(i);
          }
          return 0;
        }
      `,
      {
        grammar: { typingMode: "typed", arrayMode: "fixed" },
      },
    );

    expect(result.output).toBe("0123");
  });
});

describe("Type semantics with custom keywords", () => {
  it("should still warn for lossy float-to-int conversion when int keyword is customized", () => {
    const result = compileProgram(
      `
      inteiro main() {
        inteiro x = 3.9;
        return x;
      }
    `,
      {
        lexer: {
          customKeywords: {
            inteiro: 21, // maps custom "inteiro" to int token ID
          },
        },
        grammar: { typingMode: "typed" },
      },
    );

    expect(result.error).toBeNull();
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]?.code).toMatch(/int|lossy|conversion/i);
  });

  it("should warn when returning a float from a customized int function", () => {
    const result = compileProgram(
      `
      inteiro main() {
        return 3.9;
      }
    `,
      {
        lexer: {
          customKeywords: {
            inteiro: 21,
          },
        },
        grammar: { typingMode: "typed" },
      },
    );

    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]?.code).toMatch(/int|lossy|conversion/i);
  });

  it("should warn when passing float to customized int parameter", () => {
    const result = compileProgram(
      `
      inteiro soma(inteiro a) { return a; }
      inteiro main() { return soma(4.2); }
    `,
      {
        lexer: {
          customKeywords: {
            inteiro: 21,
          },
        },
        grammar: { typingMode: "typed" },
      },
    );

    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]?.code).toMatch(/int|lossy|conversion/i);
  });

  it("should respect float keyword customization in scan hint", () => {
    const result = compileProgram(
      `
      inteiro main() {
        inteiro x;
        scan(flutuante, x);
        return 0;
      }
    `,
      {
        lexer: {
          customKeywords: {
            inteiro: 21,
            flutuante: 22,
          },
        },
        grammar: { typingMode: "typed" },
      },
    );

    expect(result.error).toBeNull();
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]?.code).toMatch(/int|lossy|conversion/i);
  });

  it("should not warn when assigning float to customized float variable", () => {
    const result = compileProgram(
      `
      flutuante main() {
        flutuante x = 3.9;
        return x;
      }
    `,
      {
        lexer: {
          customKeywords: {
            flutuante: 22,
          },
        },
        grammar: { typingMode: "typed" },
      },
    );

    expect(result.error).toBeNull();
    expect(result.warnings).toHaveLength(0);
  });
});
