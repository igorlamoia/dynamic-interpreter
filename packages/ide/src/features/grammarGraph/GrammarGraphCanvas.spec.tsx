// @vitest-environment jsdom

import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildGrammarGraphModel,
  filterGrammarGraphModel,
} from "./grammarGraphAdapter";
import { GrammarGraphCanvas } from "./GrammarGraphCanvas";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

const reactFlowMock = vi.hoisted(() => vi.fn());

vi.mock("@xyflow/react", () => ({
  Background: () => <div data-testid="flow-background" />,
  Controls: () => <div data-testid="flow-controls" />,
  MiniMap: () => <div data-testid="flow-minimap" />,
  ReactFlow: ({ nodes, edges, onNodeClick, nodeTypes }: any) => {
    reactFlowMock({ nodes, edges, onNodeClick, nodeTypes });

    return (
      <div
        data-testid="react-flow"
        data-node-count={nodes.length}
        data-edge-count={edges.length}
      >
        <button type="button" onClick={(event) => onNodeClick(event, nodes[0])}>
          select-node
        </button>
        <div data-has-node-types={Boolean(nodeTypes?.grammarNode)} />
      </div>
    );
  },
  ReactFlowProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

describe("GrammarGraphCanvas", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
    reactFlowMock.mockClear();
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
      container
        .querySelector("button")
        ?.dispatchEvent(
          new MouseEvent("click", { bubbles: true, cancelable: true }),
        );
    });

    expect(onSelectNode).toHaveBeenCalledWith(
      expect.objectContaining({ id: "program" }),
    );

    act(() => root.unmount());
  });

  it("dims inactive edges passed to ReactFlow", () => {
    const model = filterGrammarGraphModel(buildGrammarGraphModel(), {
      selectedModes: { typingMode: "untyped" },
    });
    const inactiveEdge = model.edges.find(
      (edge) => !edge.active && edge.data.modes?.typingMode === "typed",
    );
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    expect(inactiveEdge).toBeDefined();

    act(() => {
      root.render(<GrammarGraphCanvas model={model} />);
    });

    const { edges } = reactFlowMock.mock.calls.at(-1)?.[0] ?? {};
    const reactFlowEdge = edges.find(
      (edge: any) => edge.id === inactiveEdge?.id,
    );

    expect(reactFlowEdge).toEqual(
      expect.objectContaining({
        style: expect.objectContaining({
          opacity: expect.any(Number),
        }),
      }),
    );
    expect(reactFlowEdge.style.opacity).toBeLessThan(0.5);

    act(() => root.unmount());
  });
});
