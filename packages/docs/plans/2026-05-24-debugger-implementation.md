# Source-Level Debugger Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a VS Code-style source-level debugger across the compiler, interpreter, and IDE.

**Architecture:** The compiler enriches IR instructions with source metadata. The interpreter exposes a debug session API on top of the same execution core used by normal `execute()`. The IDE replaces the source-control sidebar placeholder with a debug panel that drives the session, highlights breakpoints/current lines, and shows variables, call stack, output, and errors.

**Tech Stack:** TypeScript, Vitest, React 19, Next.js, Monaco Editor, lucide-react, Tailwind CSS.

**Branch:** Use the current branch only. Do not create a worktree.

---

### Task 1: Add IR Source Metadata

**Files:**
- Modify: `compiler/src/interpreter/constants.ts`
- Modify: `compiler/src/ir/emitter.ts`
- Test: `compiler/src/tests/grammar/debug-source-metadata.spec.ts`

**Step 1: Write the failing test**

Create `compiler/src/tests/grammar/debug-source-metadata.spec.ts`:

```ts
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
```

**Step 2: Run test to verify it fails**

Run:

```bash
cd compiler
npm test -- src/tests/grammar/debug-source-metadata.spec.ts
```

Expected: FAIL because no instruction has `source`.

**Step 3: Add types and emitter support**

In `compiler/src/interpreter/constants.ts`, add:

```ts
export interface SourceLocation {
  file?: string;
  line: number;
  column: number;
  endLine?: number;
  endColumn?: number;
  statementId?: string;
}
```

Then extend `Instruction`:

```ts
export interface Instruction {
  op: OpName;
  result: string;
  operand1: unknown;
  operand2: unknown;
  source?: SourceLocation;
}
```

In `compiler/src/ir/emitter.ts`, import `SourceLocation` and update `emit`:

```ts
emit(
  op: OpName,
  result: string,
  operand1: any,
  operand2: any,
  source?: SourceLocation,
) {
  this.instructions.push({ op, result, operand1, operand2, source });
}

emitFromToken(
  op: OpName,
  result: string,
  operand1: any,
  operand2: any,
  token?: { line: number; column: number },
) {
  this.emit(
    op,
    result,
    operand1,
    operand2,
    token ? { line: token.line, column: token.column } : undefined,
  );
}
```

**Step 4: Add minimal source metadata where the test expects it**

In the declaration and print emit sites, pass the relevant token through
`emitFromToken`. Use the consumed declaration identifier token for declarations
and the print keyword token for print calls.

**Step 5: Run test to verify it passes**

Run:

```bash
cd compiler
npm test -- src/tests/grammar/debug-source-metadata.spec.ts
```

Expected: PASS.

**Step 6: Commit**

```bash
git add compiler/src/interpreter/constants.ts compiler/src/ir/emitter.ts compiler/src/tests/grammar/debug-source-metadata.spec.ts compiler/src/grammar/syntax/declarationStmt.ts compiler/src/grammar/syntax/ioStmt.ts
git commit -m "feat: add source metadata to IR instructions"
```

---

### Task 2: Attach Source Metadata To Statement Emits

**Files:**
- Modify: `compiler/src/grammar/syntax/attributeStmt.ts`
- Modify: `compiler/src/grammar/syntax/declarationStmt.ts`
- Modify: `compiler/src/grammar/syntax/functionCallExpr.ts`
- Modify: `compiler/src/grammar/syntax/ioStmt.ts`
- Modify: `compiler/src/grammar/syntax/returnStmt.ts`
- Modify: `compiler/src/grammar/syntax/breakStmt.ts`
- Modify: `compiler/src/grammar/syntax/continueStmt.ts`
- Test: `compiler/src/tests/grammar/debug-source-metadata.spec.ts`

**Step 1: Extend the failing tests**

Add representative assertions:

```ts
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

  expect(instructions.some((instruction) => instruction.op === "RETURN" && instruction.source?.line === 3)).toBe(true);
  expect(instructions.some((instruction) => instruction.op === "=" && instruction.result === "x" && instruction.source?.line === 8)).toBe(true);
  expect(instructions.some((instruction) => instruction.op === "CALL" && instruction.result === "add" && instruction.source?.line === 9)).toBe(true);
  expect(instructions.some((instruction) => instruction.op === "CALL" && instruction.result === "PRINT" && instruction.source?.line === 9)).toBe(true);
});
```

