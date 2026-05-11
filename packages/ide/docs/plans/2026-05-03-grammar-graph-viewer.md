# Grammar Graph Viewer Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an embeddable AST grammar graph viewer for the compiler grammar and render it in the keyword customizer review step.

**Architecture:** `ide/src/components/Ast.tsx` is the public component. Grammar graph conversion, filtering, mode compatibility, and React Flow layout live under `ide/src/features/grammarGraph/`, keeping compiler graph data immutable and the graph-library layer replaceable. The review step passes keyword customizer modes into `Ast` instead of letting the graph component read wizard context directly.

**Tech Stack:** Next.js, React 19, TypeScript, Tailwind CSS, Vitest, `@xyflow/react`, `dagre`, compiler `grammarGraph`.

---

### Task 1: Install Graph Dependencies

**Files:**
- Modify: `package-lock.json`
- Modify: `packages/ide/package.json`

**Step 1: Install runtime dependencies**

Run from the repository root:

```bash
npm install --workspace @ts-compilator-for-java/ide @xyflow/react dagre
```

Expected: `packages/ide/package.json` includes `@xyflow/react` and `dagre`.

**Step 2: Install Dagre types if TypeScript needs them**

Run from the repository root only if `dagre` does not provide usable bundled types:

```bash
npm install --workspace @ts-compilator-for-java/ide --save-dev @types/dagre
```

Expected: `packages/ide/package.json` includes `@types/dagre` in `devDependencies` only if needed.

**Step 3: Commit**

```bash
git add package-lock.json packages/ide/package.json
git commit -m "chore: add grammar graph viewer dependencies"
```

---

### Task 2: Add Adapter Types and Mode Compatibility Tests

**Files:**
- Create: `packages/ide/src/features/grammarGraph/grammarGraphAdapter.spec.ts`
- Create: `packages/ide/src/features/grammarGraph/grammarGraphAdapter.ts`

**Step 1: Write the failing tests**

Create `packages/ide/src/features/grammarGraph/grammarGraphAdapter.spec.ts`:

```ts
import { describe, expect, it } from "vitest";
import { grammarGraph } from "@ts-compilator-for-java/compiler/grammar/ast/grammarGraph";
import {
  buildGrammarGraphModel,
  filterGrammarGraphModel,
  isModeCompatible,
  type SelectedGrammarModes,
} from "./grammarGraphAdapter";

const typedDelimitedModes: SelectedGrammarModes = {
  typingMode: "typed",
  blockMode: "delimited",
  semicolonMode: "required",
  arrayMode: "fixed",
};

describe("buildGrammarGraphModel", () => {
  it("uses the real compiler grammar graph", () => {
    const model = buildGrammarGraphModel();

    expect(model.startNodeId).toBe(grammarGraph.start);
    expect(model.nodes.length).toBe(grammarGraph.nodes.length);
    expect(model.edges.length).toBe(grammarGraph.edges.length);
    expect(model.nodeById.get(grammarGraph.start)?.label).toBe("<program>");
  });

  it("maps section membership by node id", () => {
    const model = buildGrammarGraphModel();

    expect(model.sectionByNodeId.get("stmt")).toBe("statements");
    expect(model.sections.map((section) => section.id)).toContain("topLevel");
  });
});

describe("isModeCompatible", () => {
  it("keeps unguarded graph items active", () => {
    expect(isModeCompatible(undefined, typedDelimitedModes)).toBe(true);
  });

  it("marks matching guarded graph items active", () => {
    expect(
      isModeCompatible({ typingMode: "typed" }, typedDelimitedModes),
    ).toBe(true);
  });

  it("marks conflicting guarded graph items inactive", () => {
    expect(
      isModeCompatible({ typingMode: "untyped" }, typedDelimitedModes),
    ).toBe(false);
  });
});

describe("filterGrammarGraphModel", () => {
  it("searches by node id or label", () => {
    const model = buildGrammarGraphModel();

    const byId = filterGrammarGraphModel(model, { search: "stmt" });
    const byLabel = filterGrammarGraphModel(model, { search: "<program>" });

    expect(byId.nodes.some((node) => node.id === "stmt")).toBe(true);
    expect(byLabel.nodes.map((node) => node.id)).toContain("program");
  });

  it("filters by section and kind", () => {
    const model = buildGrammarGraphModel();

    const filtered = filterGrammarGraphModel(model, {
      sectionId: "statements",
      kinds: new Set(["nonterminal"]),
    });

    expect(filtered.nodes.map((node) => node.id)).toEqual(
      expect.arrayContaining(["stmt", "stmtTerminator"]),
    );
    expect(filtered.nodes.every((node) => node.kind === "nonterminal")).toBe(
      true,
    );
  });

  it("keeps conflicting mode items visible but inactive by default", () => {
    const model = buildGrammarGraphModel();

    const filtered = filterGrammarGraphModel(model, {
      selectedModes: typedDelimitedModes,
    });

    const untypedNode = filtered.nodes.find(
      (node) => node.id === "untypedFunctionDecl",
    );
    const untypedEdge = filtered.edges.find(
      (edge) => edge.data.modes?.typingMode === "untyped",
    );

    expect(untypedNode?.active).toBe(false);
    expect(untypedEdge?.active).toBe(false);
  });
});
```

