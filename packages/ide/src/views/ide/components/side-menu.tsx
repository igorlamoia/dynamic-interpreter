import IconButton from "@/components/buttons/icon-button";
import {
  BugPlay,
  FileCode2,
  Languages,
  Search,
  Settings,
} from "lucide-react";
import { useRouter } from "next/router";
import type { SidebarView } from "./side-explorer/sidebar-panel";
import { markLanguageCreatorReturn } from "@/lib/language-creator-navigation";

interface SideMenuProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  activeView: SidebarView;
  setActiveView: (view: SidebarView) => void;
}

export function SideMenu({
  isSidebarOpen,
  setIsSidebarOpen,
  activeView,
  setActiveView,
}: SideMenuProps) {
  const handleViewClick = (view: SidebarView) => {
    if (activeView === view && isSidebarOpen) {
      setIsSidebarOpen(false);
    } else {
      setActiveView(view);
      setIsSidebarOpen(true);
    }
  };

  return (
    <div className="flex  flex-1 sm:flex-col h-full px-4 py-2 sm:w-12 items-center gap-4 border-b sm:border-r border-black/10 dark:border-white/10 sm:py-4">
      <IconButton
        selected={isSidebarOpen && activeView === "explorer"}
        onClick={() => handleViewClick("explorer")}
        tooltip="Explorador de arquivos"
      >
        <FileCode2 className="h-4 w-4" />
      </IconButton>
      <IconButton
        selected={isSidebarOpen && activeView === "search"}
        onClick={() => handleViewClick("search")}
        tooltip="Buscar"
      >
        <Search className="h-4 w-4" />
      </IconButton>
      <IconButton
        selected={isSidebarOpen && activeView === "language"}
        onClick={() => handleViewClick("language")}
        tooltip="Linguagens"
      >
        <Languages className="h-4 w-4" />
      </IconButton>
      <IconButton
        selected={isSidebarOpen && activeView === "debug"}
        onClick={() => handleViewClick("debug")}
        tooltip="Debug"
      >
        <BugPlay className="h-4 w-4" />
      </IconButton>
      <ConfigButton />
    </div>
  );
}

function ConfigButton() {
  const router = useRouter();

  return (
    <IconButton
      tooltip="Configurações"
      onClick={() => {
        markLanguageCreatorReturn();
        void router.push("/language-creator");
      }}
    >
      <Settings className="h-4 w-4" />
    </IconButton>
  );
}