**Step 2: Run test to verify it fails**

Run:

```bash
cd compiler
npm test -- src/tests/grammar/debug-source-metadata.spec.ts
```

Expected: FAIL for missing source metadata on one or more statements.

**Step 3: Pass tokens through statement emit helpers**

Use the statement token already available in each syntax function:

- `attributeStmt.ts`: pass `target.token` to assignment emits.
- `declarationStmt.ts`: pass declaration identifier or declaration keyword token.
- `functionCallExpr.ts`: pass `functionName`.
- `ioStmt.ts`: pass print/scan keyword token.
- `returnStmt.ts`: keep the consumed return token and pass it to `RETURN`.
- `breakStmt.ts`: pass `breakToken`.
- `continueStmt.ts`: pass `continueToken`.

Example pattern:

```ts
iterator.emitter.emitFromToken("RETURN", value, functionReturnType, null, returnToken);
```

If a helper currently accepts no token, add an optional token parameter and
default to previous behavior when omitted.

**Step 4: Run focused tests**

Run:

```bash
cd compiler
npm test -- src/tests/grammar/debug-source-metadata.spec.ts
```

Expected: PASS.

**Step 5: Run grammar tests**

Run:

```bash
cd compiler
npm test -- src/tests/grammar
```

Expected: PASS.

**Step 6: Commit**

```bash
git add compiler/src/grammar/syntax compiler/src/tests/grammar/debug-source-metadata.spec.ts
git commit -m "feat: map statement IR to source lines"
```

---

### Task 3: Attach Source Metadata To Control Flow

**Files:**
- Modify: `compiler/src/grammar/syntax/ifStmt.ts`
- Modify: `compiler/src/grammar/syntax/whileStmt.ts`
- Modify: `compiler/src/grammar/syntax/forStmt.ts`
- Modify: `compiler/src/grammar/syntax/switchStmt.ts`
- Modify: `compiler/src/grammar/syntax/factorStmt.ts`
- Modify: `compiler/src/grammar/syntax/unitaryStmt.ts`
- Modify: `compiler/src/grammar/syntax/restAddStmt.ts`
- Modify: `compiler/src/grammar/syntax/restMultStmt.ts`
- Modify: `compiler/src/grammar/syntax/restRelationalStmt.ts`
- Modify: `compiler/src/grammar/syntax/restAndStmt.ts`
- Modify: `compiler/src/grammar/syntax/restOrStmt.ts`
- Modify: `compiler/src/grammar/syntax/notStmt.ts`
- Test: `compiler/src/tests/grammar/debug-source-metadata.spec.ts`

**Step 1: Add failing tests for loops and conditions**

Append:

```ts
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

  expect(instructions.some((instruction) => instruction.op === "IF" && instruction.source?.line === 4)).toBe(true);
  expect(instructions.some((instruction) => instruction.op === "IF" && instruction.source?.line === 5)).toBe(true);
  expect(instructions.some((instruction) => instruction.op === "JUMP" && instruction.source?.line === 6)).toBe(true);
  expect(instructions.some((instruction) => instruction.op === "+" && instruction.source?.line === 8)).toBe(true);
});
```

**Step 2: Run test to verify it fails**

Run:

```bash
cd compiler
npm test -- src/tests/grammar/debug-source-metadata.spec.ts
```

Expected: FAIL on missing control-flow metadata.

**Step 3: Thread source tokens through control-flow emitters**

Use the keyword token for statement-level control flow:

- `ifStmt.ts`: pass `ifToken` to condition `IF`, labels, and jump after true branch.
- `whileStmt.ts`: pass `whileToken` to start/body/end labels, condition `IF`, and loop-back `JUMP`.
- `forStmt.ts`: pass `forToken` to loop labels and flow instructions.
- `switchStmt.ts`: pass switch/case/default tokens to dispatch and labels where available.

