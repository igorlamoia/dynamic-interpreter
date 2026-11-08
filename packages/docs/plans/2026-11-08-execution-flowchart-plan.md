# Student Execution Flowchart Plan

Date: 2026-11-08
Branch: `graph-tree-flow`
Status: agreed product direction; proposed implementation details below.
Scope of this change: document the plan only.

## Intent and agreed direction

Help students learning programming visualize what happens while the interpreter
executes their program. Students should be able to predict the next operation,
follow a chosen branch, watch a loop repeat, and explain why a variable changed.

The agreed direction is an expandable execution flowchart: readable operations
first, intermediate instructions available on demand, synchronized with the
existing debugger and runtime values. Delivery proceeds from a static graph to
debugger integration, paced execution, teaching explanations, and student validation.
Programming by editing a flowchart is a separate future project.

## Approaches considered

| Approach | Benefit | Tradeoff |
| --- | --- | --- |
| One node per intermediate instruction | Direct correspondence with interpreter execution | Temporaries, labels, and jumps can overwhelm beginners |
| High-level flowchart only | Familiar assignments, decisions, loops, and input/output | Hides how the compiler translates those operations |
| Expandable flowchart, selected | Connects readable operations to their intermediate instructions | Requires reliable grouping and mapping between both levels |

A tree can describe nested syntax, but execution includes backward loop edges,
branch convergence, and calls. A directed graph is the primary representation.

## Goals and boundaries

- Show the next operation, the operation just executed, and the actual path taken.
- Explain evaluated decisions and changes to variables.
- Support manual stepping, slow playback, pause, stop, and restart.
- Connect nodes to source locations and expandable intermediate instructions.
- Preserve existing source-level debugging and ordinary fast execution.
- Preserve custom language settings and all supported IDE locales.
- Keep the diagram stable while execution advances.

This project does not add a visual programming editor, diagram-to-code generation,
reverse execution, a second interpreter, or a full syntax-tree compiler rewrite.
Do not claim that earlier array positions executed, invent values by evaluating
source expressions in the UI, or silently present an old program as current.

## Current implementation

Paths in this document are relative to `packages/`.

| Area | Existing implementation | Implication |
| --- | --- | --- |
| IR generation | `compiler/src/token/TokenIterator.ts`, `compiler/src/ir/emitter.ts` | Parser emits an `Instruction[]` directly; retain it as executable IR |
| Instruction and snapshot types | `compiler/src/interpreter/constants.ts` | Instructions have optional source metadata; snapshots expose pointer, variables, and call stack |
| Execution | `compiler/src/interpreter/index.ts` | Normal and debug execution share private `stepInstruction`; source steps can execute several IR instructions |
| Debug session | `ide/src/hooks/useDebugSession.ts` | Compiles its own program and publishes snapshots when debug commands finish |
| Normal compilation | `ide/src/hooks/useIntermediatorCode.ts` | Supplies the separately compiled array shown by the current IR panel |
| Normal execution | `ide/src/components/terminal/body.tsx` | Receiving new instructions can automatically start execution |
| IR panel | `ide/src/views/tokens/list-intermediate-code.tsx` | Lists instructions; error coloring currently treats preceding indices as a prefix |
| IDE layout | `ide/src/views/ide/index.tsx`, `components/main-section.tsx` | Analysis panels are below the workspace; debugger and editor already share state |
| Graph tooling | `ide/src/features/grammarGraph/` | React Flow and Dagre are already installed and used |

The first integration issue is program identity: the graph must display the exact
instruction array owned by the active execution session. Copying debug instructions
into the terminal's auto-run prop would accidentally execute the program again.

## Proposed design decisions

These are implementation recommendations, rather than additional user requirements.

### Graph and compilation model

Create a pure compiler-side graph builder under `compiler/src/ir/`. Initially,
represent each instruction with its index and explicit control-flow edges. Keep
rendering, colors, layout, and React dependencies in the IDE.

- Ordinary instructions fall through to the next instruction where valid.
- `IF` reads its condition from `result`; true and false targets are `operand1`
  and `operand2`. Preserve both edge identities even if they share a target.
- `JUMP` targets the label named by `result`.
- `RETURN` terminates the current function; it never falls through into the next.
- Built-in `PRINT` and `SCAN` calls continue normally; `STOP` terminates execution.
- User calls identify the callee and the continuation separately. A return edge
  during execution comes from the real call frame, not every possible caller.
- Missing targets produce a graph diagnostic; they must not produce a guessed edge.

Use compilation identity plus instruction index for instruction IDs. Keep runtime
visit identity separate: the same instruction can execute many times. Introduce
explicit function ownership metadata before relying on function-level grouping;
do not distinguish function labels from synthetic labels by spelling alone.

Student nodes retain a mapping to every underlying instruction. In the teaching
phase, add statement IDs, source ranges, and operation kinds at compiler emit sites
as needed. Line numbers alone cannot distinguish multiple statements on one line
or a loop's initialization, condition, and update. Preserve a raw instruction
fallback when reliable grouping is unavailable.

