// @vitest-environment jsdom

import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CUSTOMIZABLE_KEYWORDS, ORIGINAL_KEYWORDS } from "@/contexts/keyword";
import type { StoredKeywordCustomization } from "@/contexts/keyword/types";
import { buildHelloWorldSample } from "./language-sample";

(
  globalThis as typeof globalThis & {
    IS_REACT_ACT_ENVIRONMENT: boolean;
  }
).IS_REACT_ACT_ENVIRONMENT = true;

const useEditorMock = vi.fn();

vi.mock("@/hooks/useEditor", () => ({
  useEditor: () => useEditorMock(),
}));

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({
    children,
    open,
  }: {
    children: React.ReactNode;
    open?: boolean;
  }) => (open ? <div role="dialog">{children}</div> : null),
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogDescription: ({ children }: { children: React.ReactNode }) => (
    <p>{children}</p>
  ),
  DialogFooter: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <h2>{children}</h2>
  ),
}));

vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} alt={props.alt ?? ""} />
  ),
}));

vi.mock("next/router", () => ({
  useRouter: () => ({ locale: "en", push: vi.fn() }),
}));

import { CategoryLexemesList } from "./language-panel";

function createCustomization(): StoredKeywordCustomization {
  return {
    mappings: ORIGINAL_KEYWORDS.map((original) => ({
      original,
      custom: original,
      tokenId: CUSTOMIZABLE_KEYWORDS[original],
    })),
    operatorWordMap: {},
    booleanLiteralMap: { true: "true", false: "false" },
    statementTerminatorLexeme: ";",
    blockDelimiters: { open: "{", close: "}" },
    modes: {
      semicolon: "required",
      block: "delimited",
      typing: "typed",
      array: "fixed",
    },
    languageDocumentation: {},
  };
}

function renderPanel(customization = createCustomization()) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  act(() => {
    root.render(
      <CategoryLexemesList
        activeLanguage={{
          key: "test-language",
          name: "Test Language",
          description: "A language for tests",
          imageUrl: "",
          customization,
        }}
        handleLexemeClick={vi.fn()}
        locale="en"
      />,
    );
  });

  return { container, root, customization };
}

function clickButtonByLabel(container: HTMLElement, label: string) {
  const button = container.querySelector(
    `button[aria-label="${label}"]`,
  ) as HTMLButtonElement | null;
  expect(button).toBeInstanceOf(HTMLButtonElement);

  act(() => {
    button?.dispatchEvent(
      new MouseEvent("click", { bubbles: true, cancelable: true }),
    );
  });
}

function clickButtonByText(container: HTMLElement, text: string) {
  const button = Array.from(container.querySelectorAll("button")).find(
    (candidate) => candidate.textContent?.includes(text),
  );
  expect(button).toBeDefined();

  act(() => {
    button?.dispatchEvent(
      new MouseEvent("click", { bubbles: true, cancelable: true }),
    );
  });
}

describe("CategoryLexemesList", () => {
  beforeEach(() => {
    useEditorMock.mockReset();
    useEditorMock.mockReturnValue({
      currentFilePath: "src/main.?",
      fileSystem: {
        createOrUpdateFile: vi.fn(),
      },
      updateSourceCode: vi.fn(),
    });
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("opens a language sample preview and overrides the selected file", () => {
    const editor = {
      currentFilePath: "src/main.?",
      fileSystem: {
        createOrUpdateFile: vi.fn(),
      },
      updateSourceCode: vi.fn(),
    };
    useEditorMock.mockReturnValue(editor);
    const { container, root, customization } = renderPanel();
    const expectedCode = buildHelloWorldSample(customization);

    clickButtonByLabel(container, "View language sample");

    expect(container.querySelector('[role="dialog"]')).not.toBeNull();
    expect(container.textContent).toContain("Active language sample");
    expect(container.textContent).toContain('print("What is your name?")');
    expect(container.textContent).toContain('print("hello world, ", name, "!")');

    clickButtonByText(container, "Replace selected file");

    expect(editor.fileSystem.createOrUpdateFile).toHaveBeenCalledWith(
      "src/main.?",
      expectedCode,
    );
    expect(editor.updateSourceCode).toHaveBeenCalledWith(expectedCode);
    expect(container.querySelector('[role="dialog"]')).toBeNull();

    act(() => {
      root.unmount();
    });
  });
});