For expression instructions, use the operator token or nearest operand token.
The debugger only needs stable source-line mapping, so line accuracy matters
more than column perfection in this pass.

**Step 4: Run focused tests**

Run:

```bash
cd compiler
npm test -- src/tests/grammar/debug-source-metadata.spec.ts
```

Expected: PASS.

**Step 5: Run compiler test suite**

Run:

```bash
cd compiler
npm test
```

Expected: PASS.

**Step 6: Commit**

```bash
git add compiler/src/grammar/syntax compiler/src/tests/grammar/debug-source-metadata.spec.ts
git commit -m "feat: map control flow IR to source lines"
```

---

### Task 4: Refactor Interpreter Around One Instruction Step

**Files:**
- Modify: `compiler/src/interpreter/index.ts`
- Test: `compiler/src/tests/interpreter/debug-execution-core.spec.ts`

**Step 1: Write preservation tests**

Create `compiler/src/tests/interpreter/debug-execution-core.spec.ts`:

```ts
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
```

**Step 2: Run test before changes**

Run:

```bash
cd compiler
npm test -- src/tests/interpreter/debug-execution-core.spec.ts
```

Expected: PASS. This is a characterization test.

**Step 3: Extract initialization helpers**

In `Interpreter`, extract from `execute()`:

```ts
private resetRuntimeState(): void
private indexLabels(): void
private initializeAtMain(): void
```

Keep behavior identical.

**Step 4: Extract `stepInstruction`**

Move the body of one `while` iteration into:

```ts
private async stepInstruction(commandRef = { current: "" }): Promise<"running" | "stopped"> {
  const currentInstruction = this.getCurrentInstruction();
  const { op, result, operand1, operand2 } = currentInstruction;
  // existing switch/if chain body
  // return "stopped" for CALL STOP, otherwise "running"
}
```

Then make `execute()`:

```ts
public async execute(commandRef = { current: "" }): Promise<void> {
  this.resetRuntimeState();
  this.indexLabels();
  this.initializeAtMain();

  while (this.reading()) {
    const status = await this.stepInstruction(commandRef);
    if (status === "stopped") break;
  }
}
```

**Step 5: Run preservation tests**

Run:

```bash
cd compiler
npm test -- src/tests/interpreter/debug-execution-core.spec.ts src/tests/grammar/type-semantics.spec.ts
```

Expected: PASS.

**Step 6: Commit**

```bash
git add compiler/src/interpreter/index.ts compiler/src/tests/interpreter/debug-execution-core.spec.ts
git commit -m "refactor: isolate interpreter instruction stepping"
```

---

### Task 5: Add Debug Session Types And Start/Continue

**Files:**
- Modify: `compiler/src/interpreter/index.ts`
- Modify: `compiler/src/interpreter/constants.ts`
- Test: `compiler/src/tests/interpreter/debug-session.spec.ts`

**Step 1: Write failing tests**

Create `compiler/src/tests/interpreter/debug-session.spec.ts`:

```ts
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
```

**Step 2: Run test to verify it fails**

Run:

```bash
cd compiler
npm test -- src/tests/interpreter/debug-session.spec.ts
```

Expected: FAIL because debug APIs do not exist.

**Step 3: Add exported debug types**

In `compiler/src/interpreter/constants.ts`:

```ts
export type DebugStatus = "idle" | "running" | "paused" | "waiting-for-input" | "completed" | "error";
export type DebugStopReason = "entry" | "breakpoint" | "step" | "input" | "completed" | "error" | "stopped";

export interface DebugVariableSnapshot {
  name: string;
  type: string;
  value: unknown;
  scope: "global" | "local";
}

export interface DebugCallFrameSnapshot {
  name: string;
  returnAddress: number;
}

export interface DebugSnapshot {
  status: DebugStatus;
  stopReason: DebugStopReason | null;
  instructionPointer: number;
  currentSource: SourceLocation | null;
  variables: DebugVariableSnapshot[];
  callStack: DebugCallFrameSnapshot[];
  error: string | null;
}
```

**Step 4: Add start and continue APIs**

In `Interpreter`:

