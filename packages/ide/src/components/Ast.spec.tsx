// @vitest-environment jsdom

import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { GrammarGraphCanvasProps } from "@/features/grammarGraph/GrammarGraphCanvas";
import { Ast } from "./Ast";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

const canvasProps = vi.hoisted(() => [] as GrammarGraphCanvasProps[]);

vi.mock("@/features/grammarGraph/GrammarGraphCanvas", () => ({
  GrammarGraphCanvas: (props: GrammarGraphCanvasProps) => {
    canvasProps.push(props);

    return (
      <div data-testid="grammar-canvas" className={props.className}>
        {props.model.nodes.length}
      </div>
    );
  },
}));

describe("Ast", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
    canvasProps.length = 0;
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

    expect(container.textContent).toContain("Grammar graph");
    expect(
      container.querySelector("[data-testid='grammar-canvas']"),
    ).not.toBeNull();
    expect(container.textContent).toContain("typed");

    act(() => root.unmount());
  });

  it("lets the graph canvas fill the Ast-controlled height", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(<Ast height={400} />);
    });

    expect(container.firstElementChild).toEqual(
      expect.objectContaining({
        style: expect.objectContaining({ height: "400px" }),
      }),
    );
    expect(canvasProps.at(-1)?.className).toContain("h-full");

    act(() => root.unmount());
  });

  it("passes selected mode filtering to the canvas model", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(<Ast selectedModes={{ typingMode: "untyped" }} />);
    });

    const model = canvasProps.at(-1)?.model;
    const inactiveTypedEdge = model?.edges.find(
      (edge) => !edge.active && edge.data.modes?.typingMode === "typed",
    );

    expect(inactiveTypedEdge).toBeDefined();

    act(() => root.unmount());
  });
});
