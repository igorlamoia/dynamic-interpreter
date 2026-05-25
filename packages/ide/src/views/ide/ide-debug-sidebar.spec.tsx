// @vitest-environment jsdom

import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { TEditorContextType } from "@/@types/editor";
import { EditorContext } from "@/contexts/editor/EditorContext";
import { IDE } from "./index";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

const mocks = vi.hoisted(() => ({
  buildLexerConfig: vi.fn(),
  continueExecution: vi.fn(),
  restart: vi.fn(),
  setIsTerminalOpen: vi.fn(),
  sidebarPanelProps: [] as Array<{
    activeView: string;
    debugPanelProps?: {
      breakpoints?: number[];
      onStart?: () => void;
      onContinue?: () => void;
      onStepInto?: () => void;
      onStepOver?: () => void;
      onStepOut?: () => void;
      onRestart?: () => void;
      onStop?: () => void;
    };
  }>,
  start: vi.fn(),
  markStale: vi.fn(),
  stepInto: vi.fn(),
  stepOut: vi.fn(),
  stepOver: vi.fn(),
  stop: vi.fn(),
  useDebugSession: vi.fn(),
}));

vi.mock("@/contexts/editor/EditorContext", async () => {
  const ReactModule = await import("react");
  return {
    EditorContext: ReactModule.createContext({}),
    EditorProvider: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
  };
});

vi.mock("@/contexts/keyword/KeywordContext", () => ({
  KeywordProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  useKeywords: () => ({
    buildLexerConfig: mocks.buildLexerConfig,
  }),
}));

vi.mock("@/contexts/RuntimeErrorContext", () => ({
  RuntimeErrorProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

vi.mock("@/contexts/TerminalContext", () => ({
  TerminalProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  useTerminalContext: () => ({
    isTerminalOpen: false,
    setIsTerminalOpen: mocks.setIsTerminalOpen,
  }),
}));

vi.mock("@/hooks/useDebugSession", () => ({
  useDebugSession: mocks.useDebugSession,
}));

vi.mock("@/hooks/useIntermediatorCode", () => ({
  useIntermediatorCode: () => ({
    handleIntermediateCodeGeneration: vi.fn(),
    intermediateCode: { instructions: [] },
  }),
}));

vi.mock("../../hooks/useLexerAnalyse", () => ({
  useLexerAnalyse: () => ({
    analyseData: {},
    handleRun: vi.fn(),
    setShowScrollArrow: vi.fn(),
    showScrollArrow: false,
  }),
}));

vi.mock("@/components/terminal/useKeyboardShortcuts", () => ({
  useKeyboardShortcuts: vi.fn(),
}));

vi.mock("next/router", () => ({
  useRouter: () => ({ locale: "pt-BR" }),
}));

vi.mock("motion/react", () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
  },
}));

vi.mock("@/components/ui/border-beam", () => ({
  BorderBeam: () => null,
}));

vi.mock("@/components/scroll-arrow", () => ({
  ScrollArrow: () => null,
}));

vi.mock("@/components/quick-file-search", () => ({
  QuickFileSearch: () => null,
}));

vi.mock("../tokens/show-tokens", () => ({
  ShowTokens: () => null,
}));

vi.mock("../tokens/list-intermediate-code", () => ({
  ListIntermediateCode: () => null,
}));

vi.mock("./components/menu", () => ({
  Menu: () => null,
}));

vi.mock("./components/main-section", () => ({
  MainSection: () => null,
}));

vi.mock("./components/side-menu", () => ({
  SideMenu: ({
    setActiveView,
    setIsSidebarOpen,
  }: {
    setActiveView: (view: string) => void;
    setIsSidebarOpen: (open: boolean) => void;
  }) => (
    <button
      data-testid="open-debug"
      onClick={() => {
        setActiveView("debug");
        setIsSidebarOpen(true);
      }}
      type="button"
    >
      Debug
    </button>
  ),
}));

vi.mock("./components/side-explorer/sidebar-panel", () => ({
  SidebarPanel: (props: {
    activeView: string;
    debugPanelProps?: {
      breakpoints?: number[];
      onStart?: () => void;
      onContinue?: () => void;
      onStepInto?: () => void;
      onStepOver?: () => void;
      onStepOut?: () => void;
      onRestart?: () => void;
      onStop?: () => void;
    };
  }) => {
    mocks.sidebarPanelProps.push(props);
    return <div data-testid="sidebar-panel">{props.activeView}</div>;
  },
}));

