# Structured execution flowchart design

## Intent

Make execution understandable to programming students. The existing IR-level graph
shows every instruction and control-flow edge, which is accurate but visually dense.

## Goals

- Make sequence, decisions, loop re-entry, and function boundaries readable at a glance.
- Keep the rendered execution path faithful to the compiler/interpreter.
- Retain raw IR as an inspectable fallback rather than removing it.

## Non-goals

- This is not a visual programming editor or a code-generation feature.
- It does not represent a loop as a tree by duplicating execution nodes.
- It does not evaluate source expressions in the UI.

## Approaches

| Approach | Tradeoff |
| --- | --- |
| Tree | Clear nesting, but cannot faithfully show loop re-entry and branch convergence without duplication. |
| Raw instruction graph | Faithful to IR, but too dense for student-first reading. |
| Structured flowchart (selected) | Uses a compact flowchart as the default and lets students expand a node into its IR. It needs compiler source metadata for higher-level grouping. |

## Design

The default execution view is a structured flowchart: rounded operation nodes,
diamonds for decisions, and explicit backward loop edges. A flowchart node groups
one or more instructions when compiler metadata can prove that they belong to one
student operation. Until that metadata is available, it uses a compact per-
instruction flowchart with labels and instructions hidden behind selection details.

The current Flowchart tab will be redesigned around this model. A separate
Structure tab may show the nested source/statement tree, but it is explicitly not
the execution view. The existing Instructions tab remains the exact IR fallback.

The execution cursor highlights the next node. The graph layout is computed only
when the compiled artifact or structural view changes, not for cursor updates.

## Implementation calls

- Continue using React Flow and Dagre already present in the IDE.
- Add compiler operation metadata before collapsing IR into source statements.
- Keep stable compiler instruction IDs and use runtime events for repeated visits.
