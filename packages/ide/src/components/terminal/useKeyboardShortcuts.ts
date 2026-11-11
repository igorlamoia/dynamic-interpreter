import React, { useEffect } from "react";
import type { SidebarView } from "@/views/ide/components/side-explorer/sidebar-panel";

export function useKeyboardShortcuts(
  toggleTerminal: () => void,
  isTerminalOpen: boolean,
  setIsSidebarOpen?: React.Dispatch<React.SetStateAction<boolean>>,
  setActiveView?: React.Dispatch<React.SetStateAction<SidebarView>>,
  setIsQuickSearchOpen?: React.Dispatch<React.SetStateAction<boolean>>,
) {
  // Atalhos globais (ctrl+p, ctrl+', ctrl+j, Escape, ctrl+e, ctrl+shift+f)
  useEffect(() => {
    const handleGlobalKeyDown = (event: globalThis.KeyboardEvent) => {
      // Quick file search (Ctrl+P)
      const isQuickSearchShortcut =
        event.ctrlKey && event.code === "KeyP" && !event.shiftKey;

      if (isQuickSearchShortcut) {
        event.preventDefault();
        event.stopPropagation();
        if (setIsQuickSearchOpen) {
          setIsQuickSearchOpen(true);
        }
        return;
      }

      const isToggleShortcut =
        event.ctrlKey && ["Backquote", "KeyJ"].includes(event.code);

      if (isToggleShortcut) {
        event.preventDefault();
        event.stopPropagation();
        toggleTerminal();
      } else if (event.key === "Escape" && isTerminalOpen) {
        toggleTerminal();
      }

      // Atalho para abrir/fechar o sidebar (ctrl+e ou ctrl+b)
      if (
        event.ctrlKey &&
        !event.shiftKey &&
        ["KeyE", "KeyB"].includes(event.code)
      ) {
        event.preventDefault();
        event.stopPropagation();
        if (setIsSidebarOpen) {
          setIsSidebarOpen((prev) => !prev);
        }
      }

      const isSearchShortcut =
        event.ctrlKey &&
        event.shiftKey &&
        (event.code === "KeyF" || event.key.toLowerCase() === "f");

      // Atalho para abrir busca (ctrl+shift+f)
      if (isSearchShortcut) {
        event.preventDefault();
        event.stopPropagation();
        if (setActiveView && setIsSidebarOpen) {
          setActiveView("search");
          setIsSidebarOpen(true);
        }
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown, {
      capture: true,
    });
    return () =>
      document.removeEventListener("keydown", handleGlobalKeyDown, {
        capture: true,
      });
  }, [
    toggleTerminal,
    isTerminalOpen,
    setIsSidebarOpen,
    setActiveView,
    setIsQuickSearchOpen,
  ]);
}
