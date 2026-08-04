// @vitest-environment jsdom

import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LanguagesView } from "./languages-view";

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const pushMock = vi.fn();
const listQueryMock = vi.fn();
const setActiveMutateMock = vi.fn();
const cloneMutateMock = vi.fn();
const deleteMutateMock = vi.fn();
const showToastMock = vi.fn();

vi.mock("next/router", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/hooks/useLanguages", () => ({
  useLanguagesList: () => listQueryMock(),
  useSetActiveLanguage: () => ({
    mutateAsync: setActiveMutateMock,
    isPending: false,
  }),
  useCloneLanguage: () => ({ mutateAsync: cloneMutateMock, isPending: false }),
  useDeleteLanguage: () => ({ mutateAsync: deleteMutateMock, isPending: false }),
  useActiveLanguage: () => ({ data: { id: 1 } }),
}));

vi.mock("@/contexts/ToastContext", () => ({
  useToast: () => ({ showToast: showToastMock }),
}));

vi.mock("lucide-react", () => ({
  Copy: () => <span>copy</span>,
  Languages: () => <span>languages</span>,
  Loader2: () => <span>loading</span>,
  Pencil: () => <span>pencil</span>,
  Plus: () => <span>plus</span>,
  Star: () => <span>star</span>,
  Trash2: () => <span>trash</span>,
}));

const LANGUAGES = [
  {
    id: 1,
    ownerId: 7,
    name: "PtBr-Lang",
    description: "Português",
    imageUrl: "https://cdn.example/ptbr.png",
    clonedFromId: null,
    updatedAt: "2026-08-01T00:00:00Z",
  },
  {
    id: 2,
    ownerId: 7,
    name: "MinhaLang",
    description: null,
    imageUrl: null,
    clonedFromId: 1,
    updatedAt: "2026-08-02T00:00:00Z",
  },
];

function render() {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(<LanguagesView />);
  });
  return { container, root };
}

function click(element: Element | null | undefined) {
  act(() => {
    element?.dispatchEvent(
      new MouseEvent("click", { bubbles: true, cancelable: true }),
    );
  });
}

describe("LanguagesView", () => {
  beforeEach(() => {
    pushMock.mockReset();
    setActiveMutateMock.mockReset().mockResolvedValue(undefined);
    cloneMutateMock.mockReset().mockResolvedValue({ name: "PtBr-Lang (cópia)" });
    deleteMutateMock.mockReset().mockResolvedValue(undefined);
    showToastMock.mockReset();
    listQueryMock.mockReturnValue({ data: LANGUAGES, isPending: false });
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("renderiza um card por linguagem", () => {
    const { container, root } = render();

    const cards = container.querySelectorAll('[data-testid="language-card"]');
    expect(cards).toHaveLength(2);
    expect(container.textContent).toContain("PtBr-Lang");
    expect(container.textContent).toContain("MinhaLang");

    act(() => root.unmount());
  });

  it("marca visualmente a linguagem ativa", () => {
    const { container, root } = render();

    const active = container.querySelector('[data-language-active="true"]');
    expect(active).toBeTruthy();
    expect(active?.textContent).toContain("PtBr-Lang");
    expect(
      container.querySelectorAll('[data-language-active="true"]'),
    ).toHaveLength(1);

    act(() => root.unmount());
  });

  it("usa a imagem padrão quando a linguagem não tem imagem", () => {
    const { container, root } = render();

    const sources = Array.from(container.querySelectorAll("img")).map((image) =>
      image.getAttribute("src"),
    );
    expect(sources).toContain("https://cdn.example/ptbr.png");
    expect(sources).toContain("/images/language-default.png");

    act(() => root.unmount());
  });

  it("navega para o wizard com o id ao editar", () => {
    const { container, root } = render();

    click(container.querySelector('button[aria-label="Editar PtBr-Lang"]'));

    expect(pushMock).toHaveBeenCalledWith("/language-creator?id=1");

    act(() => root.unmount());
  });

  it("navega para o wizard sem id ao criar", () => {
    const { container, root } = render();

    click(container.querySelector('button[aria-label="Nova linguagem"]'));

    expect(pushMock).toHaveBeenCalledWith("/language-creator");

    act(() => root.unmount());
  });

  it("ativa a linguagem escolhida", async () => {
    const { container, root } = render();

    click(container.querySelector('button[aria-label="Tornar MinhaLang ativa"]'));
    await act(async () => {});

    expect(setActiveMutateMock).toHaveBeenCalledWith(2);

    act(() => root.unmount());
  });

  it("duplica a linguagem escolhida", async () => {
    const { container, root } = render();

    click(container.querySelector('button[aria-label="Duplicar PtBr-Lang"]'));
    await act(async () => {});

    expect(cloneMutateMock).toHaveBeenCalledWith(1);

    act(() => root.unmount());
  });

  it("explica o 409 ao excluir uma linguagem em uso", async () => {
    deleteMutateMock.mockRejectedValue({ response: { status: 409 } });
    vi.spyOn(window, "confirm").mockReturnValue(true);

    const { container, root } = render();

    click(container.querySelector('button[aria-label="Excluir PtBr-Lang"]'));
    await act(async () => {});

    expect(showToastMock).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "error",
        message: expect.stringContaining("exercício"),
      }),
    );

    act(() => root.unmount());
  });

  it("oferece criar a primeira quando não há nenhuma", () => {
    listQueryMock.mockReturnValue({ data: [], isPending: false });

    const { container, root } = render();

    expect(container.textContent).toContain("Nenhuma linguagem");
    expect(
      container.querySelectorAll('[data-testid="language-card"]'),
    ).toHaveLength(0);

    act(() => root.unmount());
  });
});
