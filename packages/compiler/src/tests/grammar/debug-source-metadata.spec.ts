import { describe, expect, it } from "vitest";
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

    expect(instructions.some((instruction) => instruction.source?.line === 3))
      .toBe(true);
  });
});
