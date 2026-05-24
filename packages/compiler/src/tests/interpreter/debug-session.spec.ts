import { describe, expect, it } from "vitest";
import { compileToIr } from "../grammar/helpers";
import { Interpreter } from "../../interpreter";

function createInterpreter(source: string, output: string[] = []) {
  return new Interpreter(
    compileToIr(source),
    {
      stdout: (msg) => output.push(msg),
      stdin: async () => "",
    },
    "en",
  );
}

describe("debug session", () => {
  it("starts at main and stops on a source-line breakpoint", async () => {
    const interpreter = createInterpreter(`
int main() {
  int x = 1;
  print(x);
}
`);

    interpreter.startDebug({ breakpoints: [3] });
    const result = await interpreter.continueDebug();

    expect(result.status).toBe("paused");
    expect(result.stopReason).toBe("breakpoint");
    expect(result.currentSource?.line).toBe(3);
  });
});
