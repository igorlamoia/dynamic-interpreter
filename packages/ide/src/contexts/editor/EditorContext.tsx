import {
  createContext,
  useRef,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import loader from "@monaco-editor/loader";
import type * as monacoEditor from "monaco-editor";
import { INITIAL_CODE } from "@/utils/compiler/editor/initial-code";
import { TEditorConfig, TEditorContextType, TLineAlert } from "@/@types/editor";
import { ConfigEntity } from "@/entities/editor-config";
import {
  registerJavaMMLanguage,
  JAVAMM_LANGUAGE_ID,
} from "@/utils/compiler/editor/editor-language";
import { getDefaultKeywordMappings } from "@/contexts/keyword/KeywordContext";
import { useFileSystem } from "@/hooks/useFileSystem";
import { EditorSkeleton } from "./EditorSkeleton";
import { DarkTheme, LightTheme } from "./EditorThemes";
import { useDebugger } from "./useDebugger";

export const getSourceCodeStorageKey = (fileName: string, storageScope?: string) =>
  storageScope ? `${storageScope}:source-code-${fileName}` : `source-code-${fileName}`;
const DEFAULT_FILE_NAME = "main.?";

// Create the EditorContext with default values
export const EditorContext = createContext<TEditorContextType>(
  {} as TEditorContextType,
);

export interface EditorProviderProps {
  children: ReactNode;
  storageScope?: string;
  initialCode?: string;
}

export function EditorProvider({
  children,
  storageScope,
  initialCode,
}: EditorProviderProps) {
  const getStorageKey = useCallback(
    (fileName: string) => getSourceCodeStorageKey(fileName, storageScope),
    [storageScope],
  );

  const [currentFilePath, setCurrentFilePath] = useState(DEFAULT_FILE_NAME);
  const currentFilePathRef = useRef(DEFAULT_FILE_NAME);

  const [sourceCode, setSourceCode] = useState(() => {
    if (typeof window === "undefined") return initialCode ?? INITIAL_CODE;
    return (
      localStorage.getItem(getSourceCodeStorageKey(DEFAULT_FILE_NAME, storageScope)) ||
      initialCode ||
      INITIAL_CODE
    );
  });
  const [config, setConfigState] = useState<TEditorConfig>(new ConfigEntity());
  const [loading, setLoading] = useState(true);

  const monacoRef = useRef<typeof monacoEditor | null>(null);
  const editorInstanceRef =
    useRef<monacoEditor.editor.IStandaloneCodeEditor | null>(null);

  const {
    selectedDebugLines,
    clearDebugLines,
    toggleDebugLine,
    setCurrentDebugLine,
    clearCurrentDebugLine,
  } = useDebugger({
    editorInstanceRef,
    monacoRef,
  });

  const fileSystem = useFileSystem(storageScope);

  useEffect(() => {
    loader.init().then((monaco) => {
      monacoRef.current = monaco;
      // Registrar a linguagem Java-- com as keywords padrão
      registerJavaMMLanguage(monaco, getDefaultKeywordMappings());
      monaco.editor.defineTheme("editor-glass-dark", DarkTheme);
      monaco.editor.defineTheme("editor-glass-light", LightTheme);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    return () => {
      if (editorInstanceRef.current) {
        try {
          const code = editorInstanceRef.current.getValue();
          localStorage.setItem(
            getSourceCodeStorageKey(currentFilePathRef.current, storageScope),
            code,
          );
        } catch {
          // ignore if already disposed
        }
        editorInstanceRef.current.dispose();
        editorInstanceRef.current = null;
      }
    };
  }, [storageScope]);

  const initializeEditor = (container: HTMLDivElement) => {
    if (!monacoRef.current || !container) return;

    // Initialize the editor only if it's not already initialized
    if (!editorInstanceRef.current) {
      editorInstanceRef.current = monacoRef.current.editor.create(container, {
        value: sourceCode,
        ...config.editorOptions,
        theme: config.theme,
        language: config.language,
      });

      editorInstanceRef.current.onDidChangeModelContent(() => {
        const nextCode = editorInstanceRef.current?.getValue() ?? "";
        setSourceCode(nextCode);
        localStorage.setItem(getStorageKey(currentFilePathRef.current), nextCode);
      });

      editorInstanceRef.current.onMouseDown((event) => {
        const monaco = monacoRef.current;
        if (!monaco) return;

        const isGutterClick =
          event.target.type ===
            monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN ||
          event.target.type ===
            monaco.editor.MouseTargetType.GUTTER_LINE_NUMBERS;

        if (!isGutterClick) return;

        const lineNumber =
          event.target.position?.lineNumber ??
          event.target.range?.startLineNumber;

        if (!lineNumber) return;
        toggleDebugLine(lineNumber);
      });
    }
  };

  const setConfig = useCallback((newConfig: Partial<TEditorConfig>) => {
    setConfigState((prevConfig) => {
      const updatedConfig = {
        ...prevConfig,
        ...newConfig,
        editorOptions: {
          ...prevConfig.editorOptions,
          ...(newConfig.editorOptions ?? {}),
        },
      };

      if (newConfig.theme && monacoRef.current) {
        localStorage.setItem("theme", newConfig.theme);
        monacoRef.current.editor.setTheme(newConfig.theme);
      }

      if (newConfig.language && editorInstanceRef.current) {
        const model = editorInstanceRef.current.getModel();
        if (model)
          monacoRef.current?.editor.setModelLanguage(model, newConfig.language);
        localStorage.setItem("language", newConfig.language);
      }

      if (newConfig.editorOptions && editorInstanceRef.current) {
        editorInstanceRef.current.updateOptions(newConfig.editorOptions);
      }

      return updatedConfig;
    });
  }, []);

  const updateSourceCode = (newCode: string) => {
    setSourceCode(newCode);
    localStorage.setItem(getStorageKey(currentFilePathRef.current), newCode);
    editorInstanceRef.current?.setValue(newCode);
  };

  const showLineIssues = (alerts: TLineAlert[], triggerError = false) => {
    if (editorInstanceRef.current && monacoRef.current) {
      const model = editorInstanceRef.current.getModel();
      if (!model) return;
      monacoRef.current.editor.setModelMarkers(
        model,
        "owner",
        alerts.map((alert) => ({
          startLineNumber: alert.startLineNumber,
          startColumn: alert.startColumn - 1,
          endLineNumber: alert.endLineNumber,
          endColumn: alert.endColumn - 1,
          message: alert.message,
          severity: alert.severity,
          // tags: [1,2], // unnecessary and deprecated
        })),
      );
      // Center the editor view on the error line
      editorInstanceRef.current.revealLineInCenter(alerts[0].startLineNumber);
      if (!triggerError) return;
      editorInstanceRef.current.trigger(
        "keyboard",
        "editor.action.marker.next",
        {},
      );
    }
  };

  const retokenize = () => {
    if (editorInstanceRef.current && monacoRef.current) {
      const model = editorInstanceRef.current.getModel();
      if (model) {
        // Re-set the language to force Monaco to re-tokenize with updated keywords
        monacoRef.current.editor.setModelLanguage(model, JAVAMM_LANGUAGE_ID);
      }
    }
  };

  const insertTextAtCursor = useCallback(
    (text: string) => {
      const editor = editorInstanceRef.current;
      const monaco = monacoRef.current;

      if (!editor || !monaco) return;

      const selection = editor.getSelection();
      if (!selection) return;

      editor.pushUndoStop();
      editor.executeEdits("language-panel", [
        {
          range: selection,
          text,
          forceMoveMarkers: true,
        },
      ]);
      const nextCode = editor.getValue();
      setSourceCode(nextCode);
      localStorage.setItem(getStorageKey(currentFilePathRef.current), nextCode);
      editor.pushUndoStop();
      editor.focus();
    },
    [getStorageKey],
  );

  const cleanIssues = () => {
    const editor = editorInstanceRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;

    const model = editor.getModel();
    if (!model) return;

    const markers = monaco.editor.getModelMarkers({ resource: model.uri });
    const owners = [
      ...new Set(markers.map((marker) => marker.owner).filter(Boolean)),
    ];

    if (owners.length === 0) {
      monaco.editor.setModelMarkers(model, "owner", []);
    } else {
      owners.forEach((owner) =>
        monaco.editor.setModelMarkers(model, owner, []),
      );
    }

    editor.trigger("keyboard", "closeMarkersNavigation", {});
  };

  const getEditorCode = () => {
    cleanIssues();
    const code = editorInstanceRef.current?.getValue() ?? sourceCode;
    localStorage.setItem(getStorageKey(currentFilePathRef.current), code);
    return code;
  };

  const loadFileContent = useCallback(
    (filePath: string, fileInitialCode?: string) => {
      const fileData = fileSystem.getFile(filePath);
      const storageKey = getStorageKey(filePath);
      const storedCode = localStorage.getItem(storageKey);
      const content =
        storedCode ?? fileData?.content ?? fileInitialCode ?? initialCode ?? INITIAL_CODE;

      clearDebugLines();
      clearCurrentDebugLine();

      setCurrentFilePath(filePath);
      currentFilePathRef.current = filePath;
      setSourceCode(content);
      editorInstanceRef.current?.setValue(content);

      // Ensure file exists in storage
      if (!fileData) {
        fileSystem.createOrUpdateFile(filePath, content);
      }

      // Update localStorage for this file
      localStorage.setItem(storageKey, content);
    },
    [clearDebugLines, clearCurrentDebugLine, fileSystem, getStorageKey, initialCode],
  );

  const saveCurrentFile = useCallback(
    (filePath: string) => {
      const code = editorInstanceRef.current?.getValue() ?? sourceCode;
      fileSystem.createOrUpdateFile(filePath, code);
      localStorage.setItem(getStorageKey(filePath), code);
      setCurrentFilePath(filePath);
      currentFilePathRef.current = filePath;
    },
    [sourceCode, fileSystem, getStorageKey],
  );

  return (
    <EditorContext.Provider
      value={{
        sourceCode,
        config,
        currentFilePath,
        selectedDebugLines,
        fileSystem,
        updateSourceCode,
        toggleDebugLine,
        clearDebugLines,
        setCurrentDebugLine,
        clearCurrentDebugLine,
        setConfig,
        showLineIssues,
        initializeEditor,
        getEditorCode,
        cleanIssues,
        monacoRef,
        retokenize,
        insertTextAtCursor,
        loadFileContent,
        saveCurrentFile,
        storageScope,
        initialCode,
        getSourceCodeStorageKey: getStorageKey,
      }}
    >
      {loading ? <EditorSkeleton /> : children}
    </EditorContext.Provider>
  );
}
