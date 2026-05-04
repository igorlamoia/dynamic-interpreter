// @vitest-environment jsdom

import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import { buildGrammarGraphModel } from "./grammarGraphAdapter";
import { GrammarGraphDetailsPanel } from "./GrammarGraphDetailsPanel";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

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