### Execution state and evidence

Keep one interpreter for each active execution session. Expose the session's
compiled artifact, including source/configuration identity, to the graph. Retain
separate state for inspecting a node and following the execution cursor.

Use these meanings consistently:

- **Next:** instruction that will execute when stepping resumes.
- **Executed:** instruction that successfully completed most recently.
- **Taken edge:** actual transition recorded by the interpreter.
- **Error:** attempted instruction failed; do not mark it completed.
- **Completed:** no next instruction, even if the internal pointer still has a value.

Add optional execution events to the shared instruction core. Events should carry
session ID, sequence number, executed and next instruction indices when applicable,
transition kind, frame identity, variable changes, and evaluated branch evidence.
Capture operands at execution time; never re-evaluate expressions for display.
Represent waiting, input consumption, completion, and failure explicitly.

Frame identities must distinguish recursion and shadowed variables. Variable
changes identify frame/scope/name, including declarations and array changes.
Detach captured values from mutable runtime objects and bound large-value previews.
Store only a bounded recent trace (initial proposal: 1,000 events), with explicit
history truncation. This trace supports explanations, not reverse execution.

### Stepping and playback

Expose instruction stepping through the existing execution core while preserving
Step Into, Step Over, and Step Out semantics. Before teaching groups exist, pace
one instruction at a time. Later, default to one student operation per step and
provide instruction stepping in the expanded view.

For grouped stepping, stop at a group boundary, call transition, input wait,
breakpoint, error, or completion. A loop re-entry is a new visit even if it maps to
the same node. Apply a bounded instruction budget and yield to the browser so an
unusual group or tight loop cannot prevent Pause from taking effect.

Playback is an explicit teaching mode with an initial proposed speed range of
0.5, 1, 2, and 4 operations per second. Await each step and yield between updates.
Serialize execution commands; ignore or disable incompatible actions while a step
is pending. Use a session generation token to discard results from stopped or
restarted sessions. Pause cancels scheduling; Stop ends the session; Restart
recompiles and clears its execution evidence.

Normal Run remains fast and need not animate every operation. Debug Continue can
record bounded transitions but need not repaint every instruction. Slow playback
is the mode that guarantees each visible student operation gets time on screen.

An input instruction pauses until terminal input arrives. Submitting input must
not call unrestricted Continue while paced playback owns execution. Resume under
the same controller without executing the input twice or skipping visible steps.

### Presentation and lifecycle

Proposed desktop arrangement:

```text
+---------------------+----------------------------+
| Source editor       | Execution flowchart        |
| current source line | function / follow toggle   |
|                     | current node + taken edge  |
+---------------------+----------------------------+
| Next | Play/Pause | speed | Stop | Restart        |
| Variable changes / selected operation / IR       |
| Existing terminal output and input               |
+--------------------------------------------------+
```

Integrate an optional flowchart pane beside the editor, with tabs on narrow screens.
Keep the existing instruction list as an inspection option. Use rectangles for
operations, diamonds for conditions, and distinct input/output and entry/exit nodes.
Show a true/false result and variable changes in text, not color alone. Support
keyboard selection, reduced motion, zoom controls, and a textual execution status.

Keep layout stable across snapshots. Recompute layout only for a new graph or a
structural view change. Preserve pan/zoom, provide an explicit Follow toggle, and
show a single function by default with navigation through the active call stack.

Source edits, active-file changes, and effective language-config changes mark the
session stale and pause playback. Preserve the last graph with a stale notice;
require Restart before continuing. Source navigation must not highlight changed
text as though it were the original compiled source. Compilation failure keeps
diagnostics visible and leaves no executable graph for the failed artifact.

## Implementation phases

### Phase 1: Accurate static graph

1. Add `compiler/src/ir/control-flow.ts` and graph types with explicit successors,
   label resolution, call annotations, and diagnostics.
2. Add `compiler/src/tests/ir/control-flow.spec.ts` using compiled fixtures for
   straight-line code, both conditional paths, loops, break/continue, switch,
   calls/returns, input/output, and termination.
3. Add `ide/src/features/executionGraph/` with an adapter, canvas, and node details.
   Reuse React Flow/Dagre patterns without coupling to the grammar graph's model.
4. Integrate a read-only graph/list choice into the intermediate-code panel.
   Give labels and operands deterministic formatting and visible source links.

Acceptance: every displayed edge agrees with interpreter control flow; a counting
loop visibly returns to its condition; unreachable instructions are not labeled
as executed. Function boundaries do not introduce accidental fallthrough.

### Phase 2: Synchronize with the existing debugger

1. Extend `ide/src/hooks/useDebugSession.ts` to expose the exact compiled artifact
   and session identity. Keep display data separate from the terminal run trigger.
2. Wire the graph to debug snapshots in `ide/src/views/ide/index.tsx` and place the
   optional pane through `components/main-section.tsx`.
