// @vitest-environment jsdom

import React from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CreateExerciseModal } from "./create-exercise-modal";

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const mutateAsyncMock = vi.fn();
const useLanguagesListMock = vi.fn();

vi.mock("@/hooks/use-api-queries", () => ({
  useCreateExerciseMutation: () => ({
    mutateAsync: mutateAsyncMock,
    isPending: false,
  }),
}));

vi.mock("@/hooks/useLanguages", () => ({
  useLanguagesList: () => useLanguagesListMock(),
}));

vi.mock("@/contexts/ToastContext", () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

// O radix Dialog monta em portal no document.body, entao as queries abaixo
// partem do body e nao do container. Os icones vem do Accordion (ChevronDown)
// e do HeroButton (LoaderCircle).
vi.mock("lucide-react", () => ({
  ChevronDown: () => <span>chevron</span>,
  Globe2: () => <span>globe</span>,
  LockKeyhole: () => <span>lock-keyhole</span>,
  LoaderCircle: () => <span>loader</span>,
  Plus: () => <span>plus</span>,
  Trash2: () => <span>trash</span>,
}));

function setNativeValue(element: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const proto =
    element instanceof HTMLTextAreaElement
      ? window.HTMLTextAreaElement.prototype
      : window.HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, "value")?.set?.call(element, value);
  element.dispatchEvent(new Event("input", { bubbles: true }));
}

