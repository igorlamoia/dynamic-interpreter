import { describe, expect, it } from "vitest";
import { Emitter } from "../../ir/emitter";
import { Lexer } from "../../lexer";
import { TokenIterator } from "../../token/TokenIterator";

function compile(source: string) {
  const lexer = new Lexer(source, { locale: "en" });
  const iterator = new TokenIterator(lexer.scanTokens(), { locale: "en" });
  return iterator.generateIntermediateCode();
}

describe("debug source metadata", () => {
  it("allows emitted instructions to carry source locations", () => {
    const instructions = compile(`
int main() {
  int x = 1;
  print(x);
}
`);

    const declaration = instructions.find(
      (instruction) => instruction.op === "DECLARE" && instruction.result === "x",
    );
    const printCall = instructions.find(
      (instruction) =>
        instruction.op === "CALL" && instruction.result === "PRINT",
    );

    expect(declaration?.source).toMatchObject({ line: 3, column: 7 });
    expect(printCall?.source).toMatchObject({ line: 4, column: 3 });
  });

  it("does not attach a source key when source metadata is absent", () => {
    const emitter = new Emitter();

    emitter.emit("LABEL", "__start", null, null);

    expect(emitter.getInstructions()[0]).not.toHaveProperty("source");
  });

  it("maps common statements to their source lines", () => {
    const instructions = compile(`
int add(int value) {
  return value;
}

int main() {
  int x = 1;
  x = x + 1;
  print(add(x));
}
`);

    expect(
      instructions.some(
        (instruction) =>
          instruction.op === "RETURN" && instruction.source?.line === 3,
      ),
    ).toBe(true);
    expect(
      instructions.some(
        (instruction) =>
          instruction.op === "=" &&
          instruction.result === "x" &&
          instruction.source?.line === 8,
      ),
    ).toBe(true);
    expect(
      instructions.some(
        (instruction) =>
          instruction.op === "CALL" &&
          instruction.result === "add" &&
          instruction.source?.line === 9,
      ),
    ).toBe(true);
    expect(
      instructions.some(
        (instruction) =>
          instruction.op === "CALL" &&
          instruction.result === "PRINT" &&
          instruction.source?.line === 9,
      ),
    ).toBe(true);
  });
});
