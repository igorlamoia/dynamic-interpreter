// @vitest-environment jsdom

import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { buildGrammarGraphModel } from "./grammarGraphAdapter";
import { GrammarGraphToolbar } from "./GrammarGraphToolbar";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

function setInputValue(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value",
  )?.set;

  setter?.call(input, value);
}

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
    expect(search).not.toBeNull();

    act(() => {
      setInputValue(search as HTMLInputElement, "stmt");
      search?.dispatchEvent(new Event("input", { bubbles: true }));
    });

    const section = container.querySelector("select");
    act(() => {
      if (section) {
        section.value = "topLevel";
        section.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });

    const nonterminal = container.querySelector(
      "input[type='checkbox'][value='nonterminal']",
    );
    act(() => {
      nonterminal?.dispatchEvent(
        new MouseEvent("click", { bubbles: true, cancelable: true }),
      );
    });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ search: "stmt" }),
    );
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ sectionId: "topLevel" }),
    );
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        kinds: expect.any(Set),
      }),
    );
    expect(container.textContent).toContain("Top Level");
    expect(container.textContent).toContain("nonterminal");

    act(() => root.unmount());
  });
});
