import { useContext } from "react";
import { EditorContext } from "@/contexts/editor/EditorContext";
import { PerfectScrollbar } from "@/components/ui/perfect-scrollbar";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { useRouter } from "next/router";
import { t } from "@/i18n";

export function OpenFIlesList({
  openTabs,
  activeFile,
  closeTab,
  onActiveFileChange,
}: {
  openTabs: string[];
  activeFile: string;
  closeTab: (path: string) => void;
  onActiveFileChange: (path: string) => void;
}) {
  const editorContext = useContext(EditorContext);
  const { locale } = useRouter();

  const handleTabClick = (tab: string) => {
    if (activeFile !== tab) {
      // Save current file before switching
      editorContext.saveCurrentFile(activeFile);
      // Load the new file - this will update activeFile via parent
      editorContext.loadFileContent(tab);
      // Notify parent to update the active file
      onActiveFileChange(tab);
    }
  };

  const handleCloseToRight = (filePath: string) => {
    const currentIndex = openTabs.indexOf(filePath);
    if (currentIndex === -1) return;

    // Close all tabs to the right of the selected tab
    const tabsToClose = openTabs.slice(currentIndex + 1);
    tabsToClose.forEach((tab) => closeTab(tab));
  };

  const handleCloseAll = () => {
    openTabs.forEach((tab) => closeTab(tab));
  };

  return (
    <PerfectScrollbar
      height={4}
      className="flex items-center gap-2 border-b border-black/10 bg-white/5 px-2 py-2 dark:border-white/10"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {openTabs.map((tab) => (
          <motion.div
            key={tab}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <ContextMenu>
              <ContextMenuTrigger asChild>
                <button
                  type="button"
                  onClick={() => handleTabClick(tab)}
                  className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors ${
                    activeFile === tab
                      ? "bg-white/15 text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                >
                  <span className="truncate">{tab}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTab(tab);
                    }}
                    className="ml-1 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </button>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem onSelect={() => closeTab(tab)}>
                  {t(locale, "ui.close")}
                </ContextMenuItem>
                <ContextMenuItem
                  onSelect={() => handleCloseToRight(tab)}
                  disabled={tab === openTabs[openTabs.length - 1]}
                >
                  {t(locale, "ui.close_to_right")}
                </ContextMenuItem>
                <ContextMenuItem onSelect={handleCloseAll}>
                  {t(locale, "ui.close_all")}
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          </motion.div>
        ))}
      </AnimatePresence>
    </PerfectScrollbar>
  );
}
