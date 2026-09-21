// @vitest-environment jsdom

import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RulesStep } from "./rules-step";

(
  globalThis as typeof globalThis & {
    IS_REACT_ACT_ENVIRONMENT: boolean;
  }
).IS_REACT_ACT_ENVIRONMENT = true;

Object.defineProperty(window, "matchMedia", {
  configurable: true,
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

vi.mock("next/router", () => ({
  useRouter: () => ({ locale: "pt-BR" }),
}));

describe("RulesStep", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  function renderRulesStep() {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    const syncBooleanLiteral = vi.fn();
    const syncOperatorAlias = vi.fn();
    const syncBooleanLiteralDescription = vi.fn();
    const syncOperatorAliasDescription = vi.fn();

    act(() => {
      root.render(
        <RulesStep
          values={{
            booleanLiterals: [
              {
                key: "true",
                label: "Literal true",
                value: "verdadeiro",
                description: "Representa uma condição verdadeira.",
              },
              {
                key: "false",
                label: "Literal false",
                value: "falso",
                description: "Representa uma condição falsa.",
              },
            ],
            operatorAliases: [
              {
                key: "logical_or",
                label: "Logical OR",
                value: "ou",
                description: "Retorna verdadeiro se um lado for verdadeiro.",
                placeholder: "||",
              },
            ],
          }}
          errors={{ booleanLiteral: null, operator: null }}
          actions={{
            syncBooleanLiteral,
            syncOperatorAlias,
            syncBooleanLiteralDescription,
            syncOperatorAliasDescription,
          }}
        />,
      );
    });

    return {
      container,
      root,
      syncBooleanLiteral,
      syncOperatorAlias,
      syncBooleanLiteralDescription,
      syncOperatorAliasDescription,
    };
  }

  it("renders rule aliases as reference tables with editable names and semantic definitions", () => {
    const {
      container,
      root,
      syncBooleanLiteral,
      syncOperatorAlias,
      syncBooleanLiteralDescription,
      syncOperatorAliasDescription,
    } = renderRulesStep();

    expect(container.textContent).toContain("Literais booleanos");
    expect(container.textContent).toContain("Aliases de operadores");
    expect(container.textContent).toContain("Padrão");
    expect(container.textContent).toContain("Nome customizado");
    expect(container.textContent).toContain("Definição semântica");
    expect(container.textContent).toContain("TRUE");
    expect(container.textContent).toContain("||");

    const trueInput = container.querySelector(
      'input[aria-label="Nome customizado para Literal true"]',
    ) as HTMLInputElement | null;
    const trueDefinition = container.querySelector(
      'textarea[aria-label="Definição semântica para Literal true"]',
    ) as HTMLTextAreaElement | null;
    const orInput = container.querySelector(
      'input[aria-label="Nome customizado para Logical OR"]',
    ) as HTMLInputElement | null;
    const orDefinition = container.querySelector(
      'textarea[aria-label="Definição semântica para Logical OR"]',
    ) as HTMLTextAreaElement | null;

    expect(trueInput).toBeInstanceOf(HTMLInputElement);
    expect(trueDefinition).toBeInstanceOf(HTMLTextAreaElement);
    expect(orInput).toBeInstanceOf(HTMLInputElement);
    expect(orDefinition).toBeInstanceOf(HTMLTextAreaElement);

    act(() => {
      const inputValueSetter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      )?.set;
      inputValueSetter?.call(trueInput, "sim");
      trueInput?.dispatchEvent(
        new Event("input", { bubbles: true, cancelable: true }),
      );
      inputValueSetter?.call(orInput, "tambem");
      orInput?.dispatchEvent(
        new Event("input", { bubbles: true, cancelable: true }),
      );

      const textareaValueSetter = Object.getOwnPropertyDescriptor(
        HTMLTextAreaElement.prototype,
        "value",
      )?.set;
      textareaValueSetter?.call(trueDefinition, "Valor lógico afirmativo.");
      trueDefinition?.dispatchEvent(
        new Event("input", { bubbles: true, cancelable: true }),
      );
      textareaValueSetter?.call(orDefinition, "Combina duas alternativas.");
      orDefinition?.dispatchEvent(
        new Event("input", { bubbles: true, cancelable: true }),
      );
    });

    expect(syncBooleanLiteral).toHaveBeenCalledWith("true", "sim");
    expect(syncOperatorAlias).toHaveBeenCalledWith("logical_or", "tambem");
    expect(syncBooleanLiteralDescription).toHaveBeenCalledWith(
      "true",
      "Valor lógico afirmativo.",
    );
    expect(syncOperatorAliasDescription).toHaveBeenCalledWith(
      "logical_or",
      "Combina duas alternativas.",
    );

    act(() => {
      root.unmount();
    });
  });
});
