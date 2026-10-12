import { describe, expect, it } from "vitest";
import { executeProgram } from "../grammar/helpers";
import { RuntimeError } from "../../interpreter";

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

  it("stops programs that exceed the configured instruction budget", async () => {
    await expect(
      executeProgram(
        `
int main() {
  while (true) {
  }
}
`,
        { interpreter: { maxInstructionSteps: 20 } },
      ),
    ).rejects.toMatchObject({
      code: "interpreter.max_instruction_steps_exceeded",
    } satisfies Partial<RuntimeError>);
  });

  it("does not treat missing variable names as truthy strings at runtime", async () => {
    await expect(
      executeProgram(
        `
function main() {
  if (ready) {
    print("start");
  }
}
`,
        { grammar: { typingMode: "untyped" } },
      ),
    ).rejects.toMatchObject({
      code: "interpreter.variable_not_found",
    } satisfies Partial<RuntimeError>);
  });
});
