// @vitest-environment jsdom

import React from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Language } from "@/lib/languages-api";
import type {
  LanguageSaveInput,
  LanguageSaveResult,
} from "@/hooks/useLanguagePersistence";

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const useKeywordsMock = vi.fn();
const useRouterMock = vi.fn();
const persistMock =
  vi.fn<(input: LanguageSaveInput) => Promise<LanguageSaveResult>>();
const persistenceStateMock = vi.fn();
const editingIdSeenByHook = { current: undefined as number | null | undefined };

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

vi.mock("@/hooks/useLanguagePersistence", () => ({
  useLanguagePersistence: (editingLanguageId: number | null) => {
    editingIdSeenByHook.current = editingLanguageId;
    return persistenceStateMock();
  },
}));

import { getDefaultCustomizationState } from "@/contexts/keyword/KeywordContext";
import {
  KeywordCustomizerProvider,
  useKeywordCustomizer,
} from "./keyword-customizer-context";

function createKeywordsContext() {
  return {
    customization: getDefaultCustomizationState(),
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
  };
}

function createLanguage(overrides: Partial<Language> = {}): Language {
  return {
    id: 7,
    ownerId: 1,
    name: "Neonica",
    description: "Uma linguagem de teste",
    imageUrl: "https://example.test/neon.png",
    imageQuery: "neon",
    presetId: "python-like",
    clonedFromId: null,
    customization: getDefaultCustomizationState(),
    createdAt: "2026-08-01T00:00:00Z",
    updatedAt: "2026-08-02T00:00:00Z",
    ...overrides,
  };
}

function Probe() {
  const { languageName, saveMode, activeStep, errors, actions } =
    useKeywordCustomizer();

  return (
    <div>
      <span data-testid="name">{languageName}</span>
      <span data-testid="mode">{saveMode}</span>
      <span data-testid="step">{activeStep.id}</span>
      <span data-testid="error">{errors.currentError ?? ""}</span>
      <button
        data-testid="set-name"
        onClick={() => actions.setLanguageName("Neonica")}
      />
      <button
        data-testid="goto-review"
        onClick={() => actions.goToWizardStep("review")}
      />
      <button data-testid="save" onClick={() => actions.save()} />
    </div>
  );
}

