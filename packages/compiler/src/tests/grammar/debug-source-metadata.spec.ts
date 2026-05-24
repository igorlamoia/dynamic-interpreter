import { describe, expect, it } from "vitest";
import { Emitter } from "../../ir/emitter";
import { Lexer } from "../../lexer";
import { Token } from "../../token";
import { TOKENS } from "../../token/constants";
import { TokenIterator } from "../../token/TokenIterator";
import {
  AssignmentTarget,
  emitAssignmentFromValue,
} from "../../grammar/syntax/attributeStmt";

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

  it("preserves omitted source metadata for direct assignment emits", () => {
    const iterator = new TokenIterator([], { locale: "en" });
    const targetToken = new Token(TOKENS.LITERALS.identifier, "x", 2, 3);
    const valueToken = new Token(TOKENS.LITERALS.integer_literal, "1", 2, 7);
    const target: AssignmentTarget = {
      kind: "scalar",
      name: "x",
      type: "int",
      token: targetToken,
    };

    emitAssignmentFromValue(iterator, target, "1", "int", valueToken);

    expect(iterator.emitter.getInstructions()[0]).not.toHaveProperty("source");
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

  it("maps control flow instructions to source lines", () => {
    const instructions = compile(`
int main() {
  int i = 0;
  while (i < 2) {
    if (i == 1) {
      break;
    }
    i++;
  }
}
`);

    expect(
      instructions.some(
        (instruction) =>
          instruction.op === "IF" && instruction.source?.line === 4,
      ),
    ).toBe(true);
    expect(
      instructions.some(
        (instruction) =>
          instruction.op === "IF" && instruction.source?.line === 5,
      ),
    ).toBe(true);
    expect(
      instructions.some(
        (instruction) =>
          instruction.op === "JUMP" && instruction.source?.line === 6,
      ),
    ).toBe(true);
    expect(
      instructions.some(
        (instruction) =>
          instruction.op === "+" && instruction.source?.line === 8,
      ),
    ).toBe(true);
  });

  it("maps switch dispatch and section instructions to source lines", () => {
    const instructions = compile(`
int main() {
  int x = 2;
  switch (x) {
    case 1:
      print(1);
    case 2:
      break;
    default:
      print(0);
  }
}
`);

    const jumpTargets = new Set(
      instructions
        .filter(
          (instruction) =>
            instruction.op === "JUMP" && instruction.source?.line === 4,
        )
        .map((instruction) => instruction.result),
    );
    const switchLabels = instructions.filter(
      (instruction) =>
        instruction.op === "LABEL" &&
        instruction.source?.line === 4 &&
        jumpTargets.has(instruction.result),
    );

    expect(switchLabels.length).toBeGreaterThan(0);
    expect(
      instructions.some(
        (instruction) =>
          instruction.op === "IF" && instruction.source?.line === 7,
      ),
    ).toBe(true);
    expect(
      instructions.some(
        (instruction) =>
          instruction.op === "LABEL" && instruction.source?.line === 9,
      ),
    ).toBe(true);
    expect(
      instructions.some(
        (instruction) =>
          instruction.op === "JUMP" && instruction.source?.line === 8,
      ),
    ).toBe(true);
    expect(
      instructions.some(
        (instruction) =>
          instruction.op === "==" &&
          instruction.source?.line === 7 &&
          instruction.source.column === 10,
      ),
    ).toBe(true);
  });
});
