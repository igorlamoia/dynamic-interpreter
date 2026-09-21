"use client";

import { useState, useEffect, useContext, useMemo } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { EditorContext } from "@/contexts/editor/EditorContext";
import type { FileData } from "@/hooks/useFileSystem";
import { Search, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/router";
import { t } from "@/i18n";

interface QuickFileSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFile: (filePath: string) => void;
}

export function QuickFileSearch({
  isOpen,
  onClose,
  onSelectFile,
}: QuickFileSearchProps) {
  const { locale } = useRouter();
  const { fileSystem } = useContext(EditorContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Get all file paths from the file system
  const allFilePaths = useMemo(() => {
    if (!fileSystem.isLoaded) return [];
    const allFiles = fileSystem.getAllFiles?.() || [];
    return (allFiles as FileData[]).map((f: FileData) => f.path).sort();
  }, [fileSystem, fileSystem.isLoaded]);

  // Filter files based on search query
  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) return allFilePaths;

    const query = searchQuery.toLowerCase();
    return allFilePaths.filter((file) => file.toLowerCase().includes(query));
  }, [allFilePaths, searchQuery]);

  // Reset states when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setSelectedIndex((prev) =>
            Math.min(prev + 1, filteredFiles.length - 1),
          );
          break;
        case "ArrowUp":
          event.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "Enter":
          event.preventDefault();
          if (filteredFiles[selectedIndex]) {
            onSelectFile(filteredFiles[selectedIndex]);
            onClose();
          }
          break;
        case "Escape":
          event.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, filteredFiles, onSelectFile, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl p-0 gap-0 top-1/4">
        <div className="flex flex-col">
          {/* Search Input */}
          <div className="flex items-center px-4 py-3 border-b border-black/10 dark:border-white/10">
            <Search className="mr-3 size-4 text-muted-foreground shrink-0" />
            <Input
              autoFocus
              placeholder={t(locale, "ui.quick_search_placeholder")}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedIndex(0);
              }}
              className="border-0 p-0 h-auto focus-visible:ring-0 text-sm"
            />
          </div>

          {/* Files List */}
          <div className="max-h-96 overflow-y-auto">
            {filteredFiles.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                {t(locale, "ui.quick_search_no_files")}
              </div>
            ) : (
              filteredFiles.map((file, index) => (
                <div
                  key={file}
                  onClick={() => {
                    onSelectFile(file);
                    onClose();
                  }}
                  className={cn(
                    "px-4 py-2 text-sm cursor-pointer flex items-center gap-2 transition-colors",
                    index === selectedIndex
                      ? "bg-blue-500/20 text-blue-600 dark:text-blue-400"
                      : "hover:bg-black/5 dark:hover:bg-white/5",
                  )}
                >
                  <FileText className="size-4 shrink-0" />
                  <span className="truncate">{file}</span>
                </div>
              ))
            )}
          </div>

          {/* Footer Info */}
          {filteredFiles.length > 0 && (
            <div className="px-4 py-2 border-t border-black/10 dark:border-white/10 text-xs text-muted-foreground flex justify-between">
              <span>
                {filteredFiles.length}{" "}
                {t(
                  locale,
                  filteredFiles.length === 1
                    ? "ui.quick_search_file_singular"
                    : "ui.quick_search_file_plural",
                )}
              </span>
              <span className="text-xs">
                <kbd className="px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10">
                  Enter
                </kbd>{" "}
                {t(locale, "ui.quick_search_to_open")}
              </span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