**Step 2: Add the minimal adapter surface**

Create `packages/ide/src/features/grammarGraph/grammarGraphAdapter.ts` with exported placeholder functions and types so the test compiles, then run the test.

**Step 3: Run test to verify it fails**

Run from `packages/ide`:

```bash
npx vitest run src/features/grammarGraph/grammarGraphAdapter.spec.ts --config vitest.integration.config.ts
```

Expected: FAIL because model building and filtering are not implemented.

**Step 4: Implement the adapter**

Implement:

- `SelectedGrammarModes`
- `GrammarGraphViewNode`
- `GrammarGraphViewEdge`
- `GrammarGraphModel`
- `buildGrammarGraphModel()`
- `isModeCompatible(modes, selectedModes)`
- `filterGrammarGraphModel(model, filters)`

Implementation notes:

- Import `grammarGraph` directly from `@ts-compilator-for-java/compiler/grammar/ast/grammarGraph`.
- Copy graph arrays with `.map()` or array spreads; do not mutate compiler graph data.
- Mark a node inactive when all incoming or own relevant mode guards conflict with `selectedModes`. A practical first version may infer node activity from its productions and connected edges.
- Keep inactive nodes and edges visible unless a future `hideInactive` option is passed.
- Return edges only when both endpoint nodes are still visible after search, section, and kind filters.

**Step 5: Run test to verify it passes**

Run from `packages/ide`:

```bash
npx vitest run src/features/grammarGraph/grammarGraphAdapter.spec.ts --config vitest.integration.config.ts
```

Expected: PASS.

**Step 6: Commit**

```bash
git add packages/ide/src/features/grammarGraph/grammarGraphAdapter.ts packages/ide/src/features/grammarGraph/grammarGraphAdapter.spec.ts
git commit -m "feat: derive grammar graph view model"
```

---

### Task 3: Add React Flow Conversion and Styles

**Files:**
- Modify: `packages/ide/src/features/grammarGraph/grammarGraphAdapter.spec.ts`
- Modify: `packages/ide/src/features/grammarGraph/grammarGraphAdapter.ts`
- Create: `packages/ide/src/features/grammarGraph/grammarGraphStyles.ts`

**Step 1: Write the failing tests**

Extend `grammarGraphAdapter.spec.ts`:

```ts
import { toReactFlowGraph } from "./grammarGraphAdapter";

describe("toReactFlowGraph", () => {
  it("converts view nodes and edges to React Flow data", () => {
    const model = buildGrammarGraphModel();
    const filtered = filterGrammarGraphModel(model, {
      selectedModes: typedDelimitedModes,
    });

    const graph = toReactFlowGraph(filtered);

    expect(graph.nodes.length).toBe(filtered.nodes.length);
    expect(graph.edges.length).toBe(filtered.edges.length);
    expect(graph.nodes[0].position).toEqual(
      expect.objectContaining({ x: expect.any(Number), y: expect.any(Number) }),
    );
    expect(graph.nodes.find((node) => node.id === "program")?.type).toBe(
      "grammarNode",
    );
    expect(graph.edges[0].data).toEqual(
      expect.objectContaining({ production: expect.any(String) }),
    );
  });
});
```

