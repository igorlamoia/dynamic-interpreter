// @vitest-environment jsdom

import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EditorContext } from "@/contexts/editor/EditorContext";
import { MainSection } from "./main-section";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

const mocks = vi.hoisted(() => ({
  editorProps: [] as Array<{ bottomPadding?: number }>,
  saveCurrentFile: vi.fn(),
}));

vi.mock("next/dynamic", () => ({
  default: () =>
    function TerminalStub() {
      return <div data-testid="terminal-view" />;
    },
}));

vi.mock("@/components/editor", () => ({
  Editor: (props: { bottomPadding?: number }) => {
    mocks.editorProps.push(props);
    return <div data-testid="editor" />;
  },
}));

vi.mock("@/components/home-screen", () => ({
  HomeScreen: () => <div data-testid="home-screen" />,
}));

vi.mock("./open-files-list", () => ({
  OpenFIlesList: () => <div data-testid="open-files-list" />,
}));

function renderMainSection(isTerminalOpen: boolean) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  act(() => {
    root.render(
      <EditorContext.Provider
        value={
          {
            saveCurrentFile: mocks.saveCurrentFile,
          } as unknown as React.ContextType<typeof EditorContext>
        }
      >
        <MainSection
          activeFile="src/main.?"
          debugSession={undefined}
          intermediateCode={{ instructions: [] }}
          isTerminalOpen={isTerminalOpen}
          openTabs={["src/main.?"]}
          setActiveFile={vi.fn()}
          setOpenTabs={vi.fn()}
          toggleTerminal={vi.fn()}
        />
      </EditorContext.Provider>,
    );
  });

  return { root };
}

describe("MainSection terminal editor spacing", () => {
  beforeEach(() => {
    mocks.editorProps = [];
    mocks.saveCurrentFile.mockClear();
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("reserves scrollable editor space when the terminal is open", () => {
    const { root } = renderMainSection(true);

    expect(mocks.editorProps.at(-1)).toEqual({ bottomPadding: 320 });

    act(() => {
      root.unmount();
    });
  });

  it("removes the editor reserve when the terminal is closed", () => {
    const { root } = renderMainSection(false);

    expect(mocks.editorProps.at(-1)).toEqual({ bottomPadding: 0 });

    act(() => {
      root.unmount();
    });
  });
});