describe("KeywordCustomizerProvider save", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    useKeywordsMock.mockReset();
    useRouterMock.mockReset();
    persistMock.mockReset();
    persistenceStateMock.mockReset();
    editingIdSeenByHook.current = undefined;
    sessionStorage.removeItem("language-creator:return");

    useKeywordsMock.mockReturnValue(createKeywordsContext());
    useRouterMock.mockReturnValue({ push: vi.fn(), back: vi.fn() });
    persistMock.mockResolvedValue({
      ok: true,
      mode: "local",
      languageId: null,
    });
    persistenceStateMock.mockReturnValue({
      mode: "local",
      isReady: true,
      persist: persistMock,
      isPending: false,
    });
  });

  afterEach(() => {
    act(() => {
      root?.unmount();
    });
    document.body.innerHTML = "";
  });

  function render(props: {
    editingLanguageId?: number | null;
    initialLanguage?: Language | null;
  } = {}) {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    act(() => {
      root.render(
        <QueryClientProvider client={client}>
          <KeywordCustomizerProvider {...props}>
            <Probe />
          </KeywordCustomizerProvider>
        </QueryClientProvider>,
      );
    });

    return container;
  }

  function read(testId: string) {
    return container.querySelector(`[data-testid="${testId}"]`)?.textContent;
  }

  function click(testId: string) {
    act(() => {
      container
        .querySelector(`[data-testid="${testId}"]`)
        ?.dispatchEvent(
          new MouseEvent("click", { bubbles: true, cancelable: true }),
        );
    });
  }

  async function fillNameAndSave() {
    click("set-name");
    click("goto-review");
    await act(async () => {
      container
        .querySelector('[data-testid="save"]')
        ?.dispatchEvent(
          new MouseEvent("click", { bubbles: true, cancelable: true }),
        );
    });
  }

  it("opens blank and stays in local mode when no language is being edited", () => {
    render();

    expect(read("name")).toBe("");
    expect(read("mode")).toBe("local");
    expect(editingIdSeenByHook.current).toBeNull();
  });

  it("seeds the identity fields from the language being edited", () => {
    render({
      editingLanguageId: 7,
      initialLanguage: createLanguage(),
    });

    expect(read("name")).toBe("Neonica");
    expect(editingIdSeenByHook.current).toBe(7);
  });

  it("exits through the router when the save is local", async () => {
    const router = { push: vi.fn(), back: vi.fn() };
    useRouterMock.mockReturnValue(router);

    render();
    await fillNameAndSave();

    expect(persistMock).toHaveBeenCalledTimes(1);
    expect(persistMock.mock.calls[0]?.[0]).toMatchObject({ name: "Neonica" });
    expect(router.push).toHaveBeenCalledWith("/");
    expect(router.push).not.toHaveBeenCalledWith("/languages");
  });

  it("redirects to the language list when the save reached the backend", async () => {
    const router = { push: vi.fn(), back: vi.fn() };
    useRouterMock.mockReturnValue(router);
    persistenceStateMock.mockReturnValue({
      mode: "create",
      isReady: true,
      persist: persistMock,
      isPending: false,
    });
    persistMock.mockResolvedValue({ ok: true, mode: "create", languageId: 12 });

    render();
    await fillNameAndSave();

    expect(read("mode")).toBe("create");
    expect(router.push).toHaveBeenCalledWith("/languages");
  });

  it("keeps the user on the identity step when the name is already taken", async () => {
    const router = { push: vi.fn(), back: vi.fn() };
    useRouterMock.mockReturnValue(router);
    persistenceStateMock.mockReturnValue({
      mode: "create",
      isReady: true,
      persist: persistMock,
      isPending: false,
    });
    persistMock.mockResolvedValue({ ok: false, reason: "duplicate-name" });

    render();
    await fillNameAndSave();

    expect(router.push).not.toHaveBeenCalled();
    expect(read("step")).toBe("identity");
    expect(read("error")).toContain("já tem uma linguagem com esse nome");
    expect(read("name")).toBe("Neonica");
  });

  it("does not blame the user when the session has not hydrated yet", async () => {
    const router = { push: vi.fn(), back: vi.fn() };
    useRouterMock.mockReturnValue(router);
    persistenceStateMock.mockReturnValue({
      mode: "create",
      isReady: false,
      persist: persistMock,
      isPending: false,
    });
    persistMock.mockResolvedValue({ ok: false, reason: "not-ready" });

    render();
    await fillNameAndSave();

    expect(router.push).not.toHaveBeenCalled();
    expect(read("step")).toBe("review");
    expect(read("error")).toContain("Aguarde um instante");
  });

  it("reports an unknown failure without leaving the wizard", async () => {
    const router = { push: vi.fn(), back: vi.fn() };
    useRouterMock.mockReturnValue(router);
    persistenceStateMock.mockReturnValue({
      mode: "update",
      isReady: true,
      persist: persistMock,
      isPending: false,
    });
    persistMock.mockResolvedValue({ ok: false, reason: "unknown" });

    render({ editingLanguageId: 7, initialLanguage: createLanguage() });
    await act(async () => {
      container
        .querySelector('[data-testid="save"]')
        ?.dispatchEvent(
          new MouseEvent("click", { bubbles: true, cancelable: true }),
        );
    });

    expect(router.push).not.toHaveBeenCalled();
    expect(read("error")).toContain("Não foi possível salvar");
  });

  it("does not apply the customization when the save failed", async () => {
    const keywords = createKeywordsContext();
    useKeywordsMock.mockReturnValue(keywords);
    persistenceStateMock.mockReturnValue({
      mode: "create",
      isReady: true,
      persist: persistMock,
      isPending: false,
    });
    persistMock.mockResolvedValue({ ok: false, reason: "unknown" });

    render();
    await fillNameAndSave();

    expect(keywords.setCustomization).not.toHaveBeenCalled();
  });
});
