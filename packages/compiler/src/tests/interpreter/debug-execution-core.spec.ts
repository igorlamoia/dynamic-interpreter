import { describe, expect, it } from "vitest";
import { executeProgram } from "../grammar/helpers";

describe("interpreter execution core", () => {
  it("preserves run-to-completion output after refactor", async () => {
    const result = await executeProgram(`
int main() {
  int sum = 0;
  for (int i = 0; i < 3; i++) {
    sum = sum + i;
  }
  print(sum);
}
`);

    expect(result.output).toBe("3");
  });
});