**Step 2: Run test to verify it fails**

Run from `packages/ide`:

```bash
npx vitest run src/features/grammarGraph/grammarGraphAdapter.spec.ts --config vitest.integration.config.ts
```

Expected: FAIL because `toReactFlowGraph` does not exist.

**Step 3: Implement styles and React Flow conversion**

Create `grammarGraphStyles.ts` with:

```ts
export const GRAMMAR_GRAPH_NODE_SIZE = {
  nonterminal: { width: 190, height: 72 },
  terminal: { width: 110, height: 44 },
  option: { width: 150, height: 56 },
  mode: { width: 150, height: 56 },
} as const;

export const GRAMMAR_GRAPH_LAYOUT = {
  rankdir: "LR",
  nodesep: 42,
  ranksep: 86,
} as const;
```

Then implement `toReactFlowGraph(viewModel)` in the adapter:

- Build a Dagre graph.
- Set graph direction to left-to-right.
- Use stable dimensions from `GRAMMAR_GRAPH_NODE_SIZE`.
- Return React Flow nodes with `type: "grammarNode"`, `data: viewNode`, and calculated `position`.
- Return React Flow edges with label text built from production, optional, repeat, and modes.

**Step 4: Run test to verify it passes**

Run from `packages/ide`:

```bash
npx vitest run src/features/grammarGraph/grammarGraphAdapter.spec.ts --config vitest.integration.config.ts
```

Expected: PASS.

**Step 5: Commit**

```bash
git add packages/ide/src/features/grammarGraph/grammarGraphAdapter.ts packages/ide/src/features/grammarGraph/grammarGraphAdapter.spec.ts packages/ide/src/features/grammarGraph/grammarGraphStyles.ts
git commit -m "feat: adapt grammar graph for react flow"
```

---

### Task 4: Build the Graph Canvas

**Files:**
- Create: `packages/ide/src/features/grammarGraph/GrammarGraphCanvas.tsx`
- Create: `packages/ide/src/features/grammarGraph/GrammarGraphCanvas.spec.tsx`
- Modify: `packages/ide/src/features/grammarGraph/grammarGraphStyles.ts`

**Step 1: Write the failing component test**

Create `GrammarGraphCanvas.spec.tsx`:

```tsx
// @vitest-environment jsdom

import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { buildGrammarGraphModel, filterGrammarGraphModel } from "./grammarGraphAdapter";
import { GrammarGraphCanvas } from "./GrammarGraphCanvas";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

vi.mock("@xyflow/react", () => ({
  Background: () => <div data-testid="flow-background" />,
  Controls: () => <div data-testid="flow-controls" />,
  MiniMap: () => <div data-testid="flow-minimap" />,
  ReactFlow: ({ nodes, edges, onNodeClick, nodeTypes }: any) => (
    <div data-testid="react-flow" data-node-count={nodes.length} data-edge-count={edges.length}>
      <button type="button" onClick={(event) => onNodeClick(event, nodes[0])}>
        select-node
      </button>
      <div data-has-node-types={Boolean(nodeTypes?.grammarNode)} />
    </div>
  ),
  ReactFlowProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe("GrammarGraphCanvas", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  it("renders graph data and reports node selection", () => {
    const model = filterGrammarGraphModel(buildGrammarGraphModel(), {
      search: "program",
    });
    const onSelectNode = vi.fn();
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(
        <GrammarGraphCanvas model={model} onSelectNode={onSelectNode} />,
      );
    });

    expect(container.querySelector("[data-testid='react-flow']")).not.toBeNull();
    expect(container.textContent).toContain("select-node");

    act(() => {
      container.querySelector("button")?.dispatchEvent(
        new MouseEvent("click", { bubbles: true, cancelable: true }),
      );
    });

    expect(onSelectNode).toHaveBeenCalledWith(
      expect.objectContaining({ id: "program" }),
    );

    act(() => root.unmount());
  });
});
```

