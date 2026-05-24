import { describe, expect, it } from "vitest";
import { compileToIr } from "../grammar/helpers";
import { Interpreter } from "../../interpreter";

interface ArraySnapshotValue {
  elements: unknown[];
}

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

  it("continues past a breakpoint without immediately stopping at the same instruction pointer", async () => {
    const interpreter = createInterpreter(
      `
int main() {
  int x = 1;
  print(x);
}
`,
    );

    interpreter.startDebug({ breakpoints: [3] });
    const stopped = await interpreter.continueDebug();
    const continued = await interpreter.continueDebug();

    expect(stopped.status).toBe("paused");
    expect(stopped.stopReason).toBe("breakpoint");
    expect(continued.status).toBe("paused");
    expect(continued.instructionPointer).not.toBe(stopped.instructionPointer);
  });

  it("returns variable snapshots as copies instead of live runtime references", async () => {
    const output: string[] = [];
    const interpreter = createInterpreter(
      `
int main() {
  int values[2] = [0, 1];
  print(values[0]);
}
`,
      output,
    );

    interpreter.startDebug({ breakpoints: [4] });
    const stopped = await interpreter.continueDebug();
    const values = stopped.variables.find(
      (variable) => variable.name === "values",
    );

    expect(values).toBeDefined();
    const snapshotValue = values?.value as ArraySnapshotValue;
    snapshotValue.elements[0] = 99;

    const nextStop = await interpreter.continueDebug();
    const completed = await interpreter.continueDebug();

    expect(nextStop.status).toBe("paused");
    expect(nextStop.instructionPointer).not.toBe(stopped.instructionPointer);
    expect(completed.status).toBe("completed");
    expect(output).toEqual(["0"]);
  });

  it("continues without breakpoints until completion", async () => {
    const output: string[] = [];
    const interpreter = createInterpreter(
      `
int main() {
  int x = 2;
  print(x);
}
`,
      output,
    );

    interpreter.startDebug();
    const result = await interpreter.continueDebug();

    expect(result.status).toBe("completed");
    expect(result.stopReason).toBe("completed");
    expect(output).toEqual(["2"]);
  });

  it("steps into user functions", async () => {
    const interpreter = createInterpreter(`
int inc(int value) {
  return value + 1;
}

int main() {
  int x = inc(1);
  print(x);
}
`);

    interpreter.startDebug();
    const first = await interpreter.stepIntoDebug();
    expect(first.currentSource?.line).toBe(7);

    const second = await interpreter.stepIntoDebug();
    expect(second.currentSource?.line).toBe(3);
  });

  it("steps over user functions", async () => {
    const interpreter = createInterpreter(`
int inc(int value) {
  return value + 1;
}

int main() {
  int x = inc(1);
  print(x);
}
`);

    interpreter.startDebug();
    await interpreter.stepIntoDebug();
    const snapshot = await interpreter.stepOverDebug();
    expect(snapshot.currentSource?.line).toBe(8);
  });

  it("steps out to the caller and stops debug sessions", async () => {
    const interpreter = createInterpreter(`
int inc(int value) {
  return value + 1;
}

int main() {
  int x = inc(1);
  print(x);
}
`);

    interpreter.startDebug();
    await interpreter.stepIntoDebug();
    await interpreter.stepIntoDebug();

    const steppedOut = await interpreter.stepOutDebug();
    expect(steppedOut.currentSource?.line).toBe(8);

    const stopped = interpreter.stopDebug();
    expect(stopped.status).toBe("idle");
    expect(stopped.stopReason).toBe("stopped");
  });

  it("returns an error snapshot when debug execution fails", async () => {
    const interpreter = createInterpreter(`
int main() {
  int values[1];
  print(values[2]);
}
`);

    interpreter.startDebug();
    const snapshot = await interpreter.continueDebug();

    expect(snapshot.status).toBe("error");
    expect(snapshot.stopReason).toBe("error");
    expect(snapshot.currentSource?.line).toBe(4);
    expect(snapshot.error).toMatch(/array|bounds|missing|runtime/i);
  });

  it("waits for debug input and resumes after input is provided", async () => {
    const output: string[] = [];
    const interpreter = createInterpreter(
      `
int main() {
  int x;
  scan(int, x);
  print(x);
}
`,
      output,
    );

    interpreter.startDebug();
    const waiting = await interpreter.continueDebug();

    expect(waiting.status).toBe("waiting-for-input");
    expect(waiting.stopReason).toBe("input");
    expect(waiting.currentSource?.line).toBe(4);

    interpreter.provideDebugInput("5");
    const completed = await interpreter.continueDebug();

    expect(completed.status).toBe("completed");
    expect(output).toEqual(["5"]);
  });
});
