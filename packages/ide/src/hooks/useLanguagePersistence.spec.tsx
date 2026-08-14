// @vitest-environment jsdom

import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  useLanguagePersistence,
  type LanguageSaveInput,
  type LanguageSaveResult,
} from "./useLanguagePersistence";

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const useAuthMock = vi.fn();
const createMutateMock = vi.fn();
const updateMutateMock = vi.fn();
const saveLocalMock = vi.fn();

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => useAuthMock(),
}));

vi.mock("@/hooks/useLanguages", () => ({
  useCreateLanguage: () => ({ mutateAsync: createMutateMock, isPending: false }),
  useUpdateLanguage: () => ({ mutateAsync: updateMutateMock, isPending: false }),
}));

vi.mock("@/lib/keyword-language-storage", () => ({
  saveSavedKeywordLanguage: (...args: unknown[]) => saveLocalMock(...args),
}));

const CUSTOMIZATION = {
  mappings: [],
  operatorWordMap: {},
  booleanLiteralMap: { true: "true", false: "false" },
  statementTerminatorLexeme: ";",
  blockDelimiters: { open: "{", close: "}" },
  modes: { semicolon: "required", block: "braces", typing: "static", array: "brackets" },
  languageDocumentation: {},
} as unknown as LanguageSaveInput["customization"];

const INPUT: LanguageSaveInput = {
  name: "Gatinho",
  description: "Linguagem felina",
  imageUrl: "https://cdn.example/gato.png",
  imageQuery: "gato",
  presetId: "didactic-pt",
  customization: CUSTOMIZATION,
};

function mount(editingLanguageId: number | null) {
  const captured: { current: ReturnType<typeof useLanguagePersistence> | null } = {
    current: null,
  };

  function Probe() {
    captured.current = useLanguagePersistence(editingLanguageId);
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

describe("useLanguagePersistence", () => {
  beforeEach(() => {
    createMutateMock.mockReset().mockResolvedValue({ id: 42 });
    updateMutateMock.mockReset().mockResolvedValue({ id: 7 });
    saveLocalMock.mockReset();
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("grava no localStorage quando não há sessão", async () => {
    useAuthMock.mockReturnValue({ isAuthenticated: false, isHydrated: true });
    const { captured, root } = mount(null);

    expect(captured.current?.mode).toBe("local");

    let result: LanguageSaveResult | undefined;
    await act(async () => {
      result = await captured.current?.persist(INPUT);
    });

    expect(saveLocalMock).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Gatinho",
        slug: "Gatinho",
        imageUrl: "https://cdn.example/gato.png",
        imageQuery: "gato",
        presetId: "didactic-pt",
      }),
    );
    expect(createMutateMock).not.toHaveBeenCalled();
    expect(updateMutateMock).not.toHaveBeenCalled();
    expect(result).toEqual({ ok: true, mode: "local", languageId: null });

    act(() => root.unmount());
  });

  it("cria no backend quando logado e sem id", async () => {
    useAuthMock.mockReturnValue({ isAuthenticated: true, isHydrated: true });
    const { captured, root } = mount(null);

    expect(captured.current?.mode).toBe("create");

    let result: LanguageSaveResult | undefined;
    await act(async () => {
      result = await captured.current?.persist(INPUT);
    });

    expect(createMutateMock).toHaveBeenCalledWith({
      name: "Gatinho",
      description: "Linguagem felina",
      customization: CUSTOMIZATION,
      imageUrl: "https://cdn.example/gato.png",
      imageQuery: "gato",
      presetId: "didactic-pt",
    });
    expect(result).toEqual({ ok: true, mode: "create", languageId: 42 });

    act(() => root.unmount());
  });

  it("atualiza no backend quando logado e com id", async () => {
    useAuthMock.mockReturnValue({ isAuthenticated: true, isHydrated: true });
    const { captured, root } = mount(7);

    expect(captured.current?.mode).toBe("update");

    let result: LanguageSaveResult | undefined;
    await act(async () => {
      result = await captured.current?.persist(INPUT);
    });

    expect(updateMutateMock).toHaveBeenCalledWith({
      id: 7,
      input: {
        name: "Gatinho",
        description: "Linguagem felina",
        customization: CUSTOMIZATION,
        imageUrl: "https://cdn.example/gato.png",
        imageQuery: "gato",
        presetId: "didactic-pt",
      },
    });
    expect(result).toEqual({ ok: true, mode: "update", languageId: 7 });

    act(() => root.unmount());
  });

  it("reporta nome duplicado quando o backend devolve 409", async () => {
    useAuthMock.mockReturnValue({ isAuthenticated: true, isHydrated: true });
    createMutateMock.mockRejectedValue({
      isAxiosError: true,
      response: { status: 409 },
    });
    const { captured, root } = mount(null);

    let result: LanguageSaveResult | undefined;
    await act(async () => {
      result = await captured.current?.persist(INPUT);
    });

    expect(result).toEqual({ ok: false, reason: "duplicate-name" });

    act(() => root.unmount());
  });

  it("reporta falha genérica nos demais erros", async () => {
    useAuthMock.mockReturnValue({ isAuthenticated: true, isHydrated: true });
    createMutateMock.mockRejectedValue({
      isAxiosError: true,
      response: { status: 500 },
    });
    const { captured, root } = mount(null);

    let result: LanguageSaveResult | undefined;
    await act(async () => {
      result = await captured.current?.persist(INPUT);
    });

    expect(result).toEqual({ ok: false, reason: "unknown" });

    act(() => root.unmount());
  });

  it("recusa persistir antes da hidratação, mesmo autenticado", async () => {
    useAuthMock.mockReturnValue({ isAuthenticated: true, isHydrated: false });
    const { captured, root } = mount(null);

    let result: LanguageSaveResult | undefined;
    await act(async () => {
      result = await captured.current?.persist(INPUT);
    });

    expect(result).toEqual({ ok: false, reason: "not-ready" });
    expect(saveLocalMock).not.toHaveBeenCalled();
    expect(createMutateMock).not.toHaveBeenCalled();
    expect(updateMutateMock).not.toHaveBeenCalled();

    act(() => root.unmount());
  });

  it("expõe isReady conforme a hidratação do AuthContext", () => {
    useAuthMock.mockReturnValue({ isAuthenticated: true, isHydrated: false });
    const notReady = mount(null);
    expect(notReady.captured.current?.isReady).toBe(false);
    act(() => notReady.root.unmount());

    useAuthMock.mockReturnValue({ isAuthenticated: true, isHydrated: true });
    const ready = mount(null);
    expect(ready.captured.current?.isReady).toBe(true);
    act(() => ready.root.unmount());
  });
});