**Step 2: Run test to verify it fails**

Run from `packages/ide`:

```bash
npx vitest run src/features/grammarGraph/GrammarGraphCanvas.spec.tsx --config vitest.integration.config.ts
```

Expected: FAIL because the canvas component does not exist.

**Step 3: Implement the canvas**

Implement `GrammarGraphCanvas.tsx`:

- Import React Flow CSS once in this file: `import "@xyflow/react/dist/style.css";`
- Use `ReactFlowProvider`.
- Use `ReactFlow`, `Controls`, `MiniMap`, and `Background`.
- Register a custom `grammarNode` type.
- Render a compact custom node with label, id, kind, group accent, production count, start marker, and inactive opacity.
- Pass selected React Flow node data back through `onSelectNode(viewNode)`.
- Render an empty state when `model.nodes.length === 0`.

**Step 4: Run test to verify it passes**

Run from `packages/ide`:

```bash
npx vitest run src/features/grammarGraph/GrammarGraphCanvas.spec.tsx --config vitest.integration.config.ts
```

Expected: PASS.

**Step 5: Commit**

```bash
git add packages/ide/src/features/grammarGraph/GrammarGraphCanvas.tsx packages/ide/src/features/grammarGraph/GrammarGraphCanvas.spec.tsx packages/ide/src/features/grammarGraph/grammarGraphStyles.ts
git commit -m "feat: render grammar graph canvas"
```

---

### Task 5: Build Toolbar and Details Panel

**Files:**
- Create: `packages/ide/src/features/grammarGraph/GrammarGraphToolbar.tsx`
- Create: `packages/ide/src/features/grammarGraph/GrammarGraphDetailsPanel.tsx`
- Create: `packages/ide/src/features/grammarGraph/GrammarGraphToolbar.spec.tsx`
- Create: `packages/ide/src/features/grammarGraph/GrammarGraphDetailsPanel.spec.tsx`

**Step 1: Write failing toolbar test**

Create `GrammarGraphToolbar.spec.tsx`:

```tsx
// @vitest-environment jsdom

import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { buildGrammarGraphModel } from "./grammarGraphAdapter";
import { GrammarGraphToolbar } from "./GrammarGraphToolbar";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe("GrammarGraphToolbar", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("updates search, section, and kind filters", () => {
    const model = buildGrammarGraphModel();
    const onChange = vi.fn();
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(
        <GrammarGraphToolbar model={model} filters={{}} onChange={onChange} />,
      );
    });

    const search = container.querySelector("input[type='search']");
    act(() => {
      search?.dispatchEvent(new Event("input", { bubbles: true }));
      Object.defineProperty(search, "value", { value: "stmt", configurable: true });
      search?.dispatchEvent(new Event("input", { bubbles: true }));
    });

    expect(onChange).toHaveBeenCalled();
    expect(container.textContent).toContain("Top Level");
    expect(container.textContent).toContain("nonterminal");

    act(() => root.unmount());
  });
});
```

**Step 2: Write failing details panel test**

Create `GrammarGraphDetailsPanel.spec.tsx`:

```tsx
// @vitest-environment jsdom

import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import { buildGrammarGraphModel } from "./grammarGraphAdapter";
import { GrammarGraphDetailsPanel } from "./GrammarGraphDetailsPanel";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe("GrammarGraphDetailsPanel", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("renders selected node grammar details", () => {
    const model = buildGrammarGraphModel();
    const node = model.nodes.find((item) => item.id === "program");
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(<GrammarGraphDetailsPanel node={node ?? null} />);
    });

    expect(container.textContent).toContain("program");
    expect(container.textContent).toContain("<program>");
    expect(container.textContent).toContain("nonterminal");
    expect(container.textContent).toContain("program-functions");

    act(() => root.unmount());
  });
});
```

**Step 3: Run tests to verify they fail**

Run from `packages/ide`:

