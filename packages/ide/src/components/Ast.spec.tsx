// @vitest-environment jsdom

import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Ast } from "./Ast";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

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

    expect(container.textContent).toContain("Grammar graph");
    expect(
      container.querySelector("[data-testid='grammar-canvas']"),
    ).not.toBeNull();
    expect(container.textContent).toContain("typed");

    act(() => root.unmount());
  });
});
