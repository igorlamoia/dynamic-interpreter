// @vitest-environment jsdom

import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useLanguageChoices } from "./useLanguageChoices";

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const useAuthMock = vi.fn();
const listQueryMock = vi.fn();
const activeQueryMock = vi.fn();
const setActiveMutateMock = vi.fn();
const setCustomizationMock = vi.fn();
const listLocalMock = vi.fn();
const loadLocalMock = vi.fn();
const loadActiveLocalMock = vi.fn();
const setActiveLocalMock = vi.fn();
const getDetailMock = vi.fn();

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => useAuthMock(),
}));

vi.mock("@/hooks/useLanguages", () => ({
  useLanguagesList: () => listQueryMock(),
  useActiveLanguage: () => activeQueryMock(),
  useSetActiveLanguage: () => ({
    mutateAsync: setActiveMutateMock,
    isPending: false,
  }),
}));

vi.mock("@/contexts/keyword/KeywordContext", () => ({
  useKeywords: () => ({ setCustomization: setCustomizationMock }),
}));

vi.mock("@/lib/languages-api", () => ({
  languagesApi: { get: (...args: unknown[]) => getDetailMock(...args) },
}));

// O módulo de storage é mockado por inteiro de propósito: com jsdom 28 neste
// setup do vitest o `localStorage` real não tem `.clear`, então specs que
// encostam nele quebram.
vi.mock("@/lib/keyword-language-storage", () => ({
  listSavedKeywordLanguages: () => listLocalMock(),
  loadSavedKeywordLanguage: (...args: unknown[]) => loadLocalMock(...args),
  loadActiveSavedKeywordLanguage: () => loadActiveLocalMock(),
  setActiveSavedKeywordLanguage: (...args: unknown[]) =>
    setActiveLocalMock(...args),
}));

const CUSTOMIZATION = { mappings: [] } as never;

function mount() {
  const captured: { current: ReturnType<typeof useLanguageChoices> | null } = {
    current: null,
  };

  function Probe() {
    captured.current = useLanguageChoices();
    return null;
  }

  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(<Probe />);
  });

  return { captured, root };
}

describe("useLanguageChoices", () => {
  beforeEach(() => {
    useAuthMock.mockReset();
    listQueryMock.mockReset().mockReturnValue({ data: undefined });
    activeQueryMock.mockReset().mockReturnValue({ data: null });
    setActiveMutateMock.mockReset().mockResolvedValue(undefined);
    setCustomizationMock.mockReset();
    listLocalMock.mockReset().mockReturnValue([]);
    loadLocalMock.mockReset();
    loadActiveLocalMock.mockReset().mockReturnValue(null);
    setActiveLocalMock.mockReset();
    getDetailMock.mockReset();
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("lista do backend quando logado", () => {
    useAuthMock.mockReturnValue({ isAuthenticated: true });
    listQueryMock.mockReturnValue({
      data: [
        {
          id: 3,
          ownerId: 1,
          name: "PtBr-Lang",
          description: null,
          imageUrl: "https://cdn.example/p.png",
          clonedFromId: null,
          updatedAt: "2026-08-01T00:00:00Z",
        },
      ],
    });

    const { captured, root } = mount();

    expect(captured.current?.choices).toEqual([
      { key: "3", name: "PtBr-Lang", imageUrl: "https://cdn.example/p.png" },
    ]);
    expect(listLocalMock).not.toHaveBeenCalled();

    act(() => root.unmount());
  });

  it("lista do localStorage quando deslogado", () => {
    useAuthMock.mockReturnValue({ isAuthenticated: false });
    listLocalMock.mockReturnValue([
      { name: "MinhaLang", slug: "minhalang", imageUrl: "/local.png" },
    ]);

    const { captured, root } = mount();

    expect(captured.current?.choices).toEqual([
      { key: "minhalang", name: "MinhaLang", imageUrl: "/local.png" },
    ]);

    act(() => root.unmount());
  });

  it("expõe a linguagem ativa completa vinda do backend", () => {
    useAuthMock.mockReturnValue({ isAuthenticated: true });
    listQueryMock.mockReturnValue({ data: [] });
    activeQueryMock.mockReturnValue({
      data: {
        id: 9,
        name: "PtBr-Lang",
        description: null,
        imageUrl: null,
        customization: CUSTOMIZATION,
      },
    });

    const { captured, root } = mount();

    expect(captured.current?.activeLanguage).toEqual({
      key: "9",
      name: "PtBr-Lang",
      description: "",
      imageUrl: "",
      customization: CUSTOMIZATION,
    });
    expect(captured.current?.activeKey).toBe("9");

    act(() => root.unmount());
  });

  it("expõe a linguagem ativa completa vinda do localStorage", () => {
    useAuthMock.mockReturnValue({ isAuthenticated: false });
    listLocalMock.mockReturnValue([
      { name: "MinhaLang", slug: "minhalang", imageUrl: "/local.png" },
    ]);
    loadActiveLocalMock.mockReturnValue({
      slug: "minhalang",
      name: "MinhaLang",
      description: "Feita em casa",
      imageUrl: "/local.png",
      customization: CUSTOMIZATION,
    });

    const { captured, root } = mount();

    expect(captured.current?.activeLanguage).toEqual({
      key: "minhalang",
      name: "MinhaLang",
      description: "Feita em casa",
      imageUrl: "/local.png",
      customization: CUSTOMIZATION,
    });
    expect(captured.current?.activeKey).toBe("minhalang");

    act(() => root.unmount());
  });

  it("ativa pelo backend quando logado", async () => {
    useAuthMock.mockReturnValue({ isAuthenticated: true });
    listQueryMock.mockReturnValue({ data: [] });
    getDetailMock.mockResolvedValue({ id: 5, customization: CUSTOMIZATION });

    const { captured, root } = mount();

    await act(async () => {
      await captured.current?.selectLanguage("5");
    });

    expect(setActiveMutateMock).toHaveBeenCalledWith(5);
    expect(setCustomizationMock).toHaveBeenCalledWith(CUSTOMIZATION);
    expect(setActiveLocalMock).not.toHaveBeenCalled();

    act(() => root.unmount());
  });

  it("ativa pelo localStorage quando deslogado", async () => {
    useAuthMock.mockReturnValue({ isAuthenticated: false });
    loadLocalMock.mockReturnValue({
      slug: "minhalang",
      name: "MinhaLang",
      description: "",
      imageUrl: "/local.png",
      customization: CUSTOMIZATION,
    });

    const { captured, root } = mount();

    await act(async () => {
      await captured.current?.selectLanguage("minhalang");
    });

    expect(setActiveLocalMock).toHaveBeenCalledWith("minhalang");
    expect(setCustomizationMock).toHaveBeenCalledWith(CUSTOMIZATION);
    expect(setActiveMutateMock).not.toHaveBeenCalled();
    expect(getDetailMock).not.toHaveBeenCalled();

    act(() => root.unmount());
  });
});
