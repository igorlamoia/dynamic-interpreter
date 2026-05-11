// @vitest-environment jsdom

import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { IdentityStep } from "./identity-step";

(
  globalThis as typeof globalThis & {
    IS_REACT_ACT_ENVIRONMENT: boolean;
  }
).IS_REACT_ACT_ENVIRONMENT = true;

vi.mock("lucide-react", () => ({
  Atom: () => <span>atom</span>,
  Code: () => <span>code</span>,
  Languages: () => <span>languages</span>,
  Sparkles: () => <span>sparkles</span>,
  SquareTerminal: () => <span>terminal</span>,
}));

describe("IdentityStep", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("shows free as the first preset option and omits traditional", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(
        <IdentityStep
          values={{
            selectedPresetId: "free",
            languageName: "",
            languageDescription: "",
            imageSearchQuery: "",
            imageSearchResults: [],
            selectedImageUrl: "",
            isSearchingImages: false,
            imageSearchError: null,
          }}
          actions={{
            selectPreset: vi.fn(),
            setLanguageName: vi.fn(),
            setLanguageDescription: vi.fn(),
            setImageSearchQuery: vi.fn(),
            searchImages: vi.fn(),
            selectImage: vi.fn(),
          }}
        />,
      );
    });

    const buttons = Array.from(container.querySelectorAll("button"));
    expect(buttons[0]?.textContent).toContain("Livre");
    expect(container.textContent).not.toContain("Tradicional");

    act(() => {
      root.unmount();
    });
  });

  it("lets the user type a language name, search images, and select a result", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    const setLanguageName = vi.fn();
    const setLanguageDescription = vi.fn();
    const setImageSearchQuery = vi.fn();
    const searchImages = vi.fn();
    const selectImage = vi.fn();

    act(() => {
      root.render(
        <IdentityStep
          values={{
            selectedPresetId: "didactic-pt",
            languageName: "Didatica Neon",
            languageDescription: "Uma linguagem para aulas de logica.",
            imageSearchQuery: "neon",
            imageSearchResults: [
              {
                id: 1,
                provider: "unsplash",
                previewURL: "https://img.example/preview.png",
                webformatURL: "https://img.example/full.png",
                tags: "neon, language",
              },
            ],
            selectedImageUrl: "https://img.example/full.png",
            isSearchingImages: false,
            imageSearchError: null,
          }}
          actions={{
            selectPreset: vi.fn(),
            setLanguageName,
            setLanguageDescription,
            setImageSearchQuery,
            searchImages,
            selectImage,
          }}
        />,
      );
    });

    const languageNameInput = container.querySelector(
      'input[aria-label="Nome da linguagem"]',
    ) as HTMLInputElement | null;
    const imageSearchInput = container.querySelector(
      'input[aria-label="Buscar imagem da linguagem"]',
    ) as HTMLInputElement | null;
    const languageDescriptionInput = container.querySelector(
      'textarea[aria-label="Descrição da linguagem"]',
    ) as HTMLTextAreaElement | null;
    const searchButton = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent?.includes("Buscar imagens"),
    );
    const selectedImageButton = Array.from(
      container.querySelectorAll("button"),
    ).find((button) => button.textContent?.includes("Selecionada"));

    expect(languageNameInput).toBeInstanceOf(HTMLInputElement);
    expect(languageDescriptionInput).toBeInstanceOf(HTMLTextAreaElement);
    expect(imageSearchInput).toBeInstanceOf(HTMLInputElement);
    expect(searchButton).toBeDefined();
    expect(selectedImageButton).toBeDefined();
    expect(container.textContent).toContain("Resultados de imagem fornecidos por Unsplash.");

    act(() => {
      const valueSetter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      )?.set;
      valueSetter?.call(languageNameInput, "Mineres Neon");
      languageNameInput?.dispatchEvent(
        new Event("input", { bubbles: true, cancelable: true }),
      );
      const textareaValueSetter = Object.getOwnPropertyDescriptor(
        HTMLTextAreaElement.prototype,
        "value",
      )?.set;
      textareaValueSetter?.call(
        languageDescriptionInput,
        "Linguagem focada em algoritmos.",
      );
      languageDescriptionInput?.dispatchEvent(
        new Event("input", { bubbles: true, cancelable: true }),
      );
      valueSetter?.call(imageSearchInput, "compiler");
      imageSearchInput?.dispatchEvent(
        new Event("input", { bubbles: true, cancelable: true }),
      );
      searchButton?.dispatchEvent(
        new MouseEvent("click", { bubbles: true, cancelable: true }),
      );
      selectedImageButton?.dispatchEvent(
        new MouseEvent("click", { bubbles: true, cancelable: true }),
      );
    });

    expect(setLanguageName).toHaveBeenCalledWith("Mineres Neon");
    expect(setLanguageDescription).toHaveBeenCalledWith(
      "Linguagem focada em algoritmos.",
    );
    expect(setImageSearchQuery).toHaveBeenCalledWith("compiler");
    expect(searchImages).toHaveBeenCalledTimes(1);
    expect(selectImage).toHaveBeenCalledWith("https://img.example/full.png");

    act(() => {
      root.unmount();
    });
  });
});
