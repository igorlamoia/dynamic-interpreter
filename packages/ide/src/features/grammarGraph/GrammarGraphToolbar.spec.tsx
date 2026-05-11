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

  it("updates search and section filters", () => {
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
    expect(container.textContent).toContain("Top Level");

    act(() => root.unmount());
  });

  it.each([
    ["nonterminal", ["mode", "option", "terminal"]],
    ["terminal", ["mode", "nonterminal", "option"]],
    ["option", ["mode", "nonterminal", "terminal"]],
    ["mode", ["nonterminal", "option", "terminal"]],
  ] as const)(
    "emits kind filters without %s when toggled off",
    (kind, expectedKinds) => {
      const model = buildGrammarGraphModel();
      const onChange = vi.fn();
      const container = document.createElement("div");
      document.body.appendChild(container);
      const root = createRoot(container);

      act(() => {
        root.render(
          <GrammarGraphToolbar
            model={model}
            filters={{}}
            onChange={onChange}
          />,
        );
      });

      const kindCheckbox = container.querySelector(
        `input[type='checkbox'][value='${kind}']`,
      );
      expect(kindCheckbox).not.toBeNull();

      act(() => {
        kindCheckbox?.dispatchEvent(
          new MouseEvent("click", { bubbles: true, cancelable: true }),
        );
      });

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          kinds: expect.any(Set),
        }),
      );
      const [filters] = onChange.mock.calls[0];
      expect(Array.from(filters.kinds ?? []).sort()).toEqual(expectedKinds);

      act(() => root.unmount());
    },
  );
});