```ts
private debugBreakpoints = new Set<number>();
private debugStatus: DebugStatus = "idle";
private debugStopReason: DebugStopReason | null = null;
private lastDebugError: string | null = null;

public startDebug(options: { breakpoints?: number[] } = {}): DebugSnapshot {
  this.resetRuntimeState();
  this.indexLabels();
  this.initializeAtMain();
  this.debugBreakpoints = new Set(options.breakpoints ?? []);
  this.debugStatus = "paused";
  this.debugStopReason = "entry";
  this.lastDebugError = null;
  return this.getDebugSnapshot();
}

public async continueDebug(commandRef = { current: "" }): Promise<DebugSnapshot> {
  this.debugStatus = "running";
  while (this.reading()) {
    const instruction = this.getCurrentInstruction();
    if (instruction.source && this.debugBreakpoints.has(instruction.source.line)) {
      this.debugStatus = "paused";
      this.debugStopReason = "breakpoint";
      return this.getDebugSnapshot();
    }

    const result = await this.stepInstruction(commandRef);
    if (result === "stopped") {
      this.debugStatus = "completed";
      this.debugStopReason = "completed";
      return this.getDebugSnapshot();
    }
  }
  this.debugStatus = "completed";
  this.debugStopReason = "completed";
  return this.getDebugSnapshot();
}
```

Avoid immediately re-stopping on the same breakpoint after the user resumes from
that exact line. Track the last stopped instruction pointer and skip it once.

**Step 5: Add snapshots**

Implement:

```ts
public getDebugSnapshot(): DebugSnapshot
private getCurrentSource(): SourceLocation | null
private getVariableSnapshots(): DebugVariableSnapshot[]
private getCallStackSnapshots(): DebugCallFrameSnapshot[]
```

**Step 6: Run tests**

Run:

```bash
cd compiler
npm test -- src/tests/interpreter/debug-session.spec.ts src/tests/interpreter/debug-execution-core.spec.ts
```

Expected: PASS.

**Step 7: Commit**

```bash
git add compiler/src/interpreter/constants.ts compiler/src/interpreter/index.ts compiler/src/tests/interpreter/debug-session.spec.ts
git commit -m "feat: add interpreter debug session"
```

---

### Task 6: Implement Step Into, Step Over, Step Out, Stop

**Files:**
- Modify: `compiler/src/interpreter/index.ts`
- Test: `compiler/src/tests/interpreter/debug-session.spec.ts`

**Step 1: Add failing tests**

Append tests:

```ts
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
```

**Step 2: Run test to verify it fails**

Run:

```bash
cd compiler
npm test -- src/tests/interpreter/debug-session.spec.ts
```

Expected: FAIL because step APIs do not exist.

**Step 3: Add source-step helpers**

Implement helpers:

```ts
private getCallDepth(): number {
  return this.callStack.length;
}

private isDifferentSourceLine(previous: SourceLocation | null, next: SourceLocation | null): boolean {
  if (!next) return false;
  if (!previous) return true;
  return previous.line !== next.line || previous.statementId !== next.statementId;
}
```

**Step 4: Implement step APIs**

Add:

```ts
public async stepIntoDebug(commandRef = { current: "" }): Promise<DebugSnapshot>
public async stepOverDebug(commandRef = { current: "" }): Promise<DebugSnapshot>
public async stepOutDebug(commandRef = { current: "" }): Promise<DebugSnapshot>
public stopDebug(): DebugSnapshot
```

Use source-line changes and call depth:

- Step into: execute at least one instruction, stop when source changes.
- Step over: remember starting depth, stop when source changes and depth is
  less than or equal to starting depth.
- Step out: remember starting depth, stop when depth is less than starting
  depth and source is available.
- Stop: set status `idle`, stop reason `stopped`.

**Step 5: Run focused tests**

Run:

```bash
cd compiler
npm test -- src/tests/interpreter/debug-session.spec.ts
```

Expected: PASS.

**Step 6: Run compiler tests**

Run:

```bash
cd compiler
npm test
```

Expected: PASS.

**Step 7: Commit**

```bash
git add compiler/src/interpreter/index.ts compiler/src/tests/interpreter/debug-session.spec.ts
git commit -m "feat: add source-level debug stepping"
```

---

### Task 7: Handle Runtime Errors And Input Waits In Debug Mode