describe("CreateExerciseModal", () => {
  let root: Root;

  beforeEach(() => {
    mutateAsyncMock.mockReset();
    mutateAsyncMock.mockResolvedValue({});
    useLanguagesListMock.mockReset();
    useLanguagesListMock.mockReturnValue({
      data: [
        {
          id: 3,
          name: "Portugolzinho",
          imageUrl: "https://cdn.example/portugolzinho.png",
        },
      ],
    });

    const container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => {
      root.render(<CreateExerciseModal open onOpenChange={vi.fn()} />);
    });
  });

  afterEach(() => {
    act(() => root.unmount());
    document.body.innerHTML = "";
  });

  it("mostra o erro e nao cria quando LOCKED fica sem linguagem", async () => {
    const inputs = document.body.querySelectorAll<HTMLInputElement>(
      'input[name="title"]',
    );
    const textarea = document.body.querySelector<HTMLTextAreaElement>(
      'textarea[name="description"]',
    );
    act(() => {
      setNativeValue(inputs[0], "Fatorial");
      setNativeValue(textarea as HTMLTextAreaElement, "Calcule o fatorial.");
    });

    const lockedRadio = document.body.querySelector<HTMLInputElement>(
      'input[aria-label="Travado"]',
    );
    act(() => {
      lockedRadio?.click();
    });

    // O select aparece, mas o professor nao escolhe nada.
    expect(
      document.body.querySelector('select[aria-label="Linguagem"]'),
    ).toBeTruthy();

    const form = document.body.querySelector<HTMLFormElement>(
      "#create-exercise-page-form",
    );
    await act(async () => {
      form?.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true }),
      );
    });

    expect(document.body.textContent).toContain(
      "Selecione uma linguagem para travar o exercício",
    );
    expect(mutateAsyncMock).not.toHaveBeenCalled();
  });

  it("cria o exercicio quando a linguagem travada e escolhida", async () => {
    const title = document.body.querySelector<HTMLInputElement>(
      'input[name="title"]',
    );
    const textarea = document.body.querySelector<HTMLTextAreaElement>(
      'textarea[name="description"]',
    );
    act(() => {
      setNativeValue(title as HTMLInputElement, "Fatorial");
      setNativeValue(textarea as HTMLTextAreaElement, "Calcule o fatorial.");
    });

    const lockedRadio = document.body.querySelector<HTMLInputElement>(
      'input[aria-label="Travado"]',
    );
    act(() => {
      lockedRadio?.click();
    });

    const select = document.body.querySelector<HTMLSelectElement>(
      'select[aria-label="Linguagem"]',
    );
    act(() => {
      Object.getOwnPropertyDescriptor(
        window.HTMLSelectElement.prototype,
        "value",
      )?.set?.call(select, "3");
      select?.dispatchEvent(new Event("change", { bubbles: true }));
    });

    const form = document.body.querySelector<HTMLFormElement>(
      "#create-exercise-page-form",
    );
    await act(async () => {
      form?.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true }),
      );
    });

    // O caminho positivo prova que a assercao acima falha pelo guard e nao
    // por um submit que nunca chega ao onSubmit.
    expect(mutateAsyncMock).toHaveBeenCalledWith(
      expect.objectContaining({
        languagePolicy: "LOCKED",
        lockedLanguageId: 3,
      }),
    );
  });

  it("mostra a imagem da linguagem ao escolher uma linguagem travada", () => {
    const lockedRadio = document.body.querySelector<HTMLInputElement>(
      'input[aria-label="Travado"]',
    );
    act(() => {
      lockedRadio?.click();
    });

    const image = document.body.querySelector<HTMLImageElement>(
      'img[src="https://cdn.example/portugolzinho.png"]',
    );
    expect(image).toBeTruthy();
    expect(document.body.textContent).toContain("Portugolzinho");
  });

  it("salva varias entradas como uma unica string separada por quebra de linha", async () => {
    const title = document.body.querySelector<HTMLInputElement>(
      'input[name="title"]',
    );
    const description = document.body.querySelector<HTMLTextAreaElement>(
      'textarea[name="description"]',
    );
    act(() => {
      setNativeValue(title as HTMLInputElement, "Soma");
      setNativeValue(description as HTMLTextAreaElement, "Some dois numeros.");
    });

    const testCasesTrigger = Array.from(
      document.body.querySelectorAll<HTMLButtonElement>("button"),
    ).find((button) => button.textContent?.includes("Casos de Teste"));
    act(() => {
      testCasesTrigger?.click();
    });

    let inputLines = document.body.querySelectorAll<HTMLInputElement>(
      'input[aria-label^="Entrada (stdin)"]',
    );
    act(() => {
      setNativeValue(inputLines[0], "7");
    });

    const addInputButton = Array.from(
      document.body.querySelectorAll<HTMLButtonElement>("button"),
    ).find((button) => button.textContent?.includes("Adicionar entrada"));
    act(() => {
      addInputButton?.click();
    });

    inputLines = document.body.querySelectorAll<HTMLInputElement>(
      'input[aria-label^="Entrada (stdin)"]',
    );
    act(() => {
      setNativeValue(inputLines[1], "8");
    });

    const output = document.body.querySelector<HTMLTextAreaElement>(
      'textarea[name="testCases.0.expectedOutput"]',
    );
    act(() => {
      setNativeValue(output as HTMLTextAreaElement, "15");
    });

    const form = document.body.querySelector<HTMLFormElement>(
      "#create-exercise-page-form",
    );
    await act(async () => {
      form?.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true }),
      );
    });

    expect(mutateAsyncMock).toHaveBeenCalledWith(
      expect.objectContaining({
        testCases: [
          expect.objectContaining({
            input: "7\n8",
            expectedOutput: "15",
          }),
        ],
      }),
    );
  });

  it("adiciona uma entrada ao pressionar Enter sem submeter o formulario", async () => {
    const testCasesTrigger = Array.from(
      document.body.querySelectorAll<HTMLButtonElement>("button"),
    ).find((button) => button.textContent?.includes("Casos de Teste"));
    act(() => {
      testCasesTrigger?.click();
    });

    const firstInput = document.body.querySelector<HTMLInputElement>(
      'input[aria-label="Entrada (stdin) 1"]',
    );
    act(() => {
      firstInput?.dispatchEvent(
        new KeyboardEvent("keydown", {
          bubbles: true,
          cancelable: true,
          key: "Enter",
        }),
      );
    });

    expect(
      document.body.querySelector<HTMLInputElement>(
        'input[aria-label="Entrada (stdin) 2"]',
      ),
    ).toBeTruthy();
    expect(mutateAsyncMock).not.toHaveBeenCalled();
  });
});
