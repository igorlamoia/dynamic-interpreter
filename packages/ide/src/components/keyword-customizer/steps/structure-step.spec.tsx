// @vitest-environment jsdom

import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { StructureStep } from "./structure-step";

(
  globalThis as typeof globalThis & {
    IS_REACT_ACT_ENVIRONMENT: boolean;
  }
).IS_REACT_ACT_ENVIRONMENT = true;

vi.mock("lucide-react", () => ({
  Braces: () => <span>braces</span>,
  Form: () => <span>form</span>,
  ListPlus: () => <span>list-plus</span>,
  LockKeyhole: () => <span>lock-keyhole</span>,
  TextQuote: () => <span>text-quote</span>,
}));

vi.mock("next/router", () => ({
  useRouter: () => ({ locale: "pt-BR" }),
}));

vi.mock("../documented-field", () => ({
  DocumentedField: ({ label }: { label: string }) => <label>{label}</label>,
}));

vi.mock("../example-snippet", () => ({
  ExampleSnippet: ({ code }: { code: string }) => <pre>{code}</pre>,
}));

vi.mock("../option-card", () => ({
  OptionCard: ({
    title,
    selected,
    onClick,
    children,
  }: {
    title: string;
    selected?: boolean;
    onClick?: () => void;
    children?: React.ReactNode;
  }) => (
    <button
      type="button"
      data-option-card={title}
      data-selected={selected ? "true" : "false"}
      onClick={onClick}
    >
      {title}
      {children}
    </button>
  ),
}));

describe("StructureStep", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  function renderStructureStep() {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    const syncArrayMode = vi.fn();
    const syncSemicolonMode = vi.fn();
    const props: React.ComponentProps<typeof StructureStep> = {
      values: {
        snippet: "estrutura",
        optionalTerminatorSnippet: 'mostrar("ok")',
        requiredTerminatorSnippet: 'mostrar("ok")fim',
        delimiterSnippet: "if (ok) {\n}",
        identationSnippet: "if ok:\n  print()",
        fixedArraySnippet: 'animes[2] = ["Naruto", "AOT"]',
        dynamicArraySnippet: 'animes[] = ["Naruto", "AOT"]',
        semicolonMode: "required",
        blockMode: "delimited",
        arrayMode: "dynamic",
        usesCustomDelimiters: true,
        statementTerminator: {
          value: ";",
          description: "Termina instrucoes.",
        },
        keywords: [],
        delimiters: {
          open: { value: "inicio", description: "Abre bloco." },
          close: { value: "fim", description: "Fecha bloco." },
        },
      },
      errors: {
        delimiter: null,
        statementTerminator: null,
      },
      actions: {
        syncBlockMode: vi.fn(),
        syncDelimiter: vi.fn(),
        syncDelimiterDescription: vi.fn(),
        syncStatementTerminator: vi.fn(),
        syncStatementTerminatorDescription: vi.fn(),
        syncSemicolonMode,
        syncArrayMode,
        syncKeyword: vi.fn(),
        syncKeywordDescription: vi.fn(),
      },
    };

    act(() => {
      root.render(<StructureStep {...props} />);
    });

    return { container, root, syncArrayMode, syncSemicolonMode };
  }

  it("renders structure choices as option cards including array mode", () => {
    const { container, root } = renderStructureStep();

    const optionCards = Array.from(
      container.querySelectorAll("[data-option-card]"),
    ).map((element) => element.getAttribute("data-option-card"));

    expect(optionCards).toEqual(
      expect.arrayContaining([
        "Sem ponto e vírgula",
        "Exigir terminador",
        "Delimitada",
        "Indentação",
        "Tamanho fixo",
        "Tamanho dinâmico",
      ]),
    );
    expect(container.textContent).toContain('mostrar("ok")');
    expect(container.textContent).toContain('mostrar("ok")fim');
    expect(container.textContent).toContain('animes[2] = ["Naruto", "AOT"]');
    expect(container.textContent).toContain('animes[] = ["Naruto", "AOT"]');

    act(() => {
      root.unmount();
    });
  });

  it("syncs array mode from the structure step", () => {
    const { container, root, syncArrayMode } = renderStructureStep();

    const fixedCard = container.querySelector(
      '[data-option-card="Tamanho fixo"]',
    ) as HTMLButtonElement | null;

    expect(fixedCard).toBeInstanceOf(HTMLButtonElement);

    act(() => {
      fixedCard?.dispatchEvent(
        new MouseEvent("click", { bubbles: true, cancelable: true }),
      );
    });

    expect(syncArrayMode).toHaveBeenCalledWith("fixed");

    act(() => {
      root.unmount();
    });
  });
});
