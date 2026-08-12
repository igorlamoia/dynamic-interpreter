// @vitest-environment jsdom

import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getDefaultCustomizationState } from "@/contexts/keyword/KeywordContext";
import { saveSavedKeywordLanguage } from "@/lib/keyword-language-storage";

const useKeywordsMock = vi.fn();

vi.mock("@/contexts/keyword/KeywordContext", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/contexts/keyword/KeywordContext")>();

  return {
    ...actual,
    useKeywords: () => useKeywordsMock(),
  };
});

// O seletor passou a consumir `useLanguageChoices`, que chama `useAuth`. Estes
// dois casos descrevem o caminho deslogado, então é isso que mockamos.
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ isAuthenticated: false }),
}));

/**
 * O `localStorage` do jsdom 28 neste setup do vitest é um objeto sem os
 * métodos de `Storage` — `localStorage.clear` é `undefined` e estoura. Como
 * estes testes exercitam de propósito o caminho real de storage, instalamos um
 * `Storage` completo em vez de mockar o módulo.
 */
/**
 * `useLanguageChoices` consulta o backend via TanStack Query. Deslogado essas
 * queries ficam desabilitadas, mas os hooks ainda exigem um client no contexto.
 */
function renderSelector(container: HTMLElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const root = createRoot(container);

  act(() => {
    root.render(
      <QueryClientProvider client={queryClient}>
        <LanguageSelector />
      </QueryClientProvider>,
    );
  });

  return root;
}

function installLocalStorageStub() {
  const store = new Map<string, string>();

  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => void store.set(key, String(value)),
      removeItem: (key: string) => void store.delete(key),
      clear: () => store.clear(),
      key: (index: number) => Array.from(store.keys())[index] ?? null,
      get length() {
        return store.size;
      },
    },
  });
}

import { LanguageSelector } from "./language-selector";

(
  globalThis as typeof globalThis & {
    IS_REACT_ACT_ENVIRONMENT: boolean;
  }
).IS_REACT_ACT_ENVIRONMENT = true;

describe("LanguageSelector", () => {
  beforeEach(() => {
    installLocalStorageStub();
    useKeywordsMock.mockReset();
    useKeywordsMock.mockReturnValue({
      setCustomization: vi.fn(),
    });

    saveSavedKeywordLanguage({
      name: "Didatica Neon",
      slug: "didatica-neon",
      imageUrl: "https://img.example/neon.png",
      imageQuery: "neon code",
      presetId: "didactic-pt",
      customization: {
        ...getDefaultCustomizationState(),
        statementTerminatorLexeme: "fim",
      },
    });
    saveSavedKeywordLanguage({
      name: "Mineres Craft",
      slug: "mineres-craft",
      imageUrl: "https://img.example/mineres.png",
      imageQuery: "craft code",
      presetId: "mineres-like",
      customization: {
        ...getDefaultCustomizationState(),
        statementTerminatorLexeme: "uai",
      },
    });
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("renders saved language options and reflects the active selection", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = renderSelector(container);

    const select = container.querySelector(
      'select[aria-label="Selecionar linguagem salva"]',
    ) as HTMLSelectElement | null;

    expect(select).toBeInstanceOf(HTMLSelectElement);
    expect(select?.value).toBe("mineres-craft");
    expect(container.textContent).toContain("Didatica Neon");
    expect(container.textContent).toContain("Mineres Craft");

    act(() => {
      root.unmount();
    });
  });

  it("switches the active saved language and applies its customization", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const context = {
      setCustomization: vi.fn(),
    };
    useKeywordsMock.mockReturnValue(context);

    const root = renderSelector(container);

    const select = container.querySelector(
      'select[aria-label="Selecionar linguagem salva"]',
    ) as HTMLSelectElement | null;
    expect(select).toBeInstanceOf(HTMLSelectElement);

    act(() => {
      const valueSetter = Object.getOwnPropertyDescriptor(
        HTMLSelectElement.prototype,
        "value",
      )?.set;
      valueSetter?.call(select, "didatica-neon");
      select?.dispatchEvent(
        new Event("change", { bubbles: true, cancelable: true }),
      );
    });

    expect(localStorage.getItem("keyword-customization-active")).toBe(
      "didatica-neon",
    );
    expect(context.setCustomization).toHaveBeenCalledWith(
      expect.objectContaining({
        statementTerminatorLexeme: "fim",
      }),
    );

    act(() => {
      root.unmount();
    });
  });
});
