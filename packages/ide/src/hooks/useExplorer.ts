import { useState, useEffect, useMemo, useContext, useCallback } from "react";
import { EditorContext } from "@/contexts/editor/EditorContext";
import { useAlert } from "@/components/alert";
import type { FileData } from "@/hooks/useFileSystem";

export type TreeNode = {
  type: "folder" | "file";
  name: string;
  path: string;
  children?: TreeNode[];
};

interface UseExplorerProps {
  activeFile: string;
  setActiveFile: (path: string) => void;
  setOpenTabs: (paths: string[] | ((prev: string[]) => string[])) => void;
}

export function useExplorer({
  activeFile,
  setActiveFile,
  setOpenTabs,
}: UseExplorerProps) {
  const editorContext = useContext(EditorContext);
  const { fileSystem, getSourceCodeStorageKey } = editorContext;
  const { showAlert, showMessage } = useAlert();

  const getFileStorageKey = useCallback(
    (path: string) =>
      getSourceCodeStorageKey
        ? getSourceCodeStorageKey(path)
        : `source-code-${path}`,
    [getSourceCodeStorageKey],
  );

  const [openFolders, setOpenFolders] = useState<string[]>(["src"]);
  const [extraFolders, setExtraFolders] = useState<string[]>([]);
  const [lastSelectedFolder, setLastSelectedFolder] = useState<string>("src");
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [pendingEntry, setPendingEntry] = useState<{
    type: "file" | "folder";
    parentPath: string;
    name: string;
  } | null>(null);
  const [renameTarget, setRenameTarget] = useState<{
    path: string;
    name: string;
  } | null>(null);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    filePath: string;
  } | null>(null);

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  const foldersStorageKey = editorContext.storageScope
    ? `${editorContext.storageScope}:folders-storage`
    : "folders-storage";

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(foldersStorageKey);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as string[];
      if (Array.isArray(parsed)) setExtraFolders(parsed);
    } catch {
      // Ignore invalid storage content
    }
  }, [foldersStorageKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(foldersStorageKey, JSON.stringify(extraFolders));
  }, [extraFolders, foldersStorageKey]);

  // Auto-expand parent folders when activeFile changes from external source
  useEffect(() => {
    if (!activeFile) return;

    // Get parent paths of the active file
    const parts = activeFile
      .replace(/\\/g, "/")
      .replace(/^\/+/, "")
      .replace(/\/+$/, "")
      .split("/")
      .filter(Boolean);
    const parents: string[] = [];
    for (let i = 1; i < parts.length; i += 1) {
      parents.push(parts.slice(0, i).join("/"));
    }

    if (parents.length > 0) {
      setOpenFolders((prev) => {
        const newFolders = new Set([...prev, ...parents]);
        return Array.from(newFolders);
      });
    }
  }, [activeFile]);

  const normalizePath = (path: string) =>
    path.replace(/\\/g, "/").replace(/^\/+/, "").replace(/\/+$/, "");

  const getParentPaths = (path: string) => {
    const parts = normalizePath(path).split("/").filter(Boolean);
    const parents: string[] = [];
    for (let i = 1; i < parts.length; i += 1) {
      parents.push(parts.slice(0, i).join("/"));
    }
    return parents;
  };

  const toggleFolder = (path: string) => {
    setLastSelectedFolder(path);
    setSelectedItem(path);
    setOpenFolders((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path],
    );
  };

  const openFile = (path: string) => {
    // Save current file before switching
    if (activeFile && activeFile !== path) {
      editorContext.saveCurrentFile(activeFile);
    }

    // Expand all parent folders
    const parentPaths = getParentPaths(path);
    setOpenFolders((prev) => {
      const newFolders = new Set([...prev, ...parentPaths]);
      return Array.from(newFolders);
    });

    // Switch to new file
    setActiveFile(path);
    setSelectedItem(path);
    setOpenTabs((prev: string[]) =>
      prev.includes(path) ? prev : [...prev, path],
    );
  };

  const collapseAll = () => {
    setOpenFolders([]);
  };

  const getDefaultParent = () => {
    const folderSet = new Set([
      ...extraFolders,
      ...fileSystem.getAllFiles().flatMap((file) => getParentPaths(file.path)),
    ]);
    if (folderSet.has(lastSelectedFolder)) return lastSelectedFolder;
    if (folderSet.has("src")) return "src";
    return "";
  };

  const folderExists = (path: string) => {
    const normalized = normalizePath(path);
    const folderSet = new Set([
      ...extraFolders,
      ...fileSystem.getAllFiles().flatMap((file) => getParentPaths(file.path)),
    ]);
    return folderSet.has(normalized);
  };

  const moveFile = (currentPath: string, targetPath: string) => {
    if (currentPath === targetPath) return;
    if (fileSystem.fileExists(targetPath)) {
      showMessage("Ja existe um arquivo com esse nome na pasta.");
      return;
    }

    const oldStorageKey = getFileStorageKey(currentPath);
    const newStorageKey = getFileStorageKey(targetPath);
    const storedCode = localStorage.getItem(oldStorageKey);
    if (storedCode !== null) {
      localStorage.setItem(newStorageKey, storedCode);
      localStorage.removeItem(oldStorageKey);
    }

    fileSystem.renameFile(currentPath, targetPath);
    setOpenTabs((prev) =>
      prev.map((tab) => (tab === currentPath ? targetPath : tab)),
    );
    if (activeFile === currentPath) {
      setActiveFile(targetPath);
    }

    const parents = getParentPaths(targetPath);
    setOpenFolders((prev) => Array.from(new Set([...prev, ...parents])));
  };

  const renameFile = (currentPath: string) => {
    setContextMenu(null);
    setInlineError(null);
    const name = normalizePath(currentPath).split("/").pop() || "";
    setPendingEntry(null);
    setRenameTarget({ path: currentPath, name });
  };

  const deleteFile = async (currentPath: string) => {
    setContextMenu(null);
    const confirmed = await showAlert({
      title: "Excluir arquivo",
      description: `Tem certeza que deseja excluir "${currentPath}"?`,
      confirmText: "Excluir",
      cancelText: "Cancelar",
      variant: "destructive",
    });

    if (!confirmed) return;

    fileSystem.deleteFile(currentPath);
    setOpenTabs((prev) => {
      const remaining = prev.filter((tab) => tab !== currentPath);
      if (activeFile === currentPath && remaining.length > 0) {
        setActiveFile(remaining[0]);
      }
      return remaining;
    });
    localStorage.removeItem(getFileStorageKey(currentPath));
  };

  const renameFolder = (currentPath: string) => {
    setContextMenu(null);
    setInlineError(null);
    const name = normalizePath(currentPath).split("/").pop() || "";
    setPendingEntry(null);
    setRenameTarget({ path: currentPath, name });
  };

  const deleteFolder = async (currentPath: string) => {
    setContextMenu(null);
    const normalized = normalizePath(currentPath);
    const childFiles = fileSystem.getAllFiles().filter((file) => {
      const filePath = normalizePath(file.path);
      return filePath.startsWith(`${normalized}/`);
    });

    let confirmMsg = `Tem certeza que deseja excluir a pasta "${currentPath}"?`;
    if (childFiles.length > 0) {
      confirmMsg = `Tem certeza que deseja excluir a pasta "${currentPath}" e ${childFiles.length} arquivo(s) dentro?`;
    }

    const confirmed = await showAlert({
      title: "Excluir pasta",
      description: confirmMsg,
      confirmText: "Excluir",
      cancelText: "Cancelar",
      variant: "destructive",
    });

    if (!confirmed) return;

    // Delete all files inside the folder
    childFiles.forEach((file) => {
      fileSystem.deleteFile(file.path);
      localStorage.removeItem(getFileStorageKey(file.path));
    });

    // Remove folder from extraFolders
    setExtraFolders((prev) =>
      prev.filter((folder) => {
        const f = normalizePath(folder);
        return f !== normalized && !f.startsWith(`${normalized}/`);
      }),
    );

    // Update tabs
    setOpenTabs((prev) => {
      const remaining = prev.filter((tab) => {
        const t = normalizePath(tab);
        return !t.startsWith(`${normalized}/`);
      });
      if (
        activeFile &&
        normalizePath(activeFile).startsWith(`${normalized}/`)
      ) {
        if (remaining.length > 0) {
          setActiveFile(remaining[0]);
        }
      }
      return remaining;
    });
  };

  const moveFolder = (currentPath: string, targetParentPath: string) => {
    const normalized = normalizePath(currentPath);
    const folderName = normalized.split("/").pop();
    if (!folderName) return;

    const newPath = targetParentPath
      ? `${targetParentPath}/${folderName}`
      : folderName;

    if (normalized === newPath) return;
    if (newPath.startsWith(`${normalized}/`)) {
      showMessage("Nao pode mover uma pasta para dentro dela mesma.");
      return;
    }

    if (folderExists(newPath)) {
      showMessage("Ja existe uma pasta com esse nome.");
      return;
    }

    // Move all files
    const childFiles = fileSystem.getAllFiles().filter((file) => {
      const filePath = normalizePath(file.path);
      return filePath.startsWith(`${normalized}/`);
    });

    childFiles.forEach((file) => {
      const filePath = normalizePath(file.path);
      const relativePath = filePath.substring(normalized.length);
      const newFilePath = `${newPath}${relativePath}`;

      const oldStorageKey = getFileStorageKey(file.path);
      const newStorageKey = getFileStorageKey(newFilePath);
      const storedCode = localStorage.getItem(oldStorageKey);
      if (storedCode !== null) {
        localStorage.setItem(newStorageKey, storedCode);
        localStorage.removeItem(oldStorageKey);
      }

      fileSystem.renameFile(file.path, newFilePath);
    });

    // Update folders
    setExtraFolders((prev) => {
      const updated = prev
        .filter((folder) => {
          const f = normalizePath(folder);
          return f !== normalized && !f.startsWith(`${normalized}/`);
        })
        .map((folder) => {
          const f = normalizePath(folder);
          if (f.startsWith(`${normalized}/`)) {
            const relativePath = f.substring(normalized.length);
            return `${newPath}${relativePath}`;
          }
          return folder;
        });

      const parents = getParentPaths(newPath);
      return Array.from(new Set([...updated, ...parents, newPath]));
    });

    // Update tabs
    setOpenTabs((prev) =>
      prev.map((tab) => {
        const t = normalizePath(tab);
        if (t.startsWith(`${normalized}/`)) {
          const relativePath = t.substring(normalized.length);
          return `${newPath}${relativePath}`;
        }
        return tab;
      }),
    );

    if (activeFile && normalizePath(activeFile).startsWith(`${normalized}/`)) {
      const relativePath = normalizePath(activeFile).substring(
        normalized.length,
      );
      setActiveFile(`${newPath}${relativePath}`);
    }

    setOpenFolders((prev) =>
      Array.from(new Set([...prev, ...getParentPaths(newPath), newPath])),
    );
  };

  const createFile = () => {
    setInlineError(null);
    const parentPath = getDefaultParent();
    setRenameTarget(null);
    setPendingEntry({
      type: "file",
      parentPath,
      name: "novo-arquivo.?",
    });
    if (parentPath) {
      setOpenFolders((prev) => Array.from(new Set([...prev, parentPath])));
    }
  };

  const createFolder = () => {
    setInlineError(null);
    const parentPath = getDefaultParent();
    setRenameTarget(null);
    setPendingEntry({
      type: "folder",
      parentPath,
      name: "nova-pasta",
    });
    if (parentPath) {
      setOpenFolders((prev) => Array.from(new Set([...prev, parentPath])));
    }
  };

  const submitRename = (value: string) => {
    if (!renameTarget) return;
    const trimmed = normalizePath(value.trim());
    if (!trimmed) {
      setRenameTarget(null);
      setInlineError(null);
      return;
    }

    const currentParts = normalizePath(renameTarget.path)
      .split("/")
      .filter(Boolean);
    const currentDir = currentParts.slice(0, -1).join("/");
    const targetPath = trimmed.includes("/")
      ? trimmed
      : currentDir
        ? `${currentDir}/${trimmed}`
        : trimmed;

    if (targetPath === renameTarget.path) {
      setRenameTarget(null);
      setInlineError(null);
      return;
    }

    const isFolder = folderExists(renameTarget.path);
    if (isFolder) {
      if (folderExists(targetPath)) {
        setInlineError("Essa pasta ja existe.");
        return;
      }

      const normalized = normalizePath(renameTarget.path);

      // Rename all files inside the folder
      const childFiles = fileSystem.getAllFiles().filter((file) => {
        const filePath = normalizePath(file.path);
        return filePath.startsWith(`${normalized}/`);
      });

      childFiles.forEach((file) => {
        const filePath = normalizePath(file.path);
        const relativePath = filePath.substring(normalized.length);
        const newFilePath = `${targetPath}${relativePath}`;

        const oldStorageKey = getFileStorageKey(file.path);
        const newStorageKey = getFileStorageKey(newFilePath);
        const storedCode = localStorage.getItem(oldStorageKey);
        if (storedCode !== null) {
          localStorage.setItem(newStorageKey, storedCode);
          localStorage.removeItem(oldStorageKey);
        }

        fileSystem.renameFile(file.path, newFilePath);
      });

      // Update folders
      setExtraFolders((prev) => {
        const updated = prev
          .filter((folder) => {
            const f = normalizePath(folder);
            return f !== normalized && !f.startsWith(`${normalized}/`);
          })
          .map((folder) => {
            const f = normalizePath(folder);
            if (f.startsWith(`${normalized}/`)) {
              const relativePath = f.substring(normalized.length);
              return `${targetPath}${relativePath}`;
            }
            return folder;
          });

        const parents = getParentPaths(targetPath);
        return Array.from(new Set([...updated, ...parents, targetPath]));
      });

      // Update tabs
      setOpenTabs((prev) =>
        prev.map((tab) => {
          const t = normalizePath(tab);
          if (t.startsWith(`${normalized}/`)) {
            const relativePath = t.substring(normalized.length);
            return `${targetPath}${relativePath}`;
          }
          return tab;
        }),
      );

      if (
        activeFile &&
        normalizePath(activeFile).startsWith(`${normalized}/`)
      ) {
        const relativePath = normalizePath(activeFile).substring(
          normalized.length,
        );
        setActiveFile(`${targetPath}${relativePath}`);
      }

      if (selectedItem && normalizePath(selectedItem) === normalized) {
        setSelectedItem(targetPath);
      }

      setOpenFolders((prev) => {
        const updated = prev.filter((f) => {
          const p = normalizePath(f);
          return p !== normalized && !p.startsWith(`${normalized}/`);
        });
        return Array.from(
          new Set([...updated, ...getParentPaths(targetPath), targetPath]),
        );
      });
    } else {
      if (fileSystem.fileExists(targetPath)) {
        setInlineError("Esse arquivo ja existe.");
        return;
      }
      moveFile(renameTarget.path, targetPath);
    }

    setRenameTarget(null);
    setInlineError(null);
  };

  const submitCreate = (value: string) => {
    if (!pendingEntry) return;
    const trimmed = normalizePath(value.trim());
    if (!trimmed) {
      setPendingEntry(null);
      setInlineError(null);
      return;
    }

    const targetPath = trimmed.includes("/")
      ? trimmed
      : pendingEntry.parentPath
        ? `${pendingEntry.parentPath}/${trimmed}`
        : trimmed;

    if (pendingEntry.type === "file") {
      if (fileSystem.fileExists(targetPath)) {
        setInlineError("Esse arquivo ja existe.");
        return;
      }
      fileSystem.createOrUpdateFile(targetPath, "");
      const parents = getParentPaths(targetPath);
      setOpenFolders((prev) => Array.from(new Set([...prev, ...parents])));
      openFile(targetPath);
      setPendingEntry(null);
      setInlineError(null);
      return;
    }

    if (folderExists(targetPath)) {
      setInlineError("Essa pasta ja existe.");
      return;
    }

    const parents = getParentPaths(targetPath);
    setExtraFolders((prev) =>
      Array.from(new Set([...prev, ...parents, targetPath])),
    );
    setOpenFolders((prev) =>
      Array.from(new Set([...prev, ...parents, targetPath])),
    );
    setPendingEntry(null);
    setInlineError(null);
  };

  const cancelInlineEdit = () => {
    setPendingEntry(null);
    setRenameTarget(null);
    setInlineError(null);
  };

  const buildTree = useCallback(
    (files: FileData[], folders: string[]): TreeNode[] => {
      const root: TreeNode[] = [];
      const folderIndex = new Map<string, TreeNode>();

      const ensureFolder = (path: string) => {
        if (folderIndex.has(path)) return folderIndex.get(path)!;

        const parts = path.split("/").filter(Boolean);
        const name = parts[parts.length - 1];
        const parentPath = parts.slice(0, -1).join("/");
        const folderNode: TreeNode = {
          type: "folder",
          name,
          path,
          children: [],
        };

        folderIndex.set(path, folderNode);

        if (parentPath) {
          const parent = ensureFolder(parentPath);
          parent.children = parent.children || [];
          parent.children.push(folderNode);
        } else {
          root.push(folderNode);
        }

        return folderNode;
      };

      folders
        .map((folder) => normalizePath(folder))
        .filter(Boolean)
        .forEach((folder) => {
          const parts = folder.split("/").filter(Boolean);
          parts.forEach((_, index) => {
            ensureFolder(parts.slice(0, index + 1).join("/"));
          });
        });

      files.forEach((file) => {
        const normalized = normalizePath(file.path);
        if (!normalized) return;
        const parts = normalized.split("/").filter(Boolean);
        const fileName = parts[parts.length - 1];
        const parentPath = parts.slice(0, -1).join("/");
        const fileNode: TreeNode = {
          type: "file",
          name: fileName,
          path: normalized,
        };

        if (parentPath) {
          const parent = ensureFolder(parentPath);
          parent.children = parent.children || [];
          parent.children.push(fileNode);
        } else {
          root.push(fileNode);
        }
      });

      const sortTree = (nodes: TreeNode[]) => {
        nodes.sort((a, b) => {
          if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
          return a.name.localeCompare(b.name);
        });
        nodes.forEach((node) => {
          if (node.children) sortTree(node.children);
        });
      };

      sortTree(root);
      return root;
    },
    [], // normalizePath is a pure function, doesn't need to be in deps
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only trigger if not in an input field
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const target = selectedItem || activeFile;
      if (!target) return;

      if (event.key === "F2") {
        event.preventDefault();
        if (folderExists(target)) {
          renameFolder(target);
        } else {
          renameFile(target);
        }
      }

      if (event.key === "Delete") {
        event.preventDefault();
        if (folderExists(target)) {
          deleteFolder(target);
        } else {
          deleteFile(target);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFile, selectedItem]);

  const tree = useMemo<TreeNode[]>(
    () => buildTree(fileSystem.getAllFiles(), extraFolders),
    [buildTree, fileSystem, extraFolders],
  );

  return {
    // State
    openFolders,
    selectedItem,
    pendingEntry,
    renameTarget,
    inlineError,
    contextMenu,
    tree,

    // Actions
    toggleFolder,
    openFile,
    collapseAll,
    createFile,
    createFolder,
    renameFile,
    renameFolder,
    deleteFile,
    deleteFolder,
    moveFile,
    moveFolder,
    submitRename,
    submitCreate,
    cancelInlineEdit,
    setContextMenu,

    // Helpers
    folderExists,
    normalizePath,
  };
}
