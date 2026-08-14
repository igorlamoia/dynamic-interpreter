// @vitest-environment jsdom

import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CommunityLanguagesView } from "./community-languages-view";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

const catalogQueryMock = vi.fn();
const importMutateMock = vi.fn();
const detailQueryMock = vi.fn();
const showToastMock = vi.fn();

vi.mock("@/hooks/useLanguages", () => ({
  useCommunityLanguages: (filters: Record<string, string>) =>
    catalogQueryMock(filters),
  useImportLanguage: () => ({
    mutateAsync: importMutateMock,
    isPending: false,
  }),
  useLanguageDetail: () => detailQueryMock(),
}));

vi.mock("@/contexts/ToastContext", () => ({
  useToast: () => ({ showToast: showToastMock }),
}));

const LANGUAGE = {
  id: 42,
  ownerId: 5,
  ownerName: "Ada",
  name: "Lunar",
  description: "Sintaxe orientada por indentação",
  imageUrl: null,
  clonedFromId: null,
  isPublic: true,
  publishedAt: "2026-08-12T00:00:00Z",
  updatedAt: "2026-08-12T00:00:00Z",
  dna: {
    typing: "untyped",
    array: "dynamic",
    block: "indentation",
    semicolon: "optional-eol",
  },
};

function render() {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(<CommunityLanguagesView />));
  return { container, root };
}

function click(element: Element | null) {
  act(() => {
    element?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
}

describe("CommunityLanguagesView", () => {
  beforeEach(() => {
    catalogQueryMock.mockReset().mockReturnValue({
      data: [LANGUAGE],
      isPending: false,
      isError: false,
    });
    importMutateMock.mockReset().mockResolvedValue({ name: "Lunar (cópia)" });
    detailQueryMock.mockReset().mockReturnValue({
      data: undefined,
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    });
    showToastMock.mockReset();
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("mostra autoria e DNA das linguagens publicadas", () => {
    const { container, root } = render();

    expect(container.querySelectorAll('[data-testid="community-language-card"]')).toHaveLength(1);
    expect(container.textContent).toContain("Lunar");
    expect(container.textContent).toContain("Ada");
    expect(container.textContent).toContain("Não tipada");
    expect(container.textContent).toContain("Blocos indentados");

    act(() => root.unmount());
  });

  it("importa uma linguagem para o acervo pessoal", async () => {
    const { container, root } = render();

    act(() => {
      container
        .querySelector('button[aria-label="Importar Lunar"]')
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    await act(async () => {});

    expect(importMutateMock).toHaveBeenCalledWith(42);
    expect(showToastMock).toHaveBeenCalledWith(
      expect.objectContaining({ type: "success" }),
    );

    act(() => root.unmount());
  });

  it("combina filtros de tipagem e blocos pelo DNA", () => {
    const { container, root } = render();

    click(container.querySelector('button[aria-label="Filtrar por Tipada"]'));
    click(container.querySelector('button[aria-label="Filtrar por Indentada"]'));

    expect(catalogQueryMock).toHaveBeenLastCalledWith({
      typing: "typed",
      block: "indentation",
    });
    expect(
      container
        .querySelector('button[aria-label="Filtrar por Tipada"]')
        ?.getAttribute("aria-pressed"),
    ).toBe("true");
    expect(container.textContent).toContain("2 filtros");

    click(Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent?.includes("Limpar DNA"),
    ) ?? null);

    expect(catalogQueryMock).toHaveBeenLastCalledWith({});

    act(() => root.unmount());
  });

  it("distingue busca vazia sem resultados", () => {
    catalogQueryMock.mockReturnValue({
      data: [],
      isPending: false,
      isError: false,
    });
    const { container, root } = render();

    expect(container.textContent).toContain("O atlas ainda está vazio");

    act(() => root.unmount());
  });
});
