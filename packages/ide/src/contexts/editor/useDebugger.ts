import { useCallback, useEffect, useRef, useState } from "react";
import type * as monacoEditor from "monaco-editor";
import type { RefObject } from "react";

type UseDebuggerParams = {
  editorInstanceRef: RefObject<monacoEditor.editor.IStandaloneCodeEditor | null>;
  monacoRef: RefObject<typeof monacoEditor | null>;
};

export function useDebugger({
  editorInstanceRef,
  monacoRef,
}: UseDebuggerParams) {
  const [selectedDebugLines, setSelectedDebugLines] = useState<number[]>([]);
  const debugLineDecorationsRef =
    useRef<monacoEditor.editor.IEditorDecorationsCollection | null>(null);
  const currentDebugLineDecorationsRef =
    useRef<monacoEditor.editor.IEditorDecorationsCollection | null>(null);

  const applyDebugLineDecorations = useCallback(
    (lines: number[]) => {
      const editor = editorInstanceRef.current;
      const monaco = monacoRef.current;
      if (!editor || !monaco) return;

      const validLines = [...new Set(lines)].sort((a, b) => a - b);
      const decorations = validLines.map((lineNumber) => ({
        range: new monaco.Range(lineNumber, 1, lineNumber, 1),
        options: {
          isWholeLine: true,
          glyphMarginClassName: "monaco-breakpoint-glyph",
          stickiness:
            monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
        },
      }));

      if (!debugLineDecorationsRef.current) {
        debugLineDecorationsRef.current =
          editor.createDecorationsCollection(decorations);
        return;
      }

      debugLineDecorationsRef.current.set(decorations);
    },
    [editorInstanceRef, monacoRef],
  );

  const applyCurrentDebugLineDecoration = useCallback(
    (lineNumber: number | null) => {
      const editor = editorInstanceRef.current;
      const monaco = monacoRef.current;
      if (!editor || !monaco) return;

      const decorations =
        lineNumber && lineNumber > 0
          ? [
              {
                range: new monaco.Range(lineNumber, 1, lineNumber, 1),
                options: {
                  isWholeLine: true,
                  className: "monaco-current-debug-line",
                  glyphMarginClassName: "monaco-current-debug-line-glyph",
                  stickiness:
                    monaco.editor.TrackedRangeStickiness
                      .NeverGrowsWhenTypingAtEdges,
                },
              },
            ]
          : [];

      if (!currentDebugLineDecorationsRef.current) {
        currentDebugLineDecorationsRef.current =
          editor.createDecorationsCollection(decorations);
        return;
      }

      currentDebugLineDecorationsRef.current.set(decorations);
    },
    [editorInstanceRef, monacoRef],
  );

  const clearDebugLines = useCallback(() => {
    setSelectedDebugLines([]);
  }, []);

  const setCurrentDebugLine = useCallback(
    (lineNumber: number | null) => {
      applyCurrentDebugLineDecoration(lineNumber);
      if (lineNumber && lineNumber > 0) {
        editorInstanceRef.current?.revealLineInCenter(lineNumber);
      }
    },
    [applyCurrentDebugLineDecoration, editorInstanceRef],
  );

  const clearCurrentDebugLine = useCallback(() => {
    applyCurrentDebugLineDecoration(null);
  }, [applyCurrentDebugLineDecoration]);

  const toggleDebugLine = useCallback((lineNumber: number) => {
    if (lineNumber < 1) return;

    setSelectedDebugLines((prevLines) => {
      if (prevLines.includes(lineNumber)) {
        return prevLines.filter((line) => line !== lineNumber);
      }

      return [...prevLines, lineNumber].sort((a, b) => a - b);
    });
  }, []);

  useEffect(() => {
    applyDebugLineDecorations(selectedDebugLines);
  }, [selectedDebugLines, applyDebugLineDecorations]);

  return {
    selectedDebugLines,
    clearDebugLines,
    toggleDebugLine,
    setCurrentDebugLine,
    clearCurrentDebugLine,
  };
}
