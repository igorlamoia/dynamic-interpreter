// @vitest-environment jsdom

import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { SelectedGrammarModes } from "@/features/grammarGraph/grammarGraphAdapter";
import { ReviewStep } from "../review-step";

type ImageMockProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
  alt: string;
};

(
  globalThis as typeof globalThis & {
    IS_REACT_ACT_ENVIRONMENT: boolean;
  }
).IS_REACT_ACT_ENVIRONMENT = true;

vi.mock("../../preview-code-comparison", () => ({
  PreviewCodeComparison: () => <div>Comparação</div>,
}));

vi.mock("../../token-preview", () => ({
  TokenPreview: () => <div>Tokens</div>,
}));

vi.mock("@/components/Ast", () => ({
  Ast: ({ selectedModes }: { selectedModes: SelectedGrammarModes }) => (
    <div data-testid="ast-viewer">{selectedModes.typingMode}</div>
  ),
}));

vi.mock("../../../laser-flow", () => ({
  default: () => <div />,
}));

vi.mock("@/hooks/useBreakpoint", () => ({
  useBreakpoint: () => ({
    current: {
      isXl: false,
      is2xl: false,
      is3xl: false,
    },
  }),
}));

vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: ImageMockProps) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

describe("ReviewStep", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("shows the custom language name and image separately from the base preset", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(
        <ReviewStep
          values={{
            preview: {
              languageLabel: "Teste",
              basedOnLabel: "Pythonica",
              languageImageUrl: "https://img.example/teste.jpg",
              dna: [],
              baselineSnippet: "",
              snippet: "",
              tokenPreview: [],
              chosenLexemes: [],
            },
            grammarModes: {
              typingMode: "typed",
              blockMode: "delimited",
              semicolonMode: "required",
              arrayMode: "fixed",
            },
            vocabularySections: [{ title: "Tipos", items: ["int", "float"] }],
            visitedStepIds: ["identity", "review"],
          }}
          actions={{
            selectStep: vi.fn(),
          }}
        />,
      );
    });

    expect(container.textContent).toContain("Nome da linguagem");
    expect(container.textContent).toContain("Teste");
    expect(container.textContent).toContain("Baseado em");
    expect(container.textContent).toContain("Pythonica");
    expect(container.querySelector("[data-testid='ast-viewer']")).not.toBeNull();
    expect(container.textContent).toContain("typed");
    const image = container.querySelector("img");
    expect(image?.getAttribute("src")).toBe("https://img.example/teste.jpg");
    expect(image?.getAttribute("alt")).toBe("Teste");

    act(() => {
      root.unmount();
    });
  });
});