```bash
npx vitest run src/features/grammarGraph/GrammarGraphToolbar.spec.tsx src/features/grammarGraph/GrammarGraphDetailsPanel.spec.tsx --config vitest.integration.config.ts
```

Expected: FAIL because the components do not exist.

**Step 4: Implement toolbar and details panel**

Implement:

- Search input matching id or label.
- Section select using `model.sections`.
- Kind checkboxes for `nonterminal`, `terminal`, `option`, and `mode`.
- Read-only selected mode chips or controls that show the selected mode state.
- Details panel fields: id, label, kind, group, source, description, productions.

Keep styling dense and calm with existing Tailwind tokens and shadcn-style primitives where useful.

**Step 5: Run tests to verify they pass**

Run from `packages/ide`:

```bash
npx vitest run src/features/grammarGraph/GrammarGraphToolbar.spec.tsx src/features/grammarGraph/GrammarGraphDetailsPanel.spec.tsx --config vitest.integration.config.ts
```

Expected: PASS.

**Step 6: Commit**

```bash
git add packages/ide/src/features/grammarGraph/GrammarGraphToolbar.tsx packages/ide/src/features/grammarGraph/GrammarGraphDetailsPanel.tsx packages/ide/src/features/grammarGraph/GrammarGraphToolbar.spec.tsx packages/ide/src/features/grammarGraph/GrammarGraphDetailsPanel.spec.tsx
git commit -m "feat: add grammar graph controls and details"
```

---

### Task 6: Build Public Ast Component

**Files:**
- Create: `packages/ide/src/components/Ast.tsx`
- Create: `packages/ide/src/components/Ast.spec.tsx`

**Step 1: Write the failing test**

Create `Ast.spec.tsx`:

```tsx
// @vitest-environment jsdom

import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Ast } from "./Ast";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

vi.mock("@/features/grammarGraph/GrammarGraphCanvas", () => ({
  GrammarGraphCanvas: ({ model }: any) => (
    <div data-testid="grammar-canvas">{model.nodes.length}</div>
  ),
}));

describe("Ast", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  it("renders the grammar graph tool with selected modes", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(
        <Ast
          selectedModes={{
            typingMode: "typed",
            blockMode: "delimited",
            semicolonMode: "required",
            arrayMode: "fixed",
          }}
        />,
      );
    });

    expect(container.textContent).toContain("Grafo da gramatica");
    expect(container.querySelector("[data-testid='grammar-canvas']")).not.toBeNull();
    expect(container.textContent).toContain("typed");

    act(() => root.unmount());
  });
});
```

**Step 2: Run test to verify it fails**

Run from `packages/ide`:

```bash
npx vitest run src/components/Ast.spec.tsx --config vitest.integration.config.ts
```

Expected: FAIL because `Ast` does not exist.

**Step 3: Implement `Ast.tsx`**

Implement:

- Controlled internal filter state with `useState`.
- `buildGrammarGraphModel()` in `useMemo`.
- `filterGrammarGraphModel()` from current filters and `selectedModes`.
- Clear selected node when it is no longer present in the filtered model.
- Render toolbar, canvas, and details panel in a responsive dense layout.
- Respect `height`, `showToolbar`, and `className` props.

**Step 4: Run test to verify it passes**

Run from `packages/ide`:

```bash
npx vitest run src/components/Ast.spec.tsx --config vitest.integration.config.ts
```

Expected: PASS.

**Step 5: Commit**

```bash
git add packages/ide/src/components/Ast.tsx packages/ide/src/components/Ast.spec.tsx
git commit -m "feat: add embeddable grammar graph viewer"
```

---

### Task 7: Integrate Ast Into Review Step

**Files:**
- Modify: `packages/ide/src/components/keyword-customizer/keyword-customizer-step-props.ts`
- Modify: `packages/ide/src/components/keyword-customizer/keyword-customizer-step-props.spec.ts`
- Modify: `packages/ide/src/components/keyword-customizer/steps/review-step/index.tsx`
- Modify: `packages/ide/src/components/keyword-customizer/steps/review-step/review-step.spec.tsx`

**Step 1: Write failing prop-mapping test**

Extend `keyword-customizer-step-props.spec.ts`:

