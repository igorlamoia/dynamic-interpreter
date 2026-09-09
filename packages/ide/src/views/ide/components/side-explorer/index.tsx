import {
  ChevronRight,
  FileCode2,
  FileText,
  Folder,
  FolderOpen,
} from "lucide-react";
import { useState, useRef } from "react";
import { useExplorer } from "@/hooks/useExplorer";
import type { TreeNode } from "@/hooks/useExplorer";
import { HoverOptions } from "./hover-options";
import { PerfectScrollbar } from "@/components/ui/perfect-scrollbar";

interface SideExplorerProps {
  activeFile: string;
  setActiveFile: (path: string) => void;
  setOpenTabs: (paths: string[] | ((prev: string[]) => string[])) => void;
}

export function SideExplorer({
  activeFile,
  setActiveFile,
  setOpenTabs,
}: SideExplorerProps) {
  const [dragOverPath, setDragOverPath] = useState<string | null>(null);
  const dragTimerRef = useRef<NodeJS.Timeout | null>(null);

  const explorer = useExplorer({
    activeFile,
    setActiveFile,
    setOpenTabs,
  });

  const renderInlineEntry = (parentPath: string, depth: number) => {
    if (
      !explorer.pendingEntry ||
      explorer.pendingEntry.parentPath !== parentPath
    )
      return null;
    const isFile = explorer.pendingEntry.type === "file";
    return (
      <div
        className="flex w-full items-start gap-2 rounded-md px-2 py-1 text-left text-xs"
        style={{ paddingLeft: depth * 12 + 24 }}
      >
        {isFile ? (
          <FileCode2 className="h-3.5 w-3.5 text-emerald-300" />
        ) : (
          <Folder className="h-3.5 w-3.5 text-cyan-300" />
        )}
        <div className="flex w-full flex-col">
          <InlineNameInput
            defaultValue={explorer.pendingEntry.name}
            onSubmit={explorer.submitCreate}
            onCancel={explorer.cancelInlineEdit}
          />
          {explorer.inlineError && (
            <span className="mt-1 text-[10px] text-rose-400">
              {explorer.inlineError}
            </span>
          )}
        </div>
      </div>
    );
  };

  const renderTree = (nodes: TreeNode[], depth = 0) => {
    const treeElements = nodes.map((node) => {
      if (node.type === "folder") {
        const isOpen = explorer.openFolders.includes(node.path);

        if (explorer.renameTarget && explorer.renameTarget.path === node.path) {
          return (
            <div
              key={node.path}
              className="flex w-full items-start gap-2 rounded-md px-2 py-1 text-left text-xs"
              style={{ paddingLeft: depth * 12 + 8 }}
            >
              <Folder className="h-3.5 w-3.5 text-cyan-300" />
              <div className="flex w-full flex-col">
                <InlineNameInput
                  defaultValue={explorer.renameTarget.name}
                  onSubmit={explorer.submitRename}
                  onCancel={explorer.cancelInlineEdit}
                />
                {explorer.inlineError && (
                  <span className="mt-1 text-[10px] text-rose-400">
                    {explorer.inlineError}
                  </span>
                )}
              </div>
            </div>
          );
        }

        return (
          <div key={node.path}>
            <button
              type="button"
              draggable
              onClick={() => explorer.toggleFolder(node.path)}
              onDragStart={(event) => {
                event.dataTransfer.setData("text/plain", `folder:${node.path}`);
                event.dataTransfer.effectAllowed = "move";
              }}
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
                setDragOverPath(node.path);
                // Clear any existing timer
                if (dragTimerRef.current) {
                  clearTimeout(dragTimerRef.current);
                }
                // Set timer to open folder after 500ms
                if (!isOpen) {
                  dragTimerRef.current = setTimeout(() => {
                    explorer.toggleFolder(node.path);
                  }, 200);
                }
              }}
              onDragLeave={(event) => {
                // Only clear if we're actually leaving the button element
                if (
                  event.target === event.currentTarget ||
                  !(event.currentTarget as HTMLElement).contains(
                    event.relatedTarget as Node,
                  )
                ) {
                  setDragOverPath(null);
                  // Clear timer when leaving
                  if (dragTimerRef.current) {
                    clearTimeout(dragTimerRef.current);
                    dragTimerRef.current = null;
                  }
                }
              }}
              onDrop={(event) => {
                event.preventDefault();
                setDragOverPath(null);
                // Clear timer on drop
                if (dragTimerRef.current) {
                  clearTimeout(dragTimerRef.current);
                  dragTimerRef.current = null;
                }
                const data = event.dataTransfer.getData("text/plain");
                if (!data) return;

                if (data.startsWith("folder:")) {
                  const sourcePath = data.substring(7);
                  explorer.moveFolder(sourcePath, node.path);
                } else {
                  const fileName = explorer
                    .normalizePath(data)
                    .split("/")
                    .filter(Boolean)
                    .pop();
                  if (!fileName) return;
                  const targetPath = `${node.path}/${fileName}`;
                  explorer.moveFile(data, targetPath);
                }
              }}
              onContextMenu={(event) => {
                event.preventDefault();
                explorer.setContextMenu({
                  x: event.clientX,
                  y: event.clientY,
                  filePath: node.path,
                });
              }}
              className={`group relative flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-xs transition-colors ${
                explorer.selectedItem === node.path
                  ? "bg-white/10 text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              } ${
                dragOverPath === node.path
                  ? "bg-cyan-500/20 border-l-2 border-cyan-500"
                  : dragOverPath && dragOverPath.startsWith(node.path + "/")
                    ? "border-l-2 border-cyan-500/40"
                    : ""
              }`}
              style={{ paddingLeft: depth * 12 + 8 }}
            >
              <ChevronRight
                className={`h-3 w-3 transition-transform ${
                  isOpen ? "rotate-90" : "rotate-0"
                }`}
              />
              {isOpen ? (
                <FolderOpen className="h-3.5 w-3.5 text-cyan-300" />
              ) : (
                <Folder className="h-3.5 w-3.5 text-cyan-300" />
              )}
              <span className="truncate">{node.name}</span>
            </button>
            {isOpen && (
              <div
                className="pointer-events-none"
                onDragEnter={(event) => {
                  event.stopPropagation();
                  setDragOverPath(node.path);
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  event.dataTransfer.dropEffect = "move";
                  setDragOverPath(node.path);
                }}
                onDragLeave={(event) => {
                  event.stopPropagation();
                  setDragOverPath(null);
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setDragOverPath(null);
                  const data = event.dataTransfer.getData("text/plain");
                  if (!data) return;

                  if (data.startsWith("folder:")) {
                    const sourcePath = data.substring(7);
                    explorer.moveFolder(sourcePath, node.path);
                  } else {
                    const fileName = explorer
                      .normalizePath(data)
                      .split("/")
                      .filter(Boolean)
                      .pop();
                    if (!fileName) return;
                    const targetPath = `${node.path}/${fileName}`;
                    explorer.moveFile(data, targetPath);
                  }
                }}
              >
                <div className="pointer-events-auto">
                  {renderInlineEntry(node.path, depth + 1)}
                  {node.children && renderTree(node.children, depth + 1)}
                </div>
              </div>
            )}
          </div>
        );
      }

      if (explorer.renameTarget && explorer.renameTarget.path === node.path) {
        return (
          <div
            key={node.path}
            className="flex w-full items-start gap-2 rounded-md px-2 py-1 text-left text-xs"
            style={{ paddingLeft: depth * 12 + 24 }}
          >
            {node.name.endsWith(".md") ? (
              <FileText className="h-3.5 w-3.5 text-amber-300" />
            ) : (
              <FileCode2 className="h-3.5 w-3.5 text-emerald-300" />
            )}
            <div className="flex w-full flex-col">
              <InlineNameInput
                defaultValue={explorer.renameTarget.name}
                onSubmit={explorer.submitRename}
                onCancel={explorer.cancelInlineEdit}
              />
              {explorer.inlineError && (
                <span className="mt-1 text-[10px] text-rose-400">
                  {explorer.inlineError}
                </span>
              )}
            </div>
          </div>
        );
      }

      return (
        <button
          key={node.path}
          type="button"
          onClick={() => explorer.openFile(node.path)}
          draggable
          onDragStart={(event) => {
            event.dataTransfer.setData("text/plain", node.path);
            event.dataTransfer.effectAllowed = "move";
          }}
          onContextMenu={(event) => {
            event.preventDefault();
            explorer.setContextMenu({
              x: event.clientX,
              y: event.clientY,
              filePath: node.path,
            });
          }}
          className={`flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-xs transition-colors ${
            activeFile === node.path
              ? "bg-white/10 text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
          style={{ paddingLeft: depth * 12 + 24 }}
        >
          {node.name.endsWith(".md") ? (
            <FileText className="h-3.5 w-3.5 text-amber-300" />
          ) : (
            <FileCode2 className="h-3.5 w-3.5 text-emerald-300" />
          )}
          <span className="truncate">{node.name}</span>
        </button>
      );
    });

    return treeElements;
  };

  return (
    <>
      <div className="group flex h-full flex-col">
        <div className="flex items-center justify-between px-3 py-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Explorer
          <HoverOptions
            onCollapseAll={explorer.collapseAll}
            onCreateFile={explorer.createFile}
            onCreateFolder={explorer.createFolder}
          />
        </div>
        <PerfectScrollbar
          className={`flex-1 overflow-auto px-2 pb-4 transition-colors ${
            dragOverPath === "" ? "bg-cyan-500/5" : ""
          }`}
        >
          <div
            className="min-h-full"
            onDragOver={(event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = "move";
              // Only set dragOverPath to empty string if we're not over a folder
              if (!dragOverPath || !dragOverPath.includes("/")) {
                setDragOverPath("");
              }
            }}
            onDragLeave={(event) => {
              if (event.currentTarget === event.target) {
                setDragOverPath(null);
              }
            }}
            onDrop={(event) => {
              event.preventDefault();
              setDragOverPath(null);
              // Clear timer on drop
              if (dragTimerRef.current) {
                clearTimeout(dragTimerRef.current);
                dragTimerRef.current = null;
              }
              const data = event.dataTransfer.getData("text/plain");
              if (!data) return;

              if (data.startsWith("folder:")) {
                const sourcePath = data.substring(7);
                // Extract folder name and move to root
                const folderName = sourcePath.split("/").pop();
                if (!folderName) return;
                explorer.moveFolder(sourcePath, folderName);
              } else {
                const fileName = explorer
                  .normalizePath(data)
                  .split("/")
                  .filter(Boolean)
                  .pop();
                if (!fileName) return;
                explorer.moveFile(data, fileName);
              }
            }}
          >
            {renderInlineEntry("", 0)}
            {renderTree(explorer.tree)}
          </div>
        </PerfectScrollbar>
      </div>
      {explorer.contextMenu && (
        <ContextMenu
          x={explorer.contextMenu.x}
          y={explorer.contextMenu.y}
          onRename={() => {
            if (explorer.folderExists(explorer.contextMenu!.filePath)) {
              explorer.renameFolder(explorer.contextMenu!.filePath);
            } else {
              explorer.renameFile(explorer.contextMenu!.filePath);
            }
          }}
          onDelete={() => {
            if (explorer.folderExists(explorer.contextMenu!.filePath)) {
              explorer.deleteFolder(explorer.contextMenu!.filePath);
            } else {
              explorer.deleteFile(explorer.contextMenu!.filePath);
            }
          }}
        />
      )}
    </>
  );
}

function InlineNameInput({
  defaultValue,
  onSubmit,
  onCancel,
}: {
  defaultValue: string;
  onSubmit: (value: string) => void;
  onCancel: () => void;
}) {
  return (
    <input
      type="text"
      defaultValue={defaultValue}
      autoFocus
      onFocus={(event) => event.currentTarget.select()}
      onBlur={(event) => onSubmit(event.currentTarget.value)}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          onSubmit(event.currentTarget.value);
        }
        if (event.key === "Escape") {
          event.preventDefault();
          onCancel();
        }
      }}
      className="w-full rounded border dark:border-white/10 bg-white/5 px-2 py-1 text-xs text-foreground outline-none focus:dark:border-white/30"
    />
  );
}

function ContextMenu({
  x,
  y,
  onRename,
  onDelete,
}: {
  x: number;
  y: number;
  onRename: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className="fixed z-50 min-w-40 rounded-md border dark:border-white/10 bg-neutral-900/95 py-1 shadow-lg backdrop-blur-sm"
      style={{ left: x, top: y }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={onRename}
        className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-foreground hover:bg-white/10"
      >
        Renomear
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-rose-400 hover:bg-white/10"
      >
        Excluir
      </button>
    </div>
  );
}
