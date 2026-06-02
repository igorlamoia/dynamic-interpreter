# Source-Level Debugger Design

## Context

The compiler currently emits a typed intermediate instruction array through
`compiler/src/ir/emitter.ts`. Each instruction contains `op`, `result`,
`operand1`, and `operand2`. The interpreter executes that array by advancing an
`instructionPointer`, resolving labels for jumps and calls, and running
`execute()` to completion.

The IDE compiles source through `useIntermediatorCode`, runs the interpreter in
the terminal, and already supports runtime-error instruction highlighting in the
intermediate-code view. Monaco gutter clicks already toggle breakpoint glyphs
and expose `selectedDebugLines` through `EditorContext`.

The source-control sidebar entry is currently a placeholder, so it will become
the debug entry point.

## Recommended Approach

Add source-level debugging to the existing compiler/interpreter flow instead of
creating a separate debug interpreter. Normal execution and debug execution must
share the same execution core so behavior does not drift.

## Compiler And IR

Extend intermediate instructions with optional source metadata:

```ts
type SourceLocation = {
  file?: string;
  line: number;
  column: number;
  endLine?: number;
  endColumn?: number;
  statementId?: string;
};

interface Instruction {
  op: OpName;
  result: string;
  operand1: unknown;
  operand2: unknown;
  source?: SourceLocation;
}
```

The `Emitter` will attach metadata. Grammar code should use helpers such as
`emitFromToken(...)` or `withSource(token, fn)` so individual syntax functions
stay readable.

Source metadata should be added to representative user-visible execution points:
declarations, assignments, condition checks, loop jumps, function calls,
returns, break/continue, switch dispatch, array reads/writes, print, and scan.
Synthetic labels and jumps may carry the nearest source statement, but the
debugger will only treat source-bearing executable instructions as visible stop
points.

## Interpreter Debug API

Refactor the interpreter loop so a single instruction can be executed by a
shared internal method. Keep `execute()` as a run-to-completion wrapper.

Add a debug session API with:

- `startDebug()` initializes labels, scopes, and starts at `main`.
- `continue()` runs until a breakpoint, program end, input wait, or runtime
  error.
- `stepInto()` stops at the next distinct source statement, entering calls.
- `stepOver()` skips over user function calls and stops after the call returns.
- `stepOut()` continues until the current call frame returns.
- `stop()` disposes the session and clears active execution state.
- `getSnapshot()` returns serializable state for the IDE.

Snapshots should include status, stop reason, current instruction pointer,
current source location, call stack, visible variables/scopes, and any runtime
error. Runtime variables currently live in `Map<string, RuntimeSlot>` and call
frames have local scopes, so snapshots should convert those maps to plain arrays.

## Stepping Semantics

Breakpoints are source-line based, matching VS Code behavior. A breakpoint line
resolves to the first executable instruction on that line. If no executable
instruction maps to a breakpoint line, the UI keeps the breakpoint but shows it
as unbound after compile.

Stepping is source-level rather than instruction-level:

- Step Into: run until the next distinct source statement, entering functions.
- Step Over: if a user function call is encountered, continue until the call
  returns to the same or shallower call depth, then stop on the next source
  statement.
- Step Out: continue until the current function returns to its caller.
- Continue: stop on the next enabled breakpoint, runtime error, input wait, or
  program end.
- Restart: recompile the current editor content and start a fresh session.
- Stop: end the session and clear the current-line highlight while preserving
  breakpoints.

Loops naturally revisit the same source lines because execution is still driven
by instruction pointers and labels.

## IDE Design

Replace the source-control sidebar affordance with debugging:

- Change the sidebar view from source control to a debug view.
- Use a debug icon and tooltip in the side menu.
- Add `DebugPanel` under `ide/src/views/ide/components/side-explorer`.
- Show controls for start, continue, step into, step over, step out, restart,
  and stop.
- Show breakpoints, bound/unbound status, call stack, variables, session status,
  and runtime errors.
- Show a debug console or output area in the panel for debug-run output.

The editor debugger hook should support both breakpoint decorations and current
execution-line decorations. The existing terminal run behavior should remain
unchanged. Starting a debug session should not auto-run the normal terminal.

If source changes during debugging, the session becomes stale and the UI should
require restart before continuing.

## Error Handling

Compile errors remain Monaco markers and toasts.

Runtime errors stop the debug session, preserve the existing `RuntimeError`
behavior, include source metadata when available, and highlight both the current
source line and instruction pointer.

Input waits set status to `waiting-for-input`. The debug panel should show an
input field and resume the pending interpreter read when the user submits input.

## Testing

Compiler tests should verify source metadata on representative statements and
loop-generated instructions.

Interpreter tests should cover breakpoint stop, continue, step into, step over,
step out, loop revisits, runtime-error snapshots, and input waits.

IDE tests should cover the sidebar replacement, debug panel controls,
breakpoint list rendering, bound/unbound breakpoint display, and current-line
decoration calls.
