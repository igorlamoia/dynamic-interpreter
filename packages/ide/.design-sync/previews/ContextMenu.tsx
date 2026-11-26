import "./_theme";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@ts-compilator-for-java/ide";
import { X } from "lucide-react";

// Radix ContextMenu has no `open`/`defaultOpen`: a right click is the only way
// to open it, so the preview fires one on the trigger after mount.
const openOnMount = (el: HTMLElement | null) => {
  if (!el) return;
  setTimeout(() => {
    const r = el.getBoundingClientRect();
    el.dispatchEvent(
      new MouseEvent("contextmenu", {
        bubbles: true,
        cancelable: true,
        clientX: r.left + 24,
        clientY: r.bottom + 4,
      }),
    );
  }, 0);
};

const tabs = ["main.java", "fatorial.java", "soma-pares.java"];

export const EditorTab = () => (
  <div className="p-10">
    <div className="flex items-center gap-2 border-b border-black/10 bg-white/5 px-2 py-2 dark:border-white/10">
      {tabs.map((tab, i) => (
        <ContextMenu key={tab}>
          <ContextMenuTrigger asChild ref={i === 1 ? openOnMount : undefined}>
            <button
              type="button"
              className={
                i === 1
                  ? "flex items-center gap-1 rounded-md bg-white/15 px-2 py-1 text-xs text-foreground"
                  : "flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-white/5 hover:text-foreground"
              }
            >
              <span className="truncate">{tab}</span>
              <X className="ml-1 h-3 w-3 text-muted-foreground" />
            </button>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>Fechar</ContextMenuItem>
            <ContextMenuItem disabled={i === tabs.length - 1}>
              Fechar à direita
            </ContextMenuItem>
            <ContextMenuItem>Fechar todas</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      ))}
    </div>
  </div>
);

export const FileExplorer = () => (
  <div className="p-10">
    <ContextMenu>
      <ContextMenuTrigger ref={openOnMount}>
        <div className="w-64 rounded-md border border-dashed border-border dark:border-white/10 px-4 py-3 text-xs text-muted-foreground">
          exercicios/lista-02/fatorial.java
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuLabel>fatorial.java</ContextMenuLabel>
        <ContextMenuSeparator />
        <ContextMenuItem>
          Renomear <ContextMenuShortcut>F2</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          Duplicar <ContextMenuShortcut>Ctrl+D</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem className="text-red-400">
          Excluir <ContextMenuShortcut>Del</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  </div>
);
