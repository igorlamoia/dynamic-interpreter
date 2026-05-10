"use client";

import { ShowTokens } from "../tokens/show-tokens";
import { useLexerAnalyse } from "../../hooks/useLexerAnalyse";
import { ListIntermediateCode } from "../tokens/list-intermediate-code";
import { useState, useEffect, useContext } from "react";
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
import { AnimatePresence, motion } from "motion/react";
import { ScrollArrow } from "@/components/scroll-arrow";
import { EditorContext, EditorProvider } from "@/contexts/editor/EditorContext";
import { QuickFileSearch } from "@/components/quick-file-search";
import { useIntermediatorCode } from "@/hooks/useIntermediatorCode";
import { RuntimeErrorProvider } from "@/contexts/RuntimeErrorContext";
import { KeywordProvider } from "@/contexts/keyword/KeywordContext";

const DEFAULT_FILES = [
  { path: "src/main.?", initialCode: "// Main file\n" },
  { path: "src/grammar/stmt.?", initialCode: "// Grammar stmt\n" },
  { path: "src/grammar/expr.?", initialCode: "// Grammar expr\n" },
  { path: "src/grammar/token.?", initialCode: "// Grammar token\n" },
  { path: "src/ir/emitter.ts", initialCode: "// IR Emitter\n" },
  { path: "src/ir/interpreter.ts", initialCode: "// Interpreter\n" },
  { path: "tests/lexer.spec.ts", initialCode: "// Lexer tests\n" },
  { path: "README.md", initialCode: "# Project README\n" },
];

export function IDEView() {
  return (
    <EditorProvider>
      <TerminalProvider>
        <KeywordProvider>
          <IDE />
        </KeywordProvider>
      </TerminalProvider>
    </EditorProvider>
  );
}
export function IDE() {
  const { handleIntermediateCodeGeneration, intermediateCode } =
    useIntermediatorCode();
  const { handleRun, analyseData, showScrollArrow, setShowScrollArrow } =
    useLexerAnalyse();
  const { isTerminalOpen, setIsTerminalOpen } = useTerminalContext();
  const { fileSystem, loadFileContent } = useContext(EditorContext);

  const [activeFile, setActiveFile] = useState("src/main.?");
  const [openTabs, setOpenTabs] = useState<string[]>(["src/main.?"]);

  // Initialize default files on first load
  useEffect(() => {
    if (!fileSystem.isLoaded) return;

    DEFAULT_FILES.forEach(({ path, initialCode }) => {
      if (!fileSystem.fileExists(path)) {
        fileSystem.createOrUpdateFile(path, initialCode);
      }
    });

    // Load the initial active file
    loadFileContent(activeFile);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileSystem.isLoaded]);

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
    const tokens = await handleRun();
    if (!tokens) return;
    const isIntermediateGenerated =
      await handleIntermediateCodeGeneration(tokens);
    if (!isIntermediateGenerated) return;
    setIsTerminalOpen(true);
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState<SidebarView>("explorer");
  const [isQuickSearchOpen, setIsQuickSearchOpen] = useState(false);
  const toggleTerminal = () => setIsTerminalOpen(!isTerminalOpen);
  useKeyboardShortcuts(
    toggleTerminal,
    isTerminalOpen,
    setIsSidebarOpen,
    setActiveView,
    setIsQuickSearchOpen,
  );

  return (
    <>
      <RuntimeErrorProvider>
        <div className="relative rounded-2xl">
          <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-gray-100/70 dark:bg-black/20 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.8)]">
            <Menu
              handleRun={handleRun}
              runAll={runAll}
              toggleTerminal={toggleTerminal}
            />
            <div className={`flex h-[70vh] overflow-hidden rounded-b-2xl`}>
              <AnimatePresence>
                <div
                  className={`flex flex-1 flex-col sm:flex-row h-full w-full`}
                >
                  <SideMenu
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                    activeView={activeView}
                    setActiveView={setActiveView}
                  />
                  {isSidebarOpen && (
                    <motion.div
                      initial={{ x: "-5%", opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      className="flex min-h-0 flex-col overflow-visible border-r border-black/10 dark:border-white/10 w-80"
                      transition={{
                        type: "spring",
                        damping: 20,
                        duration: 0.8,
                        stiffness: 300,
                      }}
                    >
                      <SidebarPanel
                        activeView={activeView}
                        activeFile={activeFile}
                        setActiveFile={setActiveFile}
                        setOpenTabs={setOpenTabs}
                      />
                    </motion.div>
                  )}
                  <MainSection
                    activeFile={activeFile}
                    setActiveFile={setActiveFile}
                    openTabs={openTabs}
                    setOpenTabs={setOpenTabs}
                    isTerminalOpen={isTerminalOpen}
                    toggleTerminal={toggleTerminal}
                    intermediateCode={intermediateCode}
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
        <div className="flex flex-col gap-4">
          <ShowTokens analyseData={analyseData} />
          <div className="flex flex-col gap-2">
            <ListIntermediateCode
              instructions={intermediateCode.instructions}
            />
          </div>
        </div>
      </RuntimeErrorProvider>
    </>
  );
}
