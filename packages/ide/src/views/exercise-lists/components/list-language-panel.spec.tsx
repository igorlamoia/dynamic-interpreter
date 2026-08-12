// @vitest-environment jsdom

import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ListLanguagePanel } from "./list-language-panel";
import type { ExerciseList } from "@/types/api";

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const mutateAsyncMock = vi.fn();
const useLanguagesListMock = vi.fn();

vi.mock("@/hooks/use-api-queries", () => ({
  useUpdateExerciseListMutation: () => ({
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

vi.mock("lucide-react", () => ({
  Languages: () => <span>languages</span>,
  Lock: () => <span>lock</span>,
  Unlock: () => <span>unlock</span>,
  LoaderCircle: () => <span>loader</span>,
}));

const LANG = { id: 3, name: "Portugolzinho" };

function buildList(overrides: Partial<ExerciseList> = {}): ExerciseList {
  return {
    id: 7,
    teacherId: 1,
    title: "Recursao",
    description: "",
    createdAt: "",
    updatedAt: "",
    items: [],
    classes: [],
    languagePolicy: "OPEN",
    lockedLanguageId: null,
    lockedLanguage: null,
    ...overrides,
  } as ExerciseList;
}

function render(list: ExerciseList, lockedItemCount = 0) {
  useLanguagesListMock.mockReturnValue({ data: [LANG] });
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(
      <ListLanguagePanel list={list} lockedItemCount={lockedItemCount} />,
    );
  });
  return { container, root };
}

function click(element: Element | null | undefined) {
  act(() => {
    element?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
}

describe("ListLanguagePanel", () => {
  beforeEach(() => {
    mutateAsyncMock.mockReset();
    mutateAsyncMock.mockResolvedValue({});
    useLanguagesListMock.mockReset();
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("mostra o estado aberto quando a lista nao trava", () => {
    const { container } = render(buildList());
    expect(container.textContent).toContain("aluno usa a própria linguagem");
  });

  it("mostra a linguagem travada", () => {
    const { container } = render(
      buildList({
        languagePolicy: "LOCKED",
        lockedLanguageId: 3,
        lockedLanguage: { id: 3, name: "Portugolzinho" } as never,
      }),
    );
    expect(container.textContent).toContain("Portugolzinho");
  });

  it("avisa quantos itens nao herdam a linguagem", () => {
    const { container } = render(
      buildList({
        languagePolicy: "LOCKED",
        lockedLanguageId: 3,
        lockedLanguage: { id: 3, name: "Portugolzinho" } as never,
      }),
      2,
    );
    expect(container.textContent).toContain("2");
    expect(container.textContent).toContain("trava própria");
  });

  it("avisa quando a lista esta publicada", () => {
    const { container } = render(
      buildList({
        classes: [
          { classId: 1, totalGrade: 10, minRequired: 1, deadline: "" },
          { classId: 2, totalGrade: 10, minRequired: 1, deadline: "" },
        ],
      }),
    );
    expect(container.textContent).toContain("2 turmas");
  });

  it("salva a linguagem escolhida via PATCH", () => {
    const { container } = render(buildList());

    click(container.querySelector('button[aria-label="Alterar linguagem"]'));

    const lockedRadio = container.querySelector<HTMLInputElement>(
      'input[aria-label="Travado"]',
    );
    act(() => {
      lockedRadio?.click();
    });

    const select = container.querySelector<HTMLSelectElement>(
      'select[aria-label="Linguagem"]',
    );
    act(() => {
      Object.getOwnPropertyDescriptor(
        window.HTMLSelectElement.prototype,
        "value",
      )?.set?.call(select, "3");
      select?.dispatchEvent(new Event("change", { bubbles: true }));
    });

    click(container.querySelector('button[aria-label="Salvar linguagem"]'));

    expect(mutateAsyncMock).toHaveBeenCalledWith({
      listId: 7,
      languagePolicy: "LOCKED",
      lockedLanguageId: 3,
    });
  });

  it("nao salva LOCKED sem linguagem escolhida", () => {
    const { container } = render(buildList());

    click(container.querySelector('button[aria-label="Alterar linguagem"]'));
    const lockedRadio = container.querySelector<HTMLInputElement>(
      'input[aria-label="Travado"]',
    );
    act(() => {
      lockedRadio?.click();
    });
    click(container.querySelector('button[aria-label="Salvar linguagem"]'));

    expect(mutateAsyncMock).not.toHaveBeenCalled();
  });
});