**Files:**
- Modify: `compiler/src/interpreter/index.ts`
- Modify: `compiler/src/interpreter/runtime-error.ts` if needed
- Test: `compiler/src/tests/interpreter/debug-session.spec.ts`

**Step 1: Add failing tests**

Append:

```ts
it("returns an error snapshot when runtime execution fails", async () => {
  const interpreter = createInterpreter(`
int main() {
  int x = 1 / 0;
  print(x);
}
`);

  interpreter.startDebug();
  const snapshot = await interpreter.continueDebug();

  expect(snapshot.status).toBe("error");
  expect(snapshot.stopReason).toBe("error");
  expect(snapshot.currentSource?.line).toBe(3);
  expect(snapshot.error).toMatch(/error|runtime|zero|division/i);
});

it("keeps variables in snapshots", async () => {
  const interpreter = createInterpreter(`
int main() {
  int x = 4;
  print(x);
}
`);

  interpreter.startDebug({ breakpoints: [4] });
  const snapshot = await interpreter.continueDebug();

  expect(snapshot.variables).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ name: "x", value: 4 }),
    ]),
  );
});
```

**Step 2: Run test to verify it fails**

Run:

```bash
cd compiler
npm test -- src/tests/interpreter/debug-session.spec.ts
```

Expected: FAIL if errors escape instead of becoming debug snapshots or if
variables are not exposed.

**Step 3: Convert debug runtime errors to snapshots**

Wrap debug stepping loops in `try/catch`. For `RuntimeError`, set:

```ts
this.debugStatus = "error";
this.debugStopReason = "error";
this.lastDebugError = error.message;
```

Then return `getDebugSnapshot()`. Preserve normal `execute()` throwing behavior.

**Step 4: Model input waits**

If `stdin` is pending, let debug APIs return `waiting-for-input`. Keep the
existing stdin promise behavior, but store a pending resolver so the IDE can
submit input. Add a public method:

```ts
public provideDebugInput(value: string): void
```

If full input wait support is too large for this slice, commit error/variables
first and leave the input test skipped with a `TODO` only if the user agrees.

**Step 5: Run tests**

Run:

```bash
cd compiler
npm test -- src/tests/interpreter/debug-session.spec.ts
```

Expected: PASS for non-skipped tests.

**Step 6: Commit**

```bash
git add compiler/src/interpreter/index.ts compiler/src/interpreter/runtime-error.ts compiler/src/tests/interpreter/debug-session.spec.ts
git commit -m "feat: expose debug errors and variable snapshots"
```

---

### Task 8: Add IDE Debug Session Hook

**Files:**
- Create: `ide/src/hooks/useDebugSession.ts`
- Test: `ide/src/hooks/useDebugSession.spec.ts`

**Step 1: Write failing hook tests**

Create `ide/src/hooks/useDebugSession.spec.ts` using existing Vitest/React test
patterns in the repo. Mock compiler imports and assert the hook calls
`startDebug`, `continueDebug`, `stepIntoDebug`, `stepOverDebug`, and
`stepOutDebug`.

Core expectation:

```ts
expect(result.current.snapshot?.status).toBe("paused");
expect(result.current.output).toContain("1");
```

**Step 2: Run test to verify it fails**

Run:

```bash
cd ide
npm test -- src/hooks/useDebugSession.spec.ts
```

Expected: FAIL because the hook does not exist.

**Step 3: Implement `useDebugSession`**

The hook should accept:

```ts
type UseDebugSessionOptions = {
  breakpoints: number[];
  locale?: string;
  grammar?: IDEGrammarConfig;
  operatorWordMap?: OperatorWordMap;
  statementTerminatorLexeme?: string;
  onCurrentLineChange?: (line: number | null) => void;
};
```

Expose:

```ts
{
  snapshot,
  output,
  error,
  isStale,
  boundBreakpoints,
  unboundBreakpoints,
  start,
  continueExecution,
  stepInto,
  stepOver,
  stepOut,
  stop,
  restart,
  provideInput,
}
```

Compile with the same lexer and `TokenIterator` setup used by
`useLexerAnalyse` and `useIntermediatorCode`.

