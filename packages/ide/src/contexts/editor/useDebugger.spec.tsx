// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot, Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useDebugger } from "./useDebugger";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

type DebuggerResult = ReturnType<typeof useDebugger>;

let root: Root | null = null;
let host: HTMLDivElement | null = null;

function renderDebugger() {
  const breakpointCollection = { set: vi.fn() };
  const currentLineCollection = { set: vi.fn() };
  const editor = {
    createDecorationsCollection: vi
      .fn()
      .mockReturnValueOnce(breakpointCollection)
      .mockReturnValueOnce(currentLineCollection),
    revealLineInCenter: vi.fn(),
  };
  const monaco = {
    Range: class Range {
      constructor(
        public startLineNumber: number,
        public startColumn: number,
        public endLineNumber: number,
        public endColumn: number,
      ) {}
    },
    editor: {
      TrackedRangeStickiness: {
        NeverGrowsWhenTypingAtEdges: 1,
      },
    },
  };
  const resultRef: { current: DebuggerResult | null } = { current: null };

  function Harness() {
    resultRef.current = useDebugger({
      editorInstanceRef: { current: editor } as never,
      monacoRef: { current: monaco } as never,
    });
    return null;
  }

  host = document.createElement("div");
  document.body.appendChild(host);
  root = createRoot(host);

  act(() => {
    root!.render(createElement(Harness));
  });

  return {
    breakpointCollection,
    currentLineCollection,
    editor,
    getResult: () => {
      if (!resultRef.current) throw new Error("Hook did not render");
      return resultRef.current;
    },
  };
}

afterEach(() => {
  if (root) {
    act(() => root!.unmount());
  }
  host?.remove();
  root = null;
  host = null;
});

describe("useDebugger", () => {
  it("keeps breakpoint decorations and current execution line decorations separate", () => {
    const { breakpointCollection, currentLineCollection, editor, getResult } =
      renderDebugger();

    act(() => getResult().toggleDebugLine(3));
    expect(breakpointCollection.set).toHaveBeenLastCalledWith([
      expect.objectContaining({
        options: expect.objectContaining({
          glyphMarginClassName: "monaco-breakpoint-glyph",
        }),
      }),
    ]);

    act(() => getResult().setCurrentDebugLine(4));
    expect(editor.revealLineInCenter).toHaveBeenCalledWith(4);
    expect(editor.createDecorationsCollection).toHaveBeenCalledTimes(2);
    expect(currentLineCollection.set).not.toHaveBeenCalled();
    expect(editor.createDecorationsCollection).toHaveBeenLastCalledWith([
      expect.objectContaining({
        options: expect.objectContaining({
          className: "monaco-current-debug-line",
          glyphMarginClassName: "monaco-current-debug-line-glyph",
        }),
      }),
    ]);

    act(() => getResult().clearCurrentDebugLine());
    expect(currentLineCollection.set).toHaveBeenCalledWith([]);
  });
});
