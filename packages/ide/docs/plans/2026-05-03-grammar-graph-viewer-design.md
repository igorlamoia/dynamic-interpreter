# Grammar Graph Viewer Design

## Context

The compiler package exports library-agnostic AST grammar graph data from
`packages/compiler/src/grammar/ast/grammarGraph.ts`. The IDE needs an
embeddable graph viewer component that can visualize that real compiler graph
inside keyword customizer flows, starting with the review step.

The viewer should use React Flow with an automatic left-to-right layout. The
implementation must import `grammarGraph` directly from the compiler source,
derive frontend state without mutating it, and keep the graph-library adapter
isolated so the rendering layer can be replaced later.

## Approved Approach

Use a current-mode graph with dimmed alternatives.

The component receives the currently selected keyword customizer modes and
renders the reachable grammar graph from `grammarGraph.start`. Nodes and edges
that match the selected modes are active. Nodes and edges that only apply to
non-selected modes remain visible with lower opacity. This keeps the selected
language configuration clear while preserving context for alternative grammar
paths.

## Architecture

`ide/src/components/Ast.tsx` is the public embeddable component. It should not
read keyword customizer context directly. Callers pass selected modes as props,
which allows the same viewer to be reused by the review step or future steps.

Supporting files live under `ide/src/features/grammarGraph/`:

- `grammarGraphAdapter.ts`: imports `grammarGraph`, converts compiler nodes and
  edges into derived graph view data and React Flow-compatible nodes and edges.
- `GrammarGraphCanvas.tsx`: owns React Flow rendering, custom nodes, edge
  labels, controls, minimap, and layout output.
- `GrammarGraphToolbar.tsx`: owns search, section filter, kind filter, and mode
  controls.
- `GrammarGraphDetailsPanel.tsx`: owns selected node details.
- `grammarGraphStyles.ts`: owns group colors, kind styles, dimensions, and
  layout constants.

`Ast.tsx` should expose props such as `selectedModes`, `height`, `showToolbar`,
and `className`.

## Data Flow

`Ast.tsx` receives selected modes in compiler graph names:

```ts
{
  typingMode: "typed" | "untyped",
  blockMode: "delimited" | "indentation",
  semicolonMode: "optional-eol" | "required",
  arrayMode: "fixed" | "dynamic"
}
```

The keyword customizer review step maps its existing mode names to these graph
mode names:

- `typing` to `typingMode`
- `block` to `blockMode`
- `semicolon` to `semicolonMode`
- `array` to `arrayMode`

The adapter derives, without mutating `grammarGraph`:

- all nodes and edges
- sections and options
- the start node id
- node lookup maps
- section membership by node id

Filter state includes search text, selected section, selected node kinds, and
mode display behavior. Graph items with no mode guard are always active. Items
whose mode guards match the selected modes are active. Items whose mode guards
conflict with selected modes remain visible but dimmed by default.

Search matches node id or label. Search results may highlight matching nodes and
narrow the visible graph. The graph starts from `grammarGraph.start` for layout
and default focus.

## Graph Behavior

React Flow renders the graph with Dagre left-to-right layout. Layout uses stable
dimensions by node kind:

- `nonterminal`: primary grammar node with label, id, group accent, and
  production count.
- `terminal`: compact token node.
- `option` and `mode`: metadata node style, if present in graph data.

Edges show compact metadata:

- production id
- optional marker
- repeat marker
- mode tags such as `typingMode=typed`

Mode-guarded edges are visually distinct and dimmed when inactive. Selecting a
node updates the details panel with id, label, kind, group, source, description
when present, and productions.

React Flow controls, minimap, pan, zoom, and fit-view are enabled. The start
node should be easy to identify with a visual badge or highlight.

## Review Step Integration

`ReviewStepProps` receives current grammar modes in `values.grammarModes`.
`buildReviewStepProps()` derives those modes from
`context.draftCustomization.modes`.

`ide/src/components/keyword-customizer/steps/review-step/index.tsx` renders
`<Ast selectedModes={values.grammarModes} />` inside the lower result panel,
near the final language evidence. A good initial placement is between
`TokenPreview` and the "Voltar para editar" section.

## Error Handling and Fallbacks

If filters produce no visible nodes, the canvas area shows an empty state. If a
selected node disappears under filters, the selected node is cleared. If
`selectedModes` is omitted, the viewer shows all graph data without dimming
mode-specific alternatives.

## Testing

Tests should focus on adapter and integration boundaries:

- The adapter converts real `grammarGraph.nodes` and `grammarGraph.edges`, not
  hardcoded sample data.
- Mode compatibility marks matching items active and conflicting items inactive.
- Search matches node id and label.
- Section and kind filters reduce the derived graph correctly.
- `buildReviewStepProps()` maps keyword customizer modes into graph mode names.

Component tests should avoid depending deeply on React Flow internals. Mock the
canvas if needed and assert that `Ast` passes derived graph data and that the
review step renders the graph section with selected modes.