**Step 4: Run focused tests**

Run:

```bash
cd ide
npm test -- src/hooks/useDebugSession.spec.ts
```

Expected: PASS.

**Step 5: Commit**

```bash
git add ide/src/hooks/useDebugSession.ts ide/src/hooks/useDebugSession.spec.ts
git commit -m "feat: add IDE debug session hook"
```

---

### Task 9: Extend Editor Debug Decorations

**Files:**
- Modify: `ide/src/contexts/editor/useDebugger.ts`
- Modify: `ide/src/contexts/editor/EditorContext.tsx`
- Modify: `ide/src/@types/editor.ts`
- Modify: `ide/src/styles/globals.css`
- Test: `ide/src/contexts/editor/useDebugger.spec.tsx`

**Step 1: Write failing tests**

Create a focused test that mocks Monaco decoration collections and asserts:

- breakpoint glyph decorations still render
- `setCurrentDebugLine(4)` creates a whole-line current-line decoration
- `clearCurrentDebugLine()` removes it

**Step 2: Run test to verify it fails**

Run:

```bash
cd ide
npm test -- src/contexts/editor/useDebugger.spec.tsx
```

Expected: FAIL because current-line decoration APIs do not exist.

**Step 3: Add current-line API**

Extend `useDebugger` return value:

```ts
setCurrentDebugLine(lineNumber: number | null): void
clearCurrentDebugLine(): void
```

Use a separate decoration collection from breakpoint decorations. Add classes:

```css
.monaco-editor .monaco-current-debug-line {
  background: rgba(34, 197, 94, 0.16);
}

.monaco-editor .monaco-current-debug-line-glyph::before {
  content: "";
  display: block;
  width: 0;
  height: 0;
  margin: 5px auto 0;
  border-top: 5px solid transparent;
  border-bottom: 5px solid transparent;
  border-left: 8px solid rgb(34, 197, 94);
}
```

Expose the functions through `EditorContext`.

**Step 4: Run tests**

Run:

```bash
cd ide
npm test -- src/contexts/editor/useDebugger.spec.tsx
```

Expected: PASS.

**Step 5: Commit**

```bash
git add ide/src/contexts/editor/useDebugger.ts ide/src/contexts/editor/EditorContext.tsx ide/src/@types/editor.ts ide/src/styles/globals.css ide/src/contexts/editor/useDebugger.spec.tsx
git commit -m "feat: highlight current debug line in editor"
```

---

### Task 10: Replace Source-Control Sidebar With Debug UI

**Files:**
- Modify: `ide/src/views/ide/components/side-menu.tsx`
- Modify: `ide/src/views/ide/components/side-explorer/sidebar-panel.tsx`
- Create: `ide/src/views/ide/components/side-explorer/debug-panel.tsx`
- Modify: `ide/src/views/ide/components/side-menu.spec.tsx`
- Test: `ide/src/views/ide/components/side-explorer/debug-panel.spec.tsx`

**Step 1: Write failing tests**

Update `side-menu.spec.tsx` so it expects a debug button instead of source
control. Create a debug-panel test that renders controls and breakpoint lines.

Assertions:

```ts
expect(screen.getByRole("button", { name: /start debug/i })).toBeInTheDocument();
expect(screen.getByText(/breakpoints/i)).toBeInTheDocument();
expect(screen.getByText(/line 3/i)).toBeInTheDocument();
```

**Step 2: Run tests to verify they fail**

Run:

```bash
cd ide
npm test -- src/views/ide/components/side-menu.spec.tsx src/views/ide/components/side-explorer/debug-panel.spec.tsx
```

Expected: FAIL.

**Step 3: Change sidebar view type**

In `sidebar-panel.tsx`, replace `"source-control"` with `"debug"`.

In `side-menu.tsx`, replace `GitBranch` with `Bug` or `BugPlay` from
`lucide-react`, set tooltip to `"Debug"`, and call
`handleViewClick("debug")`.

**Step 4: Implement `DebugPanel`**

Render:

- start/continue/step over/step into/step out/restart/stop icon buttons
- status text
- breakpoint list from `selectedDebugLines`
- variables list from snapshot
- call stack list from snapshot
- debug output console
- runtime error block