function createEditorContext(): TEditorContextType {
  return {
    cleanIssues: vi.fn(),
    clearCurrentDebugLine: vi.fn(),
    clearDebugLines: vi.fn(),
    config: {} as TEditorContextType["config"],
    currentFilePath: "src/main.?",
    fileSystem: {
      createOrUpdateFile: vi.fn(),
      fileExists: vi.fn(() => true),
      getFile: vi.fn(() => ({ content: "code" })),
      isLoaded: true,
    } as unknown as TEditorContextType["fileSystem"],
    getEditorCode: vi.fn(() => "debug source"),
    initializeEditor: vi.fn(),
    insertTextAtCursor: vi.fn(),
    loadFileContent: vi.fn(),
    monacoRef: { current: null },
    retokenize: vi.fn(),
    saveCurrentFile: vi.fn(),
    selectedDebugLines: [3],
    setConfig: vi.fn(),
    setCurrentDebugLine: vi.fn(),
    showLineIssues: vi.fn(),
    sourceCode: "debug source",
    toggleDebugLine: vi.fn(),
    updateSourceCode: vi.fn(),
  };
}

describe("IDE debug sidebar wiring", () => {
  beforeEach(() => {
    mocks.buildLexerConfig.mockReturnValue({
      blockDelimiters: { open: "{", close: "}" },
      booleanLiteralMap: { false: "false", true: "true" },
      grammar: { semicolonMode: "optional" },
      indentationBlock: false,
      keywordMap: { main: "main" },
      operatorWordMap: { logical_and: "and" },
      statementTerminatorLexeme: ";",
    });
    mocks.continueExecution.mockResolvedValue(null);
    mocks.restart.mockResolvedValue(null);
    mocks.start.mockResolvedValue(null);
    mocks.markStale.mockReturnValue(undefined);
    mocks.stepInto.mockResolvedValue(null);
    mocks.stepOut.mockResolvedValue(null);
    mocks.stepOver.mockResolvedValue(null);
    mocks.stop.mockReturnValue(null);
    mocks.useDebugSession.mockReturnValue({
      boundBreakpoints: [3],
      continueExecution: mocks.continueExecution,
      error: null,
      isStale: false,
      output: ["hello"],
      restart: mocks.restart,
      markStale: mocks.markStale,
      snapshot: null,
      start: mocks.start,
      stepInto: mocks.stepInto,
      stepOut: mocks.stepOut,
      stepOver: mocks.stepOver,
      stop: mocks.stop,
      unboundBreakpoints: [],
    });
    mocks.sidebarPanelProps.length = 0;
  });

  afterEach(() => {
    document.body.innerHTML = "";
    vi.clearAllMocks();
  });

  it("passes editor breakpoints and debug actions into the sidebar", () => {
    const editorContext = createEditorContext();
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(
        <EditorContext.Provider value={editorContext}>
          <IDE />
        </EditorContext.Provider>,
      );
    });

    const debugSessionOptions = mocks.useDebugSession.mock.calls[0][0];
    expect(debugSessionOptions).toMatchObject({
      breakpoints: [3],
      locale: "pt-BR",
      keywordMap: { main: "main" },
      operatorWordMap: { logical_and: "and" },
      statementTerminatorLexeme: ";",
    });
    expect(debugSessionOptions.onCurrentLineChange).toBe(
      editorContext.setCurrentDebugLine,
    );

    act(() => {
      container
        .querySelector('[data-testid="open-debug"]')
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    const debugSidebarProps = mocks.sidebarPanelProps.at(-1)?.debugPanelProps;
    expect(debugSidebarProps?.breakpoints).toEqual([3]);

    act(() => {
      debugSidebarProps?.onStart?.();
      debugSidebarProps?.onContinue?.();
      debugSidebarProps?.onStepInto?.();
      debugSidebarProps?.onStepOver?.();
      debugSidebarProps?.onStepOut?.();
      debugSidebarProps?.onRestart?.();
      debugSidebarProps?.onStop?.();
    });

    expect(mocks.start).toHaveBeenCalledWith("debug source");
    expect(mocks.continueExecution).toHaveBeenCalled();
    expect(mocks.stepInto).toHaveBeenCalled();
    expect(mocks.stepOver).toHaveBeenCalled();
    expect(mocks.stepOut).toHaveBeenCalled();
    expect(mocks.restart).toHaveBeenCalledWith("debug source");
    expect(mocks.stop).toHaveBeenCalled();

    act(() => {
      root.unmount();
    });
  });

  it("marks the debug session stale when the editor source changes", () => {
    const editorContext = createEditorContext();
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(
        <EditorContext.Provider value={editorContext}>
          <IDE />
        </EditorContext.Provider>,
      );
    });

    expect(mocks.markStale).toHaveBeenLastCalledWith("debug source");

    act(() => {
      root.render(
        <EditorContext.Provider
          value={{ ...editorContext, sourceCode: "changed source" }}
        >
          <IDE />
        </EditorContext.Provider>,
      );
    });

    expect(mocks.markStale).toHaveBeenLastCalledWith("changed source");

    act(() => {
      root.unmount();
    });
  });
});
