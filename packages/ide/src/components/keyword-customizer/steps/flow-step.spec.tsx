// @vitest-environment jsdom

import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FlowStep } from "./flow-step";

(
  globalThis as typeof globalThis & {
    IS_REACT_ACT_ENVIRONMENT: boolean;
  }
).IS_REACT_ACT_ENVIRONMENT = true;

vi.mock("../example-snippet", () => ({
  ExampleSnippet: ({ code }: { code: string }) => <pre>{code}</pre>,
}));

describe("FlowStep", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  function renderFlowStep() {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    const syncKeyword = vi.fn();
    const syncKeywordDescription = vi.fn();

    act(() => {
      root.render(
        <FlowStep
          values={{
            snippet: "enquanto (ativo) {\n  retornar valor\n}",
            lineEnding: " uai",
            fields: [
              {
                key: "if",
                value: "se",
                description:
                  "Executa um bloco quando a condição for verdadeira.",
              },
              {
                key: "while",
                value: "enquanto",
                description:
                  "Repete enquanto uma condição continuar verdadeira.",
              },
            ],
          }}
          actions={{
            syncKeyword,
            syncKeywordDescription,
          }}
        />,
      );
    });

    return { container, root, syncKeyword, syncKeywordDescription };
  }

  it("renders flow keywords as a reference table with editable names and semantic definitions", () => {
    const { container, root, syncKeyword, syncKeywordDescription } =
      renderFlowStep();

    expect(container.textContent).toContain("Fluxo");
    expect(container.textContent).toContain("Padrão");
    expect(container.textContent).toContain("Nome customizado");
    expect(container.textContent).toContain("Definição semântica");
    expect(container.textContent).toContain("IF");
    expect(container.textContent).toContain("WHILE");

    const ifInput = container.querySelector(
      'input[aria-label="Nome customizado para if"]',
    ) as HTMLInputElement | null;
    const whileDefinition = container.querySelector(
      'textarea[aria-label="Definição semântica para while"]',
    ) as HTMLTextAreaElement | null;

    expect(ifInput).toBeInstanceOf(HTMLInputElement);
    expect(whileDefinition).toBeInstanceOf(HTMLTextAreaElement);

    act(() => {
      const inputValueSetter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      )?.set;
      inputValueSetter?.call(ifInput, "caso");
      ifInput?.dispatchEvent(
        new Event("input", { bubbles: true, cancelable: true }),
      );

      const textareaValueSetter = Object.getOwnPropertyDescriptor(
        HTMLTextAreaElement.prototype,
        "value",
      )?.set;
      textareaValueSetter?.call(whileDefinition, "Repete uma rotina.");
      whileDefinition?.dispatchEvent(
        new Event("input", { bubbles: true, cancelable: true }),
      );
    });

    expect(syncKeyword).toHaveBeenCalledWith("if", "caso");
    expect(syncKeywordDescription).toHaveBeenCalledWith(
      "while",
      "Repete uma rotina.",
    );

    act(() => {
      root.unmount();
    });
  });

  it("renders sensible flow examples with the configured line ending", () => {
    const { container, root } = renderFlowStep();

    expect(container.textContent).toContain('status = "vip" uai');
    expect(container.textContent).toContain(
      "total = total + vendas[dia] uai",
    );
    expect(container.textContent).toContain("continue uai");
    expect(container.textContent).toContain("break uai");
    expect(container.textContent).toContain("return enviados uai");
    expect(container.textContent).toContain("pedidoCancelado");
    expect(container.textContent).toContain("estoque == 0");
    expect(container.textContent).not.toContain("contador == 2");

    act(() => {
      root.unmount();
    });
  });
});
