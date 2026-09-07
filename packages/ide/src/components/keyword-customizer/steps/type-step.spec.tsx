// @vitest-environment jsdom

import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TypeStep } from "./type-step";

(
  globalThis as typeof globalThis & {
    IS_REACT_ACT_ENVIRONMENT: boolean;
  }
).IS_REACT_ACT_ENVIRONMENT = true;

vi.mock("lucide-react", () => ({
  BicepsFlexed: () => <span>biceps</span>,
  WandSparkles: () => <span>wand</span>,
}));

vi.mock("./components/typing-relationship-beam", () => ({
  TypingRelationshipBeam: () => <div>typing relationship beam</div>,
}));

vi.mock("../example-snippet", () => ({
  ExampleSnippet: ({ code }: { code: string }) => <pre>{code}</pre>,
}));

describe("TypeStep", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  function renderTypeStep() {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    const syncKeyword = vi.fn();
    const syncKeywordDescription = vi.fn();

    act(() => {
      root.render(
        <TypeStep
          values={{
            snippet: "inteiro idade",
            typedSnippet: "inteiro idade",
            untypedSnippet: "variable idade",
            typingMode: "typed",
            printKeyword: "mostrar",
            typingBeamKeywords: {
              variable: "variable",
              string: "texto",
              float: "decimal",
              int: "inteiro",
              bool: "booleano",
            },
            variableKeywords: [
              {
                key: "int",
                value: "inteiro",
                description: "Números inteiros, usados para contagem.",
              },
              {
                key: "string",
                value: "texto",
                description: "Sequências de caracteres para mensagens.",
              },
            ],
          }}
          actions={{
            syncTypingMode: vi.fn(),
            syncKeyword,
            syncKeywordDescription,
          }}
        />,
      );
    });

    return { container, root, syncKeyword, syncKeywordDescription };
  }

  it("renders typed keywords as a reference table with editable names and semantic definitions", () => {
    const { container, root, syncKeyword, syncKeywordDescription } =
      renderTypeStep();

    expect(container.textContent).toContain("Padrão");
    expect(container.textContent).toContain("Nome customizado");
    expect(container.textContent).toContain("Definição semântica");
    expect(container.textContent).toContain("INT");
    expect(container.textContent).toContain("STRING");

    const intNameInput = container.querySelector(
      'input[aria-label="Nome customizado para int"]',
    ) as HTMLInputElement | null;
    const stringDefinition = container.querySelector(
      'textarea[aria-label="Definição semântica para string"]',
    ) as HTMLTextAreaElement | null;

    expect(intNameInput).toBeInstanceOf(HTMLInputElement);
    expect(stringDefinition).toBeInstanceOf(HTMLTextAreaElement);

    act(() => {
      const inputValueSetter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      )?.set;
      inputValueSetter?.call(intNameInput, "numero");
      intNameInput?.dispatchEvent(
        new Event("input", { bubbles: true, cancelable: true }),
      );

      const textareaValueSetter = Object.getOwnPropertyDescriptor(
        HTMLTextAreaElement.prototype,
        "value",
      )?.set;
      textareaValueSetter?.call(stringDefinition, "Texto exibido ao usuário.");
      stringDefinition?.dispatchEvent(
        new Event("input", { bubbles: true, cancelable: true }),
      );
    });

    expect(syncKeyword).toHaveBeenCalledWith("int", "numero");
    expect(syncKeywordDescription).toHaveBeenCalledWith(
      "string",
      "Texto exibido ao usuário.",
    );

    act(() => {
      root.unmount();
    });
  });

  it("does not render array mode choices in the typing step", () => {
    const { container, root } = renderTypeStep();

    expect(container.textContent).not.toContain("Tamanho fixo");
    expect(container.textContent).not.toContain("Tamanho dinâmico");

    act(() => {
      root.unmount();
    });
  });
});