```ts
import { buildReviewStepProps } from "./keyword-customizer-step-props";

describe("buildReviewStepProps", () => {
  it("maps customizer modes to grammar graph mode names", () => {
    const draft = getDefaultCustomizationState();
    draft.modes = {
      typing: "untyped",
      block: "indentation",
      semicolon: "optional-eol",
      array: "dynamic",
    };

    const props = buildReviewStepProps(
      buildContext({ draftCustomization: draft }),
    );

    expect(props.values.grammarModes).toEqual({
      typingMode: "untyped",
      blockMode: "indentation",
      semicolonMode: "optional-eol",
      arrayMode: "dynamic",
    });
  });
});
```

**Step 2: Update review step component test**

In `review-step.spec.tsx`, mock `Ast`:

```tsx
vi.mock("@/components/Ast", () => ({
  Ast: ({ selectedModes }: any) => (
    <div data-testid="ast-viewer">{selectedModes.typingMode}</div>
  ),
}));
```

Add `grammarModes` to the existing `values` object and assert:

```ts
expect(container.querySelector("[data-testid='ast-viewer']")).not.toBeNull();
expect(container.textContent).toContain("typed");
```

**Step 3: Run tests to verify they fail**

Run from `packages/ide`:

```bash
npx vitest run src/components/keyword-customizer/keyword-customizer-step-props.spec.ts src/components/keyword-customizer/steps/review-step/review-step.spec.tsx --config vitest.integration.config.ts
```

Expected: FAIL because `grammarModes` is not implemented.

**Step 4: Implement integration**

Update `ReviewStepProps`:

```ts
grammarModes: SelectedGrammarModes;
```

Import `Ast` in `review-step/index.tsx` and render it between `TokenPreview` and the edit navigation section:

```tsx
<Ast selectedModes={values.grammarModes} height={620} />
```

Update `buildReviewStepProps()` to map modes from `context.draftCustomization.modes`.

**Step 5: Run tests to verify they pass**

Run from `packages/ide`:

```bash
npx vitest run src/components/keyword-customizer/keyword-customizer-step-props.spec.ts src/components/keyword-customizer/steps/review-step/review-step.spec.tsx --config vitest.integration.config.ts
```

Expected: PASS.

**Step 6: Commit**

```bash
git add packages/ide/src/components/keyword-customizer/keyword-customizer-step-props.ts packages/ide/src/components/keyword-customizer/keyword-customizer-step-props.spec.ts packages/ide/src/components/keyword-customizer/steps/review-step/index.tsx packages/ide/src/components/keyword-customizer/steps/review-step/review-step.spec.tsx
git commit -m "feat: show grammar graph in review step"
```

---

### Task 8: Verify Build and Full Relevant Tests

**Files:**
- No planned file changes.

**Step 1: Run all grammar graph tests**

Run from `packages/ide`:

```bash
npx vitest run src/features/grammarGraph src/components/Ast.spec.tsx src/components/keyword-customizer/keyword-customizer-step-props.spec.ts src/components/keyword-customizer/steps/review-step/review-step.spec.tsx --config vitest.integration.config.ts
```

Expected: PASS.

**Step 2: Run TypeScript or Next build**

Run from `packages/ide`:

```bash
npm run build
```

Expected: PASS. If the build fails on unrelated existing issues, record the exact failure and still fix any failures caused by this feature.

**Step 3: Run the app for visual verification**

Run from `packages/ide`:

```bash
npm run dev
```

Open the keyword customizer flow, reach the review step, and verify:

- The graph renders from real compiler data.
- The current keyword customizer modes are active.
- Non-selected mode paths are visible at lower opacity.
- Search, section filter, kind filter, and node selection work.
- The details panel shows id, label, kind, group, source, and productions.

**Step 4: Final commit if verification fixes were needed**

```bash
git add packages/ide/src/features/grammarGraph packages/ide/src/components/Ast.tsx packages/ide/src/components/Ast.spec.tsx packages/ide/src/components/keyword-customizer
git commit -m "fix: polish grammar graph viewer"
```

Skip this commit if no files changed during verification.