3. Map the pointer to the next node; support start, step, breakpoint, input wait,
   completion, stop, error, restart, and stale-source states.
4. Connect source selection and existing variable/call-stack inspection. Do not
   infer historical edges between source-level snapshots that skip instructions.
5. Add hook and integration tests for session ownership, stale state, and the
   absence of duplicate terminal execution.

Acceptance: editor, graph, variables, and call stack agree at each debug stop,
including after recompiling a different program. Merely viewing the graph does
not execute it.

### Phase 3: Real execution events and paced playback

1. Extend `compiler/src/interpreter/constants.ts` and `index.ts` with optional
   event capture and public instruction stepping using the existing core.
2. Add focused interpreter tests for actual branch evidence, repeated loop visits,
   calls/recursion, errors, waiting/input consumption, and normal/debug equivalence.
3. Extend the session hook with a serialized playback controller, bounded trace,
   speed selection, cancellation, and guards against stale async completions.
4. Update terminal input handling in `ide/src/components/terminal/body.tsx` so
   visual execution resumes through its controller.
5. Add `ExecutionPlaybackControls.tsx` and fake-timer tests covering pause, stop,
   restart during a pending step, and input submission during playback.

Acceptance: a loop animates its actual iterations; Pause leaves execution at a
known boundary; restart discards old events; input/output occurs exactly once;
normal Run retains its existing output and errors without animation overhead
when tracing is disabled.

### Phase 4: Student-friendly operations and explanations

1. Extend emitter metadata and relevant `compiler/src/grammar/syntax/` emit sites
   with function ownership, statement/operation identity, and usable source ranges.
   Cover conditions, loop phases, assignments, I/O, and calls before grouping them.
2. Add an operation-group adapter with instruction-to-node mappings and expand/
   collapse support. Preserve raw instructions as the faithful fallback.
3. Make Next and playback use operation boundaries by default. Preserve existing
   source-level debugger controls and offer explicit instruction stepping.
4. Add actual condition evaluations, scoped variable changes, and failure details.
   Link them to source text from the compiled artifact and expand IR on demand.
5. Add translated UI strings under `ide/src/i18n/locales/` and accessibility checks.

Acceptance: `count: 1 -> 2` and `2 < 3 -> true` reflect captured execution; several
statements on one line remain distinct; repeated condition visits are observable;
expanding a node reveals the exact instructions responsible for its behavior.

### Phase 5: End-to-end and student validation

1. Add `e2e/specs/execution-flowchart.e2e.ts` covering a conditional, counting loop,
   input, a user function call, runtime error, edit/restart, and narrow layout.
2. Exercise large graphs and long loops. Confirm bounded trace memory, responsive
   pause, stable layout, and safe truncation of array/value previews.
3. Validate at least one custom-keyword language and each supported UI locale.
4. Ask students to predict the next node, explain a changed variable, explain why
   a loop ended, and connect a node to source/IR. Record confusing labels and paths.
5. Adjust explanations based on observations before expanding the feature scope.

Acceptance: automated scenarios preserve program behavior; observed student
confusion is documented and addressed. Student validation is a later human activity,
not something automated tests can establish.

## Verification during implementation

Run checks from the indicated package directory; new paths below are planned files.

| Directory | Command | Purpose |
| --- | --- | --- |
| `compiler/` | `npm.cmd exec vitest -- run src/tests/ir/control-flow.spec.ts src/tests/interpreter/debug-execution-core.spec.ts src/tests/interpreter/debug-session.spec.ts src/tests/grammar/debug-source-metadata.spec.ts` | Graph, execution, and metadata regressions; append new execution-event specs |
| `ide/` | `npm.cmd run test -- src/features/executionGraph src/hooks/useDebugSession.spec.ts src/views/ide/ide-debug-sidebar.spec.tsx src/components/terminal/body.spec.tsx` | Rendering, session ownership, playback, and input integration |
| `compiler/` and `ide/` | `npm.cmd exec tsc -- --noEmit` | Type compatibility in each affected package |
| `e2e/` | `npm.cmd run test -- specs/execution-flowchart.e2e.ts specs/ide-compiler.e2e.ts` | Browser behavior with the repository's configured test services running |

Add edge-case tests where each behavior is introduced. Compare output, input
consumption, error behavior, and final observable values across normal, debug,
and visual execution. Follow the repository's applicable checks when implementing;
these commands describe future verification and were not run for this document.

## Delivery and deferred work

Deliver in phase order. Phase 1 establishes graph correctness; Phase 2 is the first
debugger-connected milestone; Phases 3 and 4 provide the agreed teaching experience.
Phase 5 validates that experience. Exact component boundaries, spacing, icons, and
event storage implementation are left to the implementer within these constraints.

After student validation, separately explore editable flowcharts, structured node
validation, persistence, and code generation. Do not introduce editable graph state
or promise lossless code/diagram round-tripping in this implementation.
