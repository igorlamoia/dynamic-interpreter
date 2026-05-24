import type { MarkerSeverity } from "monaco-editor";

export type TLineAlert = {
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
  message: string;
  severity: MarkerSeverity;
};

export enum ESeverity {
  hint = 1,
  info = 2,
  warning = 4,
  error = 8,
}

// Define types
export type TEditorConfig = {
  theme: string;
  language: string;
  editorOptions: monacoEditor.editor.IStandaloneEditorConstructionOptions;
};

import type * as monacoEditor from "monaco-editor";
import type { MutableRefObject } from "react";
import type { useFileSystem } from "@/hooks/useFileSystem";

export type TEditorContextType = {
  sourceCode: string;
  config: TEditorConfig;
  currentFilePath: string;
  selectedDebugLines: number[];
  fileSystem: ReturnType<typeof useFileSystem>;
  updateSourceCode: (newCode: string) => void;
  toggleDebugLine: (lineNumber: number) => void;
  clearDebugLines: () => void;
  setCurrentDebugLine: (lineNumber: number | null) => void;
  clearCurrentDebugLine: () => void;
  setConfig: (newConfig: Partial<TEditorConfig>) => void;
  showLineIssues: (errors: TLineAlert[], showDetails?: boolean) => void;
  initializeEditor: (container: HTMLDivElement) => void;
  getEditorCode: () => string;
  cleanIssues: () => void;
  monacoRef: MutableRefObject<typeof monacoEditor | null>;
  retokenize: () => void;
  insertTextAtCursor: (text: string) => void;
  // File management methods
  loadFileContent: (filePath: string, initialCode?: string) => void;
  saveCurrentFile: (filePath: string) => void;
};
