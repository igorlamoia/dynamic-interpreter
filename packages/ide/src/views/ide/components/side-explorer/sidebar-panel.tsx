import { SideExplorer } from "./index";
import { DebugPanel } from "./debug-panel";
import { LanguagePanel } from "./language-panel";
import { SearchPanel } from "./search-panel";

export type SidebarView =
  | "explorer"
  | "search"
  | "language"
  | "debug"
  | "settings";

interface SidebarPanelProps {
  activeView: SidebarView;
  activeFile: string;
  setActiveFile: (path: string) => void;
  setOpenTabs: (paths: string[] | ((prev: string[]) => string[])) => void;
}

export function SidebarPanel({
  activeView,
  activeFile,
  setActiveFile,
  setOpenTabs,
}: SidebarPanelProps) {
  const handleFileSelect = (filePath: string) => {
    setActiveFile(filePath);
    if (!setOpenTabs) return;

    setOpenTabs((prev) => {
      if (prev.includes(filePath)) return prev;
      return [...prev, filePath];
    });
  };

  switch (activeView) {
    case "explorer":
      return (
        <SideExplorer
          activeFile={activeFile}
          setActiveFile={setActiveFile}
          setOpenTabs={setOpenTabs}
        />
      );
    case "search":
      return <SearchPanel onFileSelect={handleFileSelect} />;
    case "language":
      return <LanguagePanel />;
    case "debug":
      return <DebugPanel />;
    case "settings":
      return (
        <div className="flex h-full items-center justify-center p-4 text-xs text-muted-foreground">
          Configurações em breve...
        </div>
      );
    default:
      return null;
  }
}
