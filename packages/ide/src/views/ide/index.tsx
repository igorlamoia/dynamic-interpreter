"use client";

import { ShowTokens } from "../tokens/show-tokens";
import { useLexerAnalyse } from "../../hooks/useLexerAnalyse";
import { ListIntermediateCode } from "../tokens/list-intermediate-code";
import { useState, useEffect, useContext, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { Menu } from "./components/menu";
import {
  SidebarPanel,
  SidebarView,
} from "./components/side-explorer/sidebar-panel";
import { SideMenu } from "./components/side-menu";
import {
  TerminalProvider,
  useTerminalContext,
} from "@/contexts/TerminalContext";
import { MainSection } from "./components/main-section";
import { BorderBeam } from "@/components/ui/border-beam";
import { useKeyboardShortcuts } from "@/components/terminal/useKeyboardShortcuts";
import { AnimatePresence } from "motion/react";
import { ScrollArrow } from "@/components/scroll-arrow";
import { EditorContext, EditorProvider } from "@/contexts/editor/EditorContext";
import { QuickFileSearch } from "@/components/quick-file-search";
import { useIntermediatorCode } from "@/hooks/useIntermediatorCode";
import { RuntimeErrorProvider } from "@/contexts/RuntimeErrorContext";
import {
  KeywordProvider,
  useKeywords,
} from "@/contexts/keyword/KeywordContext";
import { useRouter } from "next/router";
import { useDebugSession } from "@/hooks/useDebugSession";
import type { MarkerSeverity } from "monaco-editor";
import type { IssueDetails } from "@ts-compilator-for-java/compiler/issue";
import { ESeverity, type TLineAlert } from "@/@types/editor";
import { useToast } from "@/contexts/ToastContext";
import { getIdeIntl, resolveLocale, t } from "@/i18n";
import { cn } from "@/lib/utils";
import {
  createDefaultFiles,
  createLocaleSyncedDefaultFiles,
} from "./defaultFiles";
import { useLanguageChoices } from "@/hooks/useLanguageChoices";
import { LanguageSampleDialog } from "./components/side-explorer/language-panel";

export function IDEProvider({ children }: { children: React.ReactNode }) {
  return (
    <EditorProvider>
      <TerminalProvider>
        <KeywordProvider>{children}</KeywordProvider>
      </TerminalProvider>
    </EditorProvider>
  );
}

export function IDEView() {
  return (
    <IDEProvider>
      <IDE />
    </IDEProvider>
  );
}
export function IDE({
  className,
  heightClassName = "h-[70vh]",
  showAnalysisPanels = true,
}: {
  className?: string;
  heightClassName?: string;
  showAnalysisPanels?: boolean;
} = {}) {
  const { locale } = useRouter();
  const { showToast } = useToast();
  const {
    buildLexerConfig,
    customization: keywordCustomization,
    isReady: areKeywordsReady,
  } = useKeywords();
  const languageChoices = useLanguageChoices();
  const sampleActiveLanguage = useMemo(() => {
    const activeLanguage = languageChoices.activeLanguage;
    const customization =
      keywordCustomization ?? activeLanguage?.customization;

    if (!customization) return activeLanguage;

    return {
      key: activeLanguage?.key ?? "current",
      name: activeLanguage?.name ?? "Java--",
      description: activeLanguage?.description ?? "",
      imageUrl: activeLanguage?.imageUrl ?? "",
      customization,
    };
  }, [keywordCustomization, languageChoices.activeLanguage]);
  const { handleIntermediateCodeGeneration, intermediateCode } =
    useIntermediatorCode();
  const { handleRun, analyseData, showScrollArrow, setShowScrollArrow } =
    useLexerAnalyse();
  const { isTerminalOpen, setIsTerminalOpen } = useTerminalContext();
  const {
    clearCurrentDebugLine,
    cleanIssues,
    fileSystem,
    getSourceCodeStorageKey,
    getEditorCode,
    loadFileContent,
    selectedDebugLines,
    setCurrentDebugLine,
    showLineIssues,
    sourceCode,
    initialCode,
    storageScope,
    updateSourceCode,
  } = useContext(EditorContext);
  const lexerConfig = buildLexerConfig();

  const showDebugIssues = (
    issues: IssueDetails[],
    showDetails: boolean = false,
  ) => {
    if (issues.length === 0) return;
    const allLineIssues: TLineAlert[] = issues.map((issue) => ({
      message: issue.message,
      startLineNumber: issue.line,
      endLineNumber: issue.line,
      startColumn: issue.column,
      endColumn: 100,
      severity: ESeverity[issue.type] as unknown as MarkerSeverity,
    }));
    showLineIssues(allLineIssues, showDetails);
  };

  const debugSession = useDebugSession({
    breakpoints: selectedDebugLines,
    keywordMap: lexerConfig.keywordMap,
    blockDelimiters: lexerConfig.blockDelimiters,
    indentationBlock: lexerConfig.indentationBlock,
    grammar: lexerConfig.grammar,
    operatorWordMap: lexerConfig.operatorWordMap,
    booleanLiteralMap: lexerConfig.booleanLiteralMap,
    statementTerminatorLexeme: lexerConfig.statementTerminatorLexeme,
    locale,
    onCurrentLineChange: setCurrentDebugLine,
    onIssues: (issues) => {
      showDebugIssues(issues);
      showToast({
        message: t(locale, "toast.lexer_completed_with_warnings"),
        type: "warning",
      });
    },
    onCompileError: (issue) => {
      showDebugIssues([issue], true);
      showToast({
        message: issue.message || t(locale, "toast.error_occurred"),
        type: "error",
      });
    },
  });
  const markDebugSessionStale = debugSession.markStale;

  useEffect(() => {
    markDebugSessionStale(sourceCode);
  }, [markDebugSessionStale, sourceCode]);

  const [activeFile, setActiveFile] = useState("src/main.?");
  const [openTabs, setOpenTabs] = useState<string[]>(["src/main.?"]);
  const syncedTemplateLocaleRef = useRef<string | null>(null);

  // Initialize default files on first load
  useEffect(() => {
    if (!fileSystem.isLoaded) return;

    const defaultFiles = createDefaultFiles(getIdeIntl(locale).files);

    defaultFiles.forEach(({ path, initialCode: fileDefaultCode }) => {
      if (!fileSystem.fileExists(path)) {
        let code = fileDefaultCode;
        if (path === "src/main.?") {
          code =
            initialCode ??
            (storageScope ? "int main() {\n  \n}\n" : fileDefaultCode);
        }
        fileSystem.createOrUpdateFile(path, code);
      }
    });

    // Load the initial active file using the same locale template used above.
    const activeDefaultCode = defaultFiles.find(
      (file) => file.path === activeFile,
    )?.initialCode;
    loadFileContent(activeFile, activeDefaultCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileSystem.isLoaded]);

  // Keep educational template files translated when the interface locale changes.
  // The main program remains user-owned and is not overwritten.
  useEffect(() => {
    if (!fileSystem.isLoaded) return;
    const resolvedLocale = resolveLocale(locale);
    if (syncedTemplateLocaleRef.current === resolvedLocale) return;

    const localizedTemplateFiles = createLocaleSyncedDefaultFiles(
      getIdeIntl(resolvedLocale).files,
    );

    localizedTemplateFiles.forEach(({ path, initialCode: fileDefaultCode }) => {
      fileSystem.createOrUpdateFile(path, fileDefaultCode);
      localStorage.setItem(
        getSourceCodeStorageKey?.(path) ?? `source-code-${path}`,
        fileDefaultCode,
      );
    });

    const activeTemplate = localizedTemplateFiles.find(
      ({ path }) => path === activeFile,
    );
    if (activeTemplate) {
      updateSourceCode(activeTemplate.initialCode);
    }

    syncedTemplateLocaleRef.current = resolvedLocale;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale, fileSystem.isLoaded]);

  // Handle active file changes
  useEffect(() => {
    if (!fileSystem.isLoaded) return;

    const fileData = fileSystem.getFile(activeFile);
    if (fileData) {
      loadFileContent(activeFile);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFile]);

  const scrollToResults = () => {
    window.scrollTo({
      top: 700,
      behavior: "smooth",
    });
    setShowScrollArrow(false);
  };

  const runAll = async () => {
    if (!areKeywordsReady) return;
    const tokens = await handleRun();
    if (!tokens) return;
    const isIntermediateGenerated =
      await handleIntermediateCodeGeneration(tokens);
    if (!isIntermediateGenerated) return;
    setIsTerminalOpen(true);
  };

  const startDebug = () => {
    cleanIssues();
    setIsTerminalOpen(true);
    void debugSession.start(getEditorCode());
  };

  const restartDebug = () => {
    cleanIssues();
    setIsTerminalOpen(true);
    void debugSession.restart(getEditorCode());
  };

  const stopDebug = () => {
    debugSession.stop();
    clearCurrentDebugLine();
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState<SidebarView>("explorer");
  const [isQuickSearchOpen, setIsQuickSearchOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLanguageSampleOpen, setIsLanguageSampleOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const toggleTerminal = () => setIsTerminalOpen(!isTerminalOpen);
  const toggleFullscreen = () => setIsFullscreen((current) => !current);
  useKeyboardShortcuts(
    toggleTerminal,
    isTerminalOpen,
    setIsSidebarOpen,
    setActiveView,
    setIsQuickSearchOpen,
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isFullscreen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isFullscreen]);

  const ideContent = (
    <>
      <div
        data-tour="ide-shell"
        data-testid="ide-shell"
        className={cn(
          "relative max-w-full min-w-0 rounded-2xl",
          className,
          isFullscreen &&
            "fixed inset-0 z-[100] h-[100dvh] w-[100dvw] overflow-hidden rounded-none bg-background p-2 sm:p-4",
        )}
      >
        <div
          className={cn(
            "min-w-0 rounded-2xl border border-black/10 bg-gray-100/70 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.8)] dark:border-white/10 dark:bg-black/20",
            isFullscreen && "flex h-full min-h-0 w-full flex-1 flex-col rounded-xl",
          )}
        >
          <Menu
            handleRun={handleRun}
            isRunDisabled={!areKeywordsReady}
            isFullscreen={isFullscreen}
            onHelp={() => setIsLanguageSampleOpen(true)}
            runAll={runAll}
            toggleFullscreen={toggleFullscreen}
            toggleTerminal={toggleTerminal}
          />
          <div
            className={cn(
              "flex min-w-0 overflow-hidden rounded-b-2xl",
              isFullscreen ? "min-h-0 flex-1" : heightClassName,
            )}
          >
            <AnimatePresence>
              <div className="flex h-full w-full min-w-0 flex-1 flex-col sm:flex-row">
                <SideMenu
                  isSidebarOpen={isSidebarOpen}
                  setIsSidebarOpen={setIsSidebarOpen}
                  activeView={activeView}
                  setActiveView={setActiveView}
                />
                {isSidebarOpen && (
                  <SidebarPanel
                    activeView={activeView}
                    activeFile={activeFile}
                    debugPanelProps={{
                      breakpoints: selectedDebugLines,
                      boundBreakpoints: debugSession.boundBreakpoints,
                      locale,
                      unboundBreakpoints: debugSession.unboundBreakpoints,
                      snapshot: debugSession.snapshot,
                      error: debugSession.error,
                      isStale: debugSession.isStale,
                      onStart: startDebug,
                      onContinue: () => {
                        void debugSession.continueExecution();
                      },
                      onStepInto: () => {
                        void debugSession.stepInto();
                      },
                      onStepOver: () => {
                        void debugSession.stepOver();
                      },
                      onStepOut: () => {
                        void debugSession.stepOut();
                      },
                      onRestart: restartDebug,
                      onStop: stopDebug,
                    }}
                    languageChoices={languageChoices}
                    setActiveFile={setActiveFile}
                    setOpenTabs={setOpenTabs}
                  />
                )}
                <MainSection
                  activeFile={activeFile}
                  setActiveFile={setActiveFile}
                  openTabs={openTabs}
                  setOpenTabs={setOpenTabs}
                  isTerminalOpen={isTerminalOpen}
                  toggleTerminal={toggleTerminal}
                  intermediateCode={intermediateCode}
                  debugSession={debugSession}
                  locale={locale}
                />
              </div>
            </AnimatePresence>
          </div>
        </div>
        <BorderBeam
          duration={6}
          size={400}
          className="from-transparent via-sky-900 to-transparent"
        />
        <BorderBeam
          duration={6}
          delay={3}
          size={400}
          borderWidth={2}
          className="from-transparent via-slate-600 to-transparent"
        />
      </div>
      <ScrollArrow show={showScrollArrow} onClick={scrollToResults} />
      <QuickFileSearch
        isOpen={isQuickSearchOpen}
        onClose={() => setIsQuickSearchOpen(false)}
        onSelectFile={(filePath) => {
          setActiveFile(filePath);
          if (!openTabs.includes(filePath)) {
            setOpenTabs([...openTabs, filePath]);
          }
        }}
      />
      <LanguageSampleDialog
        activeLanguage={sampleActiveLanguage}
        locale={locale}
        open={isLanguageSampleOpen}
        onOpenChange={setIsLanguageSampleOpen}
      />
      {showAnalysisPanels && (
        <div className="flex flex-col gap-4">
          <ShowTokens analyseData={analyseData} />
          <div className="flex flex-col gap-2">
            <ListIntermediateCode
              instructions={intermediateCode.instructions}
            />
          </div>
        </div>
      )}
    </>
  );

  return (
    <RuntimeErrorProvider>
      {isFullscreen && isMounted
        ? createPortal(ideContent, document.body)
        : ideContent}
    </RuntimeErrorProvider>
  );
}
