// @vitest-environment jsdom

import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { buildGrammarGraphModel } from "./grammarGraphAdapter";
import type { GrammarGraphViewNode } from "./grammarGraphAdapter";
import { GrammarGraphDetailsPanel } from "./GrammarGraphDetailsPanel";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

describe("GrammarGraphDetailsPanel", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
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

  it("renders a description fallback when the selected node has no description", () => {
    const node: GrammarGraphViewNode = {
      id: "identifier",
      label: "IDENTIFIER",
      kind: "terminal",
      group: "tokens",
      source: "n/a",
      active: true,
    };
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(<GrammarGraphDetailsPanel node={node} />);
    });

    expect(container.textContent).toContain("Description");
    expect(container.textContent).toContain("n/a");

    act(() => root.unmount());
  });

  it("renders repeated production symbols without duplicate React key warnings", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const node: GrammarGraphViewNode = {
      id: "qualified-name",
      label: "<qualified-name>",
      kind: "nonterminal",
      group: "names",
      description: "A dotted name.",
      source: "n/a",
      active: true,
      productions: [
        {
          id: "qualified-name-parts",
          symbols: [{ id: "identifier" }, { id: "identifier" }],
        },
      ],
    };
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(<GrammarGraphDetailsPanel node={node} />);
    });

    const duplicateKeyWarning = errorSpy.mock.calls.some((args) =>
      args.join(" ").includes("Encountered two children with the same key"),
    );
    expect(duplicateKeyWarning).toBe(false);
    expect(container.textContent).toContain("identifier");

    act(() => root.unmount());
    errorSpy.mockRestore();
  });
});