Use existing button/icon patterns. Keep cards to actual repeated items only.

**Step 5: Run tests**

Run:

```bash
cd ide
npm test -- src/views/ide/components/side-menu.spec.tsx src/views/ide/components/side-explorer/debug-panel.spec.tsx
```

Expected: PASS.

**Step 6: Commit**

```bash
git add ide/src/views/ide/components/side-menu.tsx ide/src/views/ide/components/side-explorer/sidebar-panel.tsx ide/src/views/ide/components/side-explorer/debug-panel.tsx ide/src/views/ide/components/side-menu.spec.tsx ide/src/views/ide/components/side-explorer/debug-panel.spec.tsx
git commit -m "feat: add IDE debug sidebar"
```

---

### Task 11: Wire Debug Panel Into IDE State

**Files:**
- Modify: `ide/src/views/ide/index.tsx`
- Modify: `ide/src/views/ide/components/side-explorer/sidebar-panel.tsx`
- Modify: `ide/src/views/ide/components/side-explorer/debug-panel.tsx`
- Modify: `ide/src/hooks/useDebugSession.ts`
- Test: `ide/src/views/ide/components/side-explorer/debug-panel.spec.tsx`

**Step 1: Write failing integration behavior test**

Test that clicking start calls the hook with selected breakpoints and updates
current-line decoration via context.

**Step 2: Run test to verify it fails**

Run:

```bash
cd ide
npm test -- src/views/ide/components/side-explorer/debug-panel.spec.tsx
```

Expected: FAIL.

**Step 3: Pass debug dependencies down**

In `IDE`, read from `EditorContext`:

```ts
const {
  selectedDebugLines,
  getEditorCode,
  setCurrentDebugLine,
  clearCurrentDebugLine,
} = useContext(EditorContext);
```

Pass required values to `SidebarPanel`, and from there to `DebugPanel`.

**Step 4: Mark sessions stale after edits**

In `useDebugSession`, store the source string used to start the session. If the
latest `getEditorCode()` differs, expose `isStale: true`. Restart recompiles.

**Step 5: Keep normal Run All separate**

Do not modify `runAll` behavior except where type changes require it. Debug
start should not call `setIsTerminalOpen(true)`.

**Step 6: Run IDE tests**

Run:

```bash
cd ide
npm test -- src/hooks/useDebugSession.spec.ts src/views/ide/components/side-explorer/debug-panel.spec.tsx src/views/ide/components/side-menu.spec.tsx
```

Expected: PASS.

**Step 7: Commit**

```bash
git add ide/src/views/ide/index.tsx ide/src/views/ide/components/side-explorer/sidebar-panel.tsx ide/src/views/ide/components/side-explorer/debug-panel.tsx ide/src/hooks/useDebugSession.ts ide/src/views/ide/components/side-explorer/debug-panel.spec.tsx
git commit -m "feat: wire debugger into IDE"
```

---

### Task 12: Final Verification And Cleanup

**Files:**
- Modify only files needed for fixes found during verification.

**Step 1: Run compiler tests**

Run:

```bash
cd compiler
npm test
```

Expected: PASS.

**Step 2: Run IDE tests**

Run:

```bash
cd ide
npm test
```

Expected: PASS.

**Step 3: Run type builds**

Run:

```bash
cd compiler
npm run build
```

Expected: PASS.

Run:

```bash
cd ide
npm run build
```

Expected: PASS.

**Step 4: Manual smoke test**

Run:

```bash
cd ide
npm run dev
```

Open the local app, then verify:

- clicking the debug icon opens the debug panel
- gutter breakpoints appear and remain after opening the debug panel
- start debug compiles current code and pauses at entry or breakpoint
- continue stops on a breakpoint inside a loop on repeated visits
- step into enters a user function
- step over skips a user function body
- step out returns to the caller
- runtime errors highlight source and intermediate instruction
- normal Run All still opens/runs the terminal

**Step 5: Commit cleanup fixes**

If verification required fixes:

```bash
git add <changed-files>
git commit -m "fix: stabilize debugger integration"
```

If no fixes were needed, do not create an empty commit.
