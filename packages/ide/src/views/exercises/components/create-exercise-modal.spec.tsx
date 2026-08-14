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
  LoaderCircle: () => <span>loader</span>,
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
    useLanguagesListMock.mockReturnValue({ data: [{ id: 3, name: "Portugolzinho" }] });

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
});
