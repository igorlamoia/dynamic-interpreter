import { motion } from "motion/react";
import {
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from "react";
import { SideExplorer } from "./index";
import { DebugPanel, type DebugPanelProps } from "./debug-panel";
import { LanguagePanel } from "./language-panel";
import { SearchPanel } from "./search-panel";

function getMinSidebarWidth() {
  if (window.innerWidth >= 1280) return 400;
  if (window.innerWidth >= 1024) return 320;
  return 230;
}

export type SidebarView =
  | "explorer"
  | "search"
  | "language"
  | "debug"
  | "settings";

interface SidebarPanelProps {
  activeView: SidebarView;
  activeFile: string;
  debugPanelProps?: DebugPanelProps;
  setActiveFile: (path: string) => void;
  setOpenTabs: (paths: string[] | ((prev: string[]) => string[])) => void;
}

export function SidebarPanel({
  activeView,
  activeFile,
  debugPanelProps,
  setActiveFile,
  setOpenTabs,
}: SidebarPanelProps) {
  const [width, setWidth] = useState(getMinSidebarWidth());
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartRef = useRef({
    pointerX: 0,
    width: getMinSidebarWidth(),
  });

  const handleResizeStart = (event: PointerEvent<HTMLDivElement>) => {
    resizeStartRef.current = {
      pointerX: event.clientX,
      width:
        event.currentTarget.parentElement?.getBoundingClientRect().width ??
        width,
    };
    setIsResizing(true);
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  };

  const handleResize = (event: PointerEvent<HTMLDivElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;

    const nextWidth =
      resizeStartRef.current.width +
      event.clientX -
      resizeStartRef.current.pointerX;
    setWidth(Math.max(getMinSidebarWidth(), nextWidth));
  };

  useEffect(() => {
    if (!isResizing) return;

    const previousCursor = document.body.style.cursor;
    const previousUserSelect = document.body.style.userSelect;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    return () => {
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousUserSelect;
    };
  }, [isResizing]);

  const handleFileSelect = (filePath: string) => {
    setActiveFile(filePath);
    if (!setOpenTabs) return;

    setOpenTabs((prev) => {
      if (prev.includes(filePath)) return prev;
      return [...prev, filePath];
    });
  };

  let content: ReactNode;

  switch (activeView) {
    case "explorer":
      content = (
        <SideExplorer
          activeFile={activeFile}
          setActiveFile={setActiveFile}
          setOpenTabs={setOpenTabs}
        />
      );
      break;
    case "search":
      content = <SearchPanel onFileSelect={handleFileSelect} />;
      break;
    case "language":
      content = <LanguagePanel />;
      break;
    case "debug":
      content = <DebugPanel {...debugPanelProps} />;
      break;
    case "settings":
      content = (
        <div className="flex h-full items-center justify-center p-4 text-xs text-muted-foreground">
          Configurações em breve...
        </div>
      );
      break;
    default:
      content = null;
  }

  return (
    <motion.div
      initial={{ x: "-5%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="relative flex min-h-0 min-w-full sm:min-w-[200px] flex-none flex-col overflow-visible border-r border-black/10 lg:min-w-80 xl:min-w-[400px] dark:border-white/10"
      style={{ width }}
      transition={{
        type: "spring",
        damping: 20,
        duration: 0.8,
        stiffness: 300,
      }}
    >
      {content}
      <div
        role="separator"
        aria-label="Resize sidebar"
        aria-orientation="vertical"
        className="absolute inset-y-0 -right-1 z-10 w-2 touch-none cursor-col-resize"
        onPointerDown={handleResizeStart}
        onPointerMove={handleResize}
        onLostPointerCapture={() => setIsResizing(false)}
      />
    </motion.div>
  );
}
