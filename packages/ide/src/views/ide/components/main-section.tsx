import dynamic from "next/dynamic";
import { OpenFIlesList } from "./open-files-list";
import { Editor } from "@/components/editor";
import { HomeScreen } from "@/components/home-screen";
import { useContext } from "react";
import { EditorContext } from "@/contexts/editor/EditorContext";
import { Instruction } from "@ts-compilator-for-java/compiler/interpreter/constants";
import type { DebugTerminalSession } from "@/components/terminal";
import { IDE_TERMINAL_RESERVED_BOTTOM_PX } from "@/components/terminal/constants";

const TerminalView = dynamic(() => import("@/components/terminal"), {
  ssr: false,
});

interface MainSectionProps {
  openTabs: string[];
  activeFile: string;
  setActiveFile: (file: string) => void;
  setOpenTabs: (paths: string[] | ((prev: string[]) => string[])) => void;
  isTerminalOpen: boolean;
  toggleTerminal: () => void;
  intermediateCode?: { instructions: Instruction[] };
  debugSession?: DebugTerminalSession;
}

export function MainSection({
  openTabs,
  activeFile,
  setActiveFile,
  setOpenTabs,
  isTerminalOpen,
  toggleTerminal,
  intermediateCode,
  debugSession,
}: MainSectionProps) {
  const editorContext = useContext(EditorContext);

  const closeTab = (path: string) => {
    // Only save if closing the currently active file
    // Non-active files are already saved when they were last active
    if (activeFile === path) {
      editorContext.saveCurrentFile(path);
    }

    setOpenTabs((prev) => prev.filter((tab) => tab !== path));
    if (activeFile === path) {
      const fallback = openTabs.find((tab) => tab !== path);
      if (fallback) {
        setActiveFile(fallback);
      } else {
        setActiveFile("");
      }
    }
  };
  return (
    <div className="flex flex-col h-full w-full overflow-x-auto">
      {openTabs.length > 0 && (
        <OpenFIlesList
          openTabs={openTabs}
          activeFile={activeFile}
          closeTab={closeTab}
          onActiveFileChange={setActiveFile}
        />
      )}
      <div className="relative flex-1 overflow-x-auto">
        <div className={openTabs.length === 0 ? "hidden" : "h-full w-full"}>
          <Editor
            bottomPadding={
              isTerminalOpen ? IDE_TERMINAL_RESERVED_BOTTOM_PX : 0
            }
          />
        </div>
        {openTabs.length === 0 && <HomeScreen />}
        <TerminalView
          debugSession={debugSession}
          intermediateCode={intermediateCode?.instructions || []}
          isTerminalOpen={isTerminalOpen}
          toggleTerminal={toggleTerminal}
        />
      </div>
    </div>
  );
}
