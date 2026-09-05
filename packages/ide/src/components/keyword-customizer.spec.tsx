// @vitest-environment jsdom

import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CUSTOMIZABLE_KEYWORDS, ORIGINAL_KEYWORDS } from "@/contexts/keyword";

(
  globalThis as typeof globalThis & {
    IS_REACT_ACT_ENVIRONMENT: boolean;
  }
).IS_REACT_ACT_ENVIRONMENT = true;

const useKeywordsMock = vi.fn();
const useRouterMock = vi.fn();
const validateBooleanLiteralAliasesMock = vi.fn<
  (...args: unknown[]) => string | null
>(() => null);
const validateStatementTerminatorLexemeMock = vi.fn<
  (...args: unknown[]) => string | null
>(() => null);

vi.mock("@/contexts/keyword/KeywordContext", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/contexts/keyword/KeywordContext")>();

  return {
    ...actual,
    useKeywords: () => useKeywordsMock(),
  };
});

vi.mock("next/router", () => ({
  useRouter: () => useRouterMock(),
}));

vi.mock("@/contexts/keyword/keyword-validator", () => ({
  validateBooleanLiteralAliases: (...args: unknown[]) =>
    validateBooleanLiteralAliasesMock(...args),
  validateStatementTerminatorLexeme: (...args: unknown[]) =>
    validateStatementTerminatorLexemeMock(...args),
}));

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogContent: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <div className={className}>{children}</div>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogTitle: ({
    children,
    id,
  }: {
    children: React.ReactNode;
    id?: string;
  }) => <h2 id={id}>{children}</h2>,
  DialogFooter: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogClose: ({
    children,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock("./ui/border-beam", () => ({
  BorderBeam: () => null,
}));

vi.mock("./buttons/hero", () => ({
  HeroButton: ({
    children,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock("lucide-react", () => ({
  FingerprintPattern: () => <span>fingerprint</span>,
  BookOpenText: () => <span>book</span>,
  Blocks: () => <span>blocks</span>,
  Sigma: () => <span>sigma</span>,
  Route: () => <span>route</span>,
  ClipboardCheck: () => <span>review</span>,
  SquareTerminal: () => <span>terminal</span>,
  Languages: () => <span>languages</span>,
  Code: () => <span>code</span>,
  Sparkles: () => <span>sparkles</span>,
  Atom: () => <span>atom</span>,
  BicepsFlexed: () => <span>biceps</span>,
  WandSparkles: () => <span>wand</span>,
  MoveRight: () => <span>move-right</span>,
  FileIcon: () => <span>file-icon</span>,
}));

import { KeywordCustomizer } from "./keyword-customizer";

function createMappings() {
  return ORIGINAL_KEYWORDS.map((original) => ({
    original,
    custom: original,
    tokenId: CUSTOMIZABLE_KEYWORDS[original],
  }));
}

function createKeywordsContext(overrides: Record<string, unknown> = {}) {
  const customization = {
    mappings: createMappings(),
    operatorWordMap: {},
    booleanLiteralMap: { true: "true", false: "false" },
    statementTerminatorLexeme: "",
    blockDelimiters: { open: "", close: "" },
    languageDocumentation: {},
    modes: {
      semicolon: "optional-eol",
      block: "delimited",
      typing: "untyped",
      array: "dynamic",
    },
  } as const;

  return {
    customization,
    setCustomization: vi.fn(),
    setModes: vi.fn(),
    setMappings: vi.fn(),
    updateKeyword: vi.fn(),
    resetCustomization: vi.fn(),
    buildKeywordMap: vi.fn(),
    buildLexerConfig: vi.fn(),
    validateKeyword: vi.fn(() => null),
    validateBooleanLiteralMap: vi.fn(() => null),
    validateBlockDelimiters: vi.fn(() => null),
    ...overrides,
  };
}

describe("KeywordCustomizer", () => {
  beforeEach(() => {
    useKeywordsMock.mockReset();
    useRouterMock.mockReset();
    validateBooleanLiteralAliasesMock.mockReset();
    validateBooleanLiteralAliasesMock.mockReturnValue(null);
    validateStatementTerminatorLexemeMock.mockReset();
    validateStatementTerminatorLexemeMock.mockReturnValue(null);
    useRouterMock.mockReturnValue({
      push: vi.fn(),
      back: vi.fn(),
    });
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  function render() {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(<KeywordCustomizer />);
    });

    return { container, root };
  }

  function clickButtonByText(container: HTMLElement, text: string) {
    const button = Array.from(container.querySelectorAll("button")).find(
      (candidate) => candidate.textContent?.includes(text),
    );
    expect(button).toBeDefined();

    act(() => {
      button?.dispatchEvent(
        new MouseEvent("click", { bubbles: true, cancelable: true }),
      );
    });
  }

  function clickContinueTimes(container: HTMLElement, times: number) {
    for (let index = 0; index < times; index++) {
      clickButtonByText(container, "Continuar");
    }
  }

  function setControlValue(
    element: HTMLInputElement | HTMLTextAreaElement,
    value: string,
  ) {
    act(() => {
      const prototype =
        element instanceof HTMLTextAreaElement
          ? HTMLTextAreaElement.prototype
          : HTMLInputElement.prototype;
      const valueSetter = Object.getOwnPropertyDescriptor(
        prototype,
        "value",
      )?.set;
      valueSetter?.call(element, value);
      element.dispatchEvent(
        new Event("input", { bubbles: true, cancelable: true }),
      );
    });
  }

  function getSectionByTitle(container: HTMLElement, title: string) {
    return Array.from(container.querySelectorAll("section"))
      .reverse()
      .find((section) => section.textContent?.includes(title));
  }

  it("shows bool as a customizable type keyword after switching to typed mode", () => {
    useKeywordsMock.mockReturnValue(createKeywordsContext());

    const { container, root } = render();

    clickContinueTimes(container, 2);
    clickButtonByText(container, "Tipado");

    expect(container.textContent).toContain("bool");

    act(() => {
      root.unmount();
    });
  });

  it("renders the wizard shell with the full step navigation and live preview panel", () => {
    useKeywordsMock.mockReturnValue(createKeywordsContext());

    const { container, root } = render();

    expect(container.querySelector('[role="dialog"]')).toBeNull();
    expect(container.textContent).toContain("Explore sua Linguagen");
    expect(container.textContent).toContain(
      "Defina o vocabulário, as regras e o fluxo da sua linguagem.",
    );
    expect(container.textContent).not.toContain("Criador de linguagem");
    expect(container.textContent).not.toContain(
      "Personalização Interativa de Comandos",
    );
    expect(container.textContent).toContain("Identidade");
    expect(container.textContent).toContain("Entrada/Saída");
    expect(container.textContent).toContain("Tipagem");
    expect(container.textContent).toContain("Estrutura");
    expect(container.textContent).toContain("Regras");
    expect(container.textContent).toContain("Fluxo");
    expect(container.textContent).toContain("Revisão");
    expect(container.textContent).toContain("fingerprint");
    expect(container.textContent).toContain("book");
    expect(container.textContent).not.toContain("Case sensitive");
    expect(container.textContent).not.toContain("Ainda não suportado");
    expect(container.textContent).toContain("Explore sua Linguagen");
    expect(container.textContent).toContain("Preview do código");
    expect(container.textContent).toContain("Resumo parcial");

    act(() => {
      root.unmount();
    });
  });

  it("allows jumping directly between sections using the side navigation", () => {
    useKeywordsMock.mockReturnValue(createKeywordsContext());

    const { container, root } = render();

    clickButtonByText(container, "Fluxo");
    expect(container.textContent).toContain(
      "Ajuste o vocabulário usado para controle de fluxo",
    );

    clickButtonByText(container, "Tipagem");
    expect(container.textContent).toContain(
      "Escolha primeiro se a linguagem será tipada ou não tipada.",
    );

    act(() => {
      root.unmount();
    });
  });

  it("applies presets from a clean session base instead of accumulating aliases", () => {
    useKeywordsMock.mockReturnValue(createKeywordsContext());

    const { container, root } = render();
    const presetLabels = [
      "Livre",
      "Didatica em Portugues",
      "Minimalista",
      "Pythonica",
      "Ruby-like",
      "Mineres",
    ];

    const clickPreset = (label: string) => {
      const button = Array.from(container.querySelectorAll("button")).find(
        (candidate) => candidate.textContent?.includes(label),
      );
      expect(button).toBeDefined();

      act(() => {
        button?.dispatchEvent(
          new MouseEvent("click", { bubbles: true, cancelable: true }),
        );
      });
    };

    const presetButtons = Array.from(
      container.querySelectorAll("button"),
    ).filter((button) =>
      presetLabels.some((label) => button.textContent?.includes(label)),
    );
    expect(presetButtons[0]?.textContent).toContain("Livre");

    clickPreset("Pythonica");
    expect(
      getSectionByTitle(container, "Resumo parcial")?.textContent,
    ).toContain("imprime");

    clickPreset("Livre");
    const previewAfterFree = getSectionByTitle(container, "Resumo parcial");
    expect(previewAfterFree?.textContent).toContain(
      "As escolhas personalizadas vao aparecer aqui",
    );
    expect(previewAfterFree?.textContent).not.toContain("imprime");
    expect(previewAfterFree?.textContent).not.toContain("retorne");

    act(() => {
      root.unmount();
    });
  });

  it("shows only variavel in untyped mode and reveals typed keywords after selecting typed", () => {
    useKeywordsMock.mockReturnValue(createKeywordsContext());

    const { container, root } = render();

    clickContinueTimes(container, 2);
    const getInputValues = () =>
      Array.from(container.querySelectorAll("input")).map(
        (input) => (input as HTMLInputElement).value,
      );

    expect(getInputValues()).toContain("variavel");
    expect(getInputValues()).not.toContain("int");
    expect(getInputValues()).not.toContain("float");
    expect(getInputValues()).not.toContain("bool");
    expect(getInputValues()).not.toContain("string");

    clickButtonByText(container, "Tipado");

    expect(getInputValues()).toContain("int");
    expect(getInputValues()).toContain("float");
    expect(getInputValues()).toContain("bool");
    expect(getInputValues()).toContain("string");

    act(() => {
      root.unmount();
    });
  });

  it("shows structure validation where the delimiters and terminator are edited", () => {
    validateStatementTerminatorLexemeMock.mockReturnValue(
      "Terminador invalido",
    );
    const context = createKeywordsContext({
      validateBlockDelimiters: vi.fn(() => "Delimitadores invalidos"),
    });
    useKeywordsMock.mockReturnValue(context);

    const { container, root } = render();

    clickContinueTimes(container, 3);
    expect(container.textContent).toContain("Estrutura");

    const terminatorInput = Array.from(
      container.querySelectorAll("input"),
    ).find((input) => (input as HTMLInputElement).placeholder === "Opcional");
    expect(terminatorInput).toBeInstanceOf(HTMLInputElement);

    act(() => {
      const input = terminatorInput as HTMLInputElement;
      const valueSetter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      )?.set;
      valueSetter?.call(input, "fim");
      input.dispatchEvent(
        new Event("input", { bubbles: true, cancelable: true }),
      );
    });

    const delimiterInput = Array.from(container.querySelectorAll("input")).find(
      (input) => (input as HTMLInputElement).placeholder === "begin",
    );
    expect(delimiterInput).toBeInstanceOf(HTMLInputElement);

    act(() => {
      const input = delimiterInput as HTMLInputElement;
      const valueSetter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      )?.set;
      valueSetter?.call(input, "inicio");
      input.dispatchEvent(
        new Event("input", { bubbles: true, cancelable: true }),
      );
    });

    clickButtonByText(container, "Continuar");
    expect(container.textContent).toContain("Delimitadores invalidos");
    expect(container.textContent).toContain("Terminador invalido");

    act(() => {
      root.unmount();
    });
  });

  it("shows rules validation where operator, boolean and terminator edits live", () => {
    validateBooleanLiteralAliasesMock.mockReturnValue("Booleano invalido");
    const context = createKeywordsContext({
      validateBlockDelimiters: vi.fn(() => null),
    });
    useKeywordsMock.mockReturnValue(context);

    const { container, root } = render();

    clickContinueTimes(container, 5);
    expect(container.textContent).toContain("Regras");

    expect(container.textContent).toContain("Booleano invalido");
    expect(container.textContent).toContain("Logical AND");

    clickButtonByText(container, "Continuar");
    expect(container.textContent).toContain("Regras");

    act(() => {
      root.unmount();
    });
  });

  it("walks the full wizard flow through review and saves through the grouped context API", () => {
    const context = createKeywordsContext();
    useKeywordsMock.mockReturnValue(context);
    const router = {
      push: vi.fn(),
      back: vi.fn(),
    };
    useRouterMock.mockReturnValue(router);
    sessionStorage.setItem("language-creator:return", "1");

    const { container, root } = render();

    const nameInput = container.querySelector(
      'input[aria-label="Nome da linguagem"]',
    ) as HTMLInputElement | null;
    expect(nameInput).toBeInstanceOf(HTMLInputElement);
    setControlValue(nameInput!, "Didatica Neon");

    clickButtonByText(container, "Continuar");
    const keywordInput = Array.from(container.querySelectorAll("input")).find(
      (input) => (input as HTMLInputElement).value === "print",
    );
    expect(keywordInput).toBeInstanceOf(HTMLInputElement);

    act(() => {
      const input = keywordInput as HTMLInputElement;
      const valueSetter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      )?.set;
      valueSetter?.call(input, "escreva");
      input.dispatchEvent(
        new Event("input", { bubbles: true, cancelable: true }),
      );
    });

    clickContinueTimes(container, 5);
    expect(container.textContent).toContain("Revisão");

    clickButtonByText(container, "Salvar e Aplicar");

    expect(context.setCustomization).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem("keyword-customization-active")).toBe(
      "didatica-neon",
    );
    expect(localStorage.getItem("keyword-customization-index")).toContain(
      "Didatica Neon",
    );
    expect(
      localStorage.getItem("keyword-customization-didatica-neon"),
    ).toContain("Didatica Neon");
    expect(router.back).toHaveBeenCalledTimes(1);
    expect(router.push).not.toHaveBeenCalled();

    act(() => {
      root.unmount();
    });
  });

  it("falls back to / when canceling without useful navigation history", () => {
    useKeywordsMock.mockReturnValue(createKeywordsContext());
    const router = {
      push: vi.fn(),
      back: vi.fn(),
    };
    useRouterMock.mockReturnValue(router);

    const { container, root } = render();

    clickButtonByText(container, "Cancelar");

    expect(router.back).not.toHaveBeenCalled();
    expect(router.push).toHaveBeenCalledWith("/");

    act(() => {
      root.unmount();
    });
  });

  it("restores defaults and returns the wizard to identity", () => {
    useKeywordsMock.mockReturnValue(createKeywordsContext());

    const { container, root } = render();

    clickContinueTimes(container, 2);

    const resetButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent?.includes("Restaurar Padrão"),
    );
    expect(resetButton).toBeDefined();

    act(() => {
      resetButton?.dispatchEvent(
        new MouseEvent("click", { bubbles: true, cancelable: true }),
      );
    });

    expect(container.textContent).toContain("Identidade");

    act(() => {
      root.unmount();
    });
  });

  it("saves language documentation entries alongside renamed keywords", () => {
    const context = createKeywordsContext();
    useKeywordsMock.mockReturnValue(context);

    const { container, root } = render();

    const nameInput = container.querySelector(
      'input[aria-label="Nome da linguagem"]',
    ) as HTMLInputElement | null;
    expect(nameInput).toBeInstanceOf(HTMLInputElement);
    setControlValue(nameInput!, "Doc Neon");

    clickButtonByText(container, "Continuar");

    const outputLexemeInput = Array.from(
      container.querySelectorAll("input"),
    ).find((input) => (input as HTMLInputElement).value === "print") as
      | HTMLInputElement
      | undefined;
    const outputDescription = Array.from(
      container.querySelectorAll("textarea"),
    ).find((textarea) =>
      textarea
        .getAttribute("aria-label")
        ?.includes("Palavra de saída descrição"),
    ) as HTMLTextAreaElement | undefined;

    expect(outputLexemeInput).toBeDefined();
    expect(outputDescription).toBeDefined();

    setControlValue(outputLexemeInput!, "mostrar");
    setControlValue(outputDescription!, "Exibe valores na saída.");

    clickContinueTimes(container, 5);
    clickButtonByText(container, "Salvar e Aplicar");

    expect(context.setCustomization).toHaveBeenCalledWith(
      expect.objectContaining({
        mappings: expect.arrayContaining([
          expect.objectContaining({
            original: "print",
            custom: "mostrar",
          }),
        ]),
        languageDocumentation: expect.objectContaining({
          "keyword.print": {
            description: "Exibe valores na saída.",
          },
        }),
      }),
    );

    act(() => {
      root.unmount();
    });
  });

  it("renders description editors for structure keywords, delimiters and rule aliases", () => {
    useKeywordsMock.mockReturnValue(createKeywordsContext());

    const { container, root } = render();

    clickButtonByText(container, "Estrutura");

    expect(
      Array.from(container.querySelectorAll("textarea")).some((textarea) =>
        textarea.getAttribute("aria-label")?.includes("void descrição"),
      ),
    ).toBe(true);
    expect(
      Array.from(container.querySelectorAll("textarea")).some((textarea) =>
        textarea.getAttribute("aria-label")?.includes("funcao descrição"),
      ),
    ).toBe(true);
    expect(
      Array.from(container.querySelectorAll("textarea")).some((textarea) =>
        textarea
          .getAttribute("aria-label")
          ?.includes("Terminador customizado descrição"),
      ),
    ).toBe(true);
    expect(
      Array.from(container.querySelectorAll("textarea")).some((textarea) =>
        textarea
          .getAttribute("aria-label")
          ?.includes("Delimitador de abertura descrição"),
      ),
    ).toBe(true);

    clickButtonByText(container, "Regras");

    expect(
      Array.from(container.querySelectorAll("textarea")).some((textarea) =>
        textarea.getAttribute("aria-label")?.includes("Logical AND descrição"),
      ),
    ).toBe(true);

    act(() => {
      root.unmount();
    });
  });
});
