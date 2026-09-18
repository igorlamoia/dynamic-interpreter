// @vitest-environment jsdom

import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PreviewPanel } from "./preview-panel";
import type { WizardPreview } from "./preview-data";
import type { WizardStepId } from "./wizard-model";

(
  globalThis as typeof globalThis & {
    IS_REACT_ACT_ENVIRONMENT: boolean;
  }
).IS_REACT_ACT_ENVIRONMENT = true;

vi.mock("./example-snippet", () => ({
  ExampleSnippet: ({ title }: { title: string }) => <div>{title}</div>,
}));

vi.mock("./token-preview", () => ({
  TokenPreview: () => <div>Tokens</div>,
}));

describe("PreviewPanel", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  function renderPreviewPanel(
    preview: WizardPreview,
    activeStepId?: WizardStepId,
  ) {
    class ResizeObserverStub {
      observe() {}
      unobserve() {}
      disconnect() {}
    }

    Object.defineProperty(globalThis, "ResizeObserver", {
      configurable: true,
      value: ResizeObserverStub,
    });

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(<PreviewPanel preview={preview} activeStepId={activeStepId} />);
    });

    const rerender = (
      nextPreview: WizardPreview,
      nextActiveStepId = activeStepId,
    ) => {
      act(() => {
        root.render(
          <PreviewPanel preview={nextPreview} activeStepId={nextActiveStepId} />,
        );
      });
    };

    return { container, rerender, root };
  }

  const preview: WizardPreview = {
    name: "Ruby-like",
    basedOnLabel: "Ruby-like",
    languageImageUrl: "",
    dna: [],
    baselineSnippet: "",
    snippet: "",
    tokenPreview: [],
    chosenLexemes: [
      { original: "int", custom: "num" },
      { original: "print", custom: "puts" },
      { original: "if", custom: "if_then" },
      { original: "for", custom: "for_each" },
      { original: "return", custom: "return_value" },
      { original: "and", custom: "and_word" },
      { original: "true", custom: "true_word" },
      { original: "{", custom: "inicio" },
      { original: ";", custom: "." },
    ],
  };

  it("groups changed lexemes by semantic category", () => {
    const { container, root } = renderPreviewPanel(preview);

    const text = container.textContent ?? "";
    const categoryTitles = Array.from(
      container.querySelectorAll("[data-preview-category]"),
    ).map((node) => node.getAttribute("data-preview-category"));

    expect(categoryTitles).toEqual([
      "Entrada/Saida",
      "Tipos e Declaracoes",
      "Estrutura",
      "Fluxo",
      "Lacos",
      "Operadores",
    ]);

    expect(text).toContain("int");
    expect(text).toContain("num");
    expect(text).toContain("print");
    expect(text).toContain("puts");
    expect(text).toContain("if");
    expect(text).toContain("if_then");
    expect(text).toContain("for");
    expect(text).toContain("for_each");
    expect(text).toContain("return");
    expect(text).toContain("return_value");
    expect(text).toContain("and");
    expect(text).toContain("and_word");
    expect(text).toContain("true");
    expect(text).toContain("true_word");
    expect(text).toContain("{");
    expect(text).toContain("inicio");
    expect(text).toContain(";");
    expect(text).toContain(".");
    expect(text).not.toContain("Outros");

    act(() => {
      root.unmount();
    });
  });

  it("focuses a category from the top nav, side nav, and card click", () => {
    const scrollTo = vi.fn();
    Object.defineProperty(Element.prototype, "scrollTo", {
      configurable: true,
      value: scrollTo,
    });

    const { container, root } = renderPreviewPanel(preview);

    const cards = () =>
      Array.from(container.querySelectorAll("[data-card-snap-card]"));
    const topNavButtons = () =>
      Array.from(container.querySelectorAll("[data-card-snap-top-nav]"));
    const sideNavButtons = () =>
      Array.from(container.querySelectorAll("[data-card-snap-side-nav]"));

    expect(topNavButtons()).toHaveLength(6);
    expect(sideNavButtons()).toHaveLength(6);
    expect(cards()[0].getAttribute("data-active")).toBe("true");

    act(() => {
      topNavButtons()[2].dispatchEvent(
        new MouseEvent("click", { bubbles: true, cancelable: true }),
      );
    });

    expect(cards()[2].getAttribute("data-active")).toBe("true");

    act(() => {
      sideNavButtons()[5].dispatchEvent(
        new MouseEvent("click", { bubbles: true, cancelable: true }),
      );
    });

    expect(cards()[5].getAttribute("data-active")).toBe("true");

    act(() => {
      cards()[1].dispatchEvent(
        new MouseEvent("click", { bubbles: true, cancelable: true }),
      );
    });

    expect(cards()[1].getAttribute("data-active")).toBe("true");
    expect(scrollTo).toHaveBeenCalled();

    act(() => {
      root.unmount();
    });
  });

  it("keeps wheel events inside the card stack scroll area", () => {
    const { container, root } = renderPreviewPanel(preview);
    const parentWheelListener = vi.fn();
    container.addEventListener("wheel", parentWheelListener);
    const scrollArea = container.querySelector("[data-card-snap-scroll-area]");

    expect(scrollArea).not.toBeNull();

    act(() => {
      scrollArea?.dispatchEvent(
        new WheelEvent("wheel", {
          bubbles: true,
          cancelable: true,
          deltaY: 120,
        }),
      );
    });

    expect(parentWheelListener).not.toHaveBeenCalled();

    act(() => {
      root.unmount();
    });
  });

  it("focuses the card for the category changed by an edited input", () => {
    const scrollTo = vi.fn();
    Object.defineProperty(Element.prototype, "scrollTo", {
      configurable: true,
      value: scrollTo,
    });

    const initialPreview: WizardPreview = {
      ...preview,
      chosenLexemes: [{ original: "print", custom: "puts" }],
    };
    const { container, rerender, root } = renderPreviewPanel(initialPreview);

    const cards = () =>
      Array.from(container.querySelectorAll("[data-card-snap-card]"));
    const topNavButtons = () =>
      Array.from(container.querySelectorAll("[data-card-snap-top-nav]"));

    act(() => {
      topNavButtons()[5].dispatchEvent(
        new MouseEvent("click", { bubbles: true, cancelable: true }),
      );
    });

    expect(cards()[5].getAttribute("data-active")).toBe("true");

    rerender({
      ...initialPreview,
      chosenLexemes: [
        { original: "print", custom: "puts" },
        { original: "if", custom: "se" },
      ],
    });

    expect(cards()[3].getAttribute("data-preview-category")).toBe("Fluxo");
    expect(cards()[3].textContent).toContain("if");
    expect(cards()[3].textContent).toContain("se");
    expect(cards()[3].getAttribute("data-active")).toBe("true");
    expect(scrollTo).toHaveBeenCalled();

    act(() => {
      topNavButtons()[5].dispatchEvent(
        new MouseEvent("click", { bubbles: true, cancelable: true }),
      );
    });

    expect(cards()[5].getAttribute("data-active")).toBe("true");

    act(() => {
      root.unmount();
    });
  });

  it("groups boolean literals into operators for rules-step focus", () => {
    const { container, root } = renderPreviewPanel(preview);

    const cards = Array.from(
      container.querySelectorAll("[data-card-snap-card]"),
    );
    const operatorCard = cards.find(
      (card) => card.getAttribute("data-preview-category") === "Operadores",
    );

    expect(operatorCard).toBeDefined();
    expect(operatorCard?.textContent).toContain("true");
    expect(operatorCard?.textContent).toContain("true_word");
    expect(operatorCard?.textContent).not.toContain("Booleanos");

    act(() => {
      root.unmount();
    });
  });

  it("focuses operators when the wizard moves to the rules step", () => {
    const scrollTo = vi.fn();
    Object.defineProperty(Element.prototype, "scrollTo", {
      configurable: true,
      value: scrollTo,
    });

    const { container, rerender, root } = renderPreviewPanel(preview, "types");

    const cards = () =>
      Array.from(container.querySelectorAll("[data-card-snap-card]"));

    expect(cards()[1].getAttribute("data-preview-category")).toBe(
      "Tipos e Declaracoes",
    );
    expect(cards()[1].getAttribute("data-active")).toBe("true");

    rerender(preview, "rules");

    const operatorCard = cards().find(
      (card) => card.getAttribute("data-preview-category") === "Operadores",
    );

    expect(operatorCard?.getAttribute("data-active")).toBe("true");
    expect(scrollTo).toHaveBeenCalled();

    act(() => {
      root.unmount();
    });
  });

  it("bounds the mobile preview panel so the card stack can scroll internally", () => {
    const { container, root } = renderPreviewPanel(preview);
    const panel = container.querySelector("[data-preview-panel]");

    expect(panel).not.toBeNull();
    expect(panel?.className).toContain("max-lg:h-[calc(100dvh-1rem)]");

    act(() => {
      root.unmount();
    });
  });
});
